import nodemailer from 'nodemailer';
// @ts-ignore — @types/qrcode not available
import QRCode from 'qrcode';
import { logger } from '../lib/logger.js';

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const brevoApiKey = process.env['BREVO_API_KEY'] || '';
  const brevoSender = process.env['BREVO_USER'] || '';
  const gmailUser   = process.env['SMTP_USER'] || '';
  const gmailPass   = (process.env['SMTP_PASS'] || '').replace(/\s/g, '');

  if (brevoApiKey && brevoSender) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': brevoApiKey },
        body: JSON.stringify({
          sender:      { name: 'VISITORPASS', email: brevoSender },
          to:          [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (res.ok) {
        logger.info({ to, method: 'brevo-api' }, 'Email sent successfully');
        return true;
      }
      const errBody = await res.text().catch(() => '');
      logger.error({ status: res.status, body: errBody, to }, 'Brevo API returned error');
      return false;
    } catch (err: any) {
      logger.error({ err: { message: err?.message }, to }, 'Brevo API request failed');
      return false;
    }
  }

  if (!gmailUser || !gmailPass) {
    logger.error('No email credentials — set BREVO_API_KEY+BREVO_USER or SMTP_USER+SMTP_PASS');
    return false;
  }
  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 587, secure: false,
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 20000, greetingTimeout: 15000, socketTimeout: 20000,
    } as Parameters<typeof nodemailer.createTransport>[0]);
    await transport.sendMail({ from: `"VISITORPASS" <${gmailUser}>`, to, subject, html, text });
    logger.info({ to, method: 'gmail-smtp' }, 'Email sent successfully');
    return true;
  } catch (err: any) {
    logger.error({ err: { message: err?.message, code: err?.code }, to }, 'Gmail SMTP send failed');
    return false;
  }
}

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#F0F4FA;">
      <div style="background:#fff;border-radius:16px;padding:36px;box-shadow:0 4px 24px rgba(10,31,68,0.08);">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#0A1F44;border-radius:12px;padding:10px 20px;">
            <span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:0.15em;">VISITORPASS</span>
          </div>
        </div>
        <h2 style="color:#0A1F44;font-size:20px;font-weight:800;margin:0 0 8px;">Email Verification</h2>
        <p style="color:#6B7FA3;font-size:14px;margin:0 0 28px;">Use the code below to verify your identity. Valid for 10 minutes.</p>
        <div style="background:#F0F4FA;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-size:36px;font-weight:900;letter-spacing:0.3em;color:#0A1F44;">${otp}</span>
        </div>
        <p style="color:#A0AEC0;font-size:12px;margin:0;">Do not share this code with anyone. If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(to, 'Your VISITORPASS Email OTP', html, `Your VISITORPASS OTP is: ${otp}. Valid for 10 minutes.`);
}

function fmt12h(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

function visitorApprovedHtml(
  name: string,
  qrToken: string,
  visitId: string,
  qrImageUrl: string,
  scheduledTime?: string,
  fromTime?: string,
  createdAt?: string,
): string {
  const year = new Date().getFullYear();

  const dateSource = scheduledTime || createdAt || new Date().toISOString();
  const meetingDate = new Date(dateSource).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const meetingTime = fromTime ? fmt12h(fromTime) : '';

  // Colours — dark-navy palette that looks great in both light & dark mode
  // because the email itself IS dark. No inversion surprises.
  const BG      = '#0B1E45';   // deep navy — outer wrapper
  const CARD    = '#0F2454';   // slightly lighter card bg
  const PANEL   = '#152B60';   // inner panels / sections
  const BORDER  = '#1E3A7A';   // subtle divider
  const WHITE   = '#ffffff';
  const GOLD    = '#F59E0B';   // accent — approved badge / icons
  const GREEN   = '#22C55E';
  const DIM     = 'rgba(255,255,255,0.55)';
  const DIMMER  = 'rgba(255,255,255,0.35)';

  const steps: [string, string, string][] = [
    ['01', 'Arrive at reception',       'Head to the main security desk at the entrance.'],
    ['02', 'Show this QR code',          'Open this email and display the code on your screen.'],
    ['03', 'Get scanned &amp; verified', 'The officer scans your QR — identity confirmed instantly.'],
    ['04', 'Collect your pass',          'Receive your physical visitor pass and proceed inside.'],
  ];

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<title>Visit Approved — VISITORPASS</title>
<style>
  body,table,td,p,a,h1,h2,h3{margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;}
  body{background:${BG};}
  img{border:0;display:block;}
  @media only screen and (max-width:600px){
    .outer{padding:16px 0 !important;}
    .card{border-radius:16px !important;}
    .hero-pad{padding:28px 20px !important;}
    .body-pad{padding:20px 16px !important;}
    .qr-img{width:180px !important;height:180px !important;}
    .step-title{font-size:13px !important;}
    .step-desc{font-size:11px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BG};">
<table width="100%" cellpadding="0" cellspacing="0" class="outer" style="background:${BG};padding:32px 0;">
<tr><td align="center" style="padding:0 12px;">

  <!-- CARD -->
  <table width="100%" cellpadding="0" cellspacing="0" class="card" style="max-width:560px;border-radius:20px;overflow:hidden;border:1px solid ${BORDER};">

    <!-- ── HEADER ── -->
    <tr>
      <td style="background:${CARD};padding:22px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 2px;font-size:9px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:${DIMMER};">VTS Infosoft</p>
            <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:0.04em;color:${WHITE};">VISITOR<span style="color:${GOLD};">PASS</span></p>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;background:${GREEN};color:${WHITE};font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">&#10003;&nbsp;Approved</span>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- ── HERO ── -->
    <tr>
      <td class="hero-pad" style="background:${PANEL};padding:36px 28px 32px;text-align:center;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
        <p style="font-size:38px;margin:0 0 14px;">&#128274;</p>
        <h1 style="font-size:22px;font-weight:900;color:${WHITE};margin:0 0 10px;letter-spacing:-0.02em;">You&rsquo;re cleared to visit</h1>
        <p style="font-size:14px;color:${DIM};line-height:1.7;margin:0;">Hi <strong style="color:${WHITE};">${name}</strong>,<br/>your visit has been <strong style="color:${GREEN};">approved</strong>. Show the QR below at reception to check in instantly.</p>
      </td>
    </tr>

    <!-- ── QR SECTION ── -->
    <tr>
      <td class="body-pad" style="background:${CARD};padding:28px 28px 24px;text-align:center;border-bottom:1px solid ${BORDER};">
        <p style="font-size:9px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 20px;">Your Digital Gate Pass</p>
        <!-- QR image: always white background so the code is scannable -->
        <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
          <tr><td style="background:#ffffff;border-radius:16px;padding:14px;box-shadow:0 0 0 4px rgba(245,158,11,0.25);">
            <img src="${qrImageUrl}" class="qr-img" width="200" height="200" alt="QR Access Code" style="display:block;border-radius:8px;"/>
          </td></tr>
        </table>
        <!-- Token -->
        <p style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;letter-spacing:0.14em;color:${DIM};background:${PANEL};display:inline-block;padding:9px 18px;border-radius:8px;border:1px solid ${BORDER};margin:0;">${qrToken}</p>
        <p style="font-size:10px;color:${DIMMER};margin:12px 0 0;">Scan this code at the reception desk</p>
      </td>
    </tr>

    <!-- ── SCHEDULE ── -->
    ${(meetingDate || meetingTime) ? `
    <tr>
      <td class="body-pad" style="background:${PANEL};padding:20px 28px;border-bottom:1px solid ${BORDER};">
        <p style="font-size:9px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};margin:0 0 14px;">Meeting Schedule</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${meetingDate ? `<td style="vertical-align:top;padding-right:12px;">
            <p style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${DIMMER};margin:0 0 4px;">Date</p>
            <p style="font-size:15px;font-weight:700;color:${WHITE};margin:0;">${meetingDate}</p>
          </td>` : ''}
          ${meetingTime ? `<td style="vertical-align:top;text-align:right;">
            <p style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${DIMMER};margin:0 0 4px;">Time</p>
            <p style="font-size:22px;font-weight:900;color:${GOLD};margin:0;">${meetingTime}</p>
          </td>` : ''}
        </tr></table>
      </td>
    </tr>` : ''}

    <!-- ── HOW TO CHECK IN ── -->
    <tr>
      <td class="body-pad" style="background:${CARD};padding:24px 28px;border-bottom:1px solid ${BORDER};">
        <p style="font-size:9px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:${DIMMER};margin:0 0 16px;">How to check in</p>
        ${steps.map(([n, t, d], i) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="${i < steps.length - 1 ? `border-bottom:1px solid ${BORDER};` : ''}padding:12px 0;">
          <tr>
            <td style="vertical-align:top;width:36px;">
              <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${PANEL};border:1px solid ${BORDER};border-radius:8px;font-size:9px;font-weight:900;color:${GOLD};letter-spacing:0.04em;">${n}</span>
            </td>
            <td style="vertical-align:top;padding-left:12px;">
              <p class="step-title" style="font-size:14px;font-weight:700;color:${WHITE};margin:0 0 3px;">${t}</p>
              <p class="step-desc" style="font-size:12px;color:${DIM};line-height:1.5;margin:0;">${d}</p>
            </td>
          </tr>
        </table>`).join('')}
      </td>
    </tr>

    <!-- ── REFERENCE ── -->
    <tr>
      <td class="body-pad" style="background:${PANEL};padding:18px 28px;border-bottom:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;">
            <p style="font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${DIMMER};margin:0 0 4px;">Visit Reference</p>
            <p style="font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;color:${WHITE};margin:0;letter-spacing:0.06em;">${visitId}</p>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="font-size:22px;">&#128203;</span>
          </td>
        </tr></table>
      </td>
    </tr>

    <!-- ── FOOTER ── -->
    <tr>
      <td style="background:${BG};padding:20px 28px;text-align:center;">
        <p style="font-size:11px;color:${DIMMER};line-height:1.7;margin:0 0 6px;">This QR code is for your personal use only — do not share it.<br/>If you did not request this visit, please ignore this email.</p>
        <p style="font-size:10px;color:rgba(255,255,255,0.2);margin:0;">&copy; ${year} VTS Infosoft &middot; VISITORPASS Enterprise</p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

function visitorRejectedHtml(name: string, visitId: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Visit Request Update</title>
</head>
<body style="margin:0;padding:0;background:#F0F4FA;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4FA;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:24px;overflow:hidden;box-shadow:0 8px 48px rgba(10,31,68,0.12);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0A1F44 0%,#1a3a7a 100%);padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.45);">VTS INFOSOFT</p>
                <p style="margin:0;font-size:21px;font-weight:900;letter-spacing:-0.03em;color:#fff;">VISITORPASS</p>
              </td>
              <td align="right">
                <span style="display:inline-block;background:#EF4444;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Declined</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- HERO BAND -->
        <tr>
          <td style="background:linear-gradient(135deg,#7F1D1D 0%,#991B1B 60%,#B91C1C 100%);padding:44px 40px 40px;text-align:center;">
            <div style="width:68px;height:68px;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);border-radius:50%;margin:0 auto 22px;line-height:68px;font-size:30px;">&#128683;</div>
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:900;letter-spacing:-0.03em;color:#ffffff;">Visit Request Declined</h1>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.65;">Hi <strong style="color:#ffffff;">${name}</strong>, unfortunately your visit request<br/>could not be approved at this time.</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#fff;padding:40px;">
            <p style="margin:0 0 24px;font-size:14px;color:#6B7FA3;line-height:1.75;">Your visit request was reviewed and was not approved. This may be due to scheduling conflicts, security requirements, or host availability. Please reach out to your host directly to reschedule or for further information.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#FFF5F5;border-left:3px solid #EF4444;border-radius:0 12px 12px 0;padding:18px 20px;">
                  <p style="margin:0 0 5px;font-size:10px;font-weight:800;color:#9CA3AF;letter-spacing:0.15em;text-transform:uppercase;">What to do next</p>
                  <p style="margin:0;font-size:13px;color:#374151;line-height:1.65;">Contact your host or the facility directly to arrange a new visit. You can submit a fresh visit request at any time through the VISITORPASS portal.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#F8FAFF;border-radius:12px;padding:16px 20px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#9CA3AF;letter-spacing:0.12em;text-transform:uppercase;">Visit Reference</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#0A1F44;font-family:'Courier New',monospace;">${visitId}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8FAFF;padding:24px 40px;text-align:center;border-top:1px solid #E8EFF8;">
            <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;line-height:1.6;">If you believe this is a mistake, please contact your host directly.</p>
            <p style="margin:0;font-size:11px;color:#C4C9D4;">&#169; ${year} VTS Infosoft &middot; VISITORPASS Enterprise</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function hostNotifyHtml(visitorName: string, status: 'Approved' | 'Rejected', visitId: string): string {
  const year = new Date().getFullYear();
  const approved = status === 'Approved';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Visitor ${status}</title>
</head>
<body style="margin:0;padding:0;background:#F0F4FA;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4FA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(10,31,68,0.10);">

        <tr>
          <td style="background:linear-gradient(135deg,#0A1F44 0%,#1a3a7a 100%);padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <p style="margin:0 0 3px;font-size:10px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.45);">VTS INFOSOFT</p>
                <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:-0.03em;color:#fff;">VISITORPASS</p>
              </td>
              <td align="right">
                <span style="display:inline-block;background:${approved ? '#22C55E' : '#EF4444'};color:#fff;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${status}</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <tr>
          <td style="background:#fff;padding:36px;">
            <p style="margin:0 0 10px;font-size:18px;font-weight:800;color:#0A1F44;letter-spacing:-0.02em;">Visitor ${approved ? 'approved ✓' : 'declined'}</p>
            <p style="margin:0 0 28px;font-size:14px;color:#6B7FA3;line-height:1.7;">You have <strong style="color:#0A1F44;">${approved ? 'approved' : 'declined'}</strong> the visit request from <strong style="color:#0A1F44;">${visitorName}</strong>. ${approved ? 'A QR code and check-in instructions have been sent to the visitor.' : 'The visitor has been notified of the decision.'}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#F8FAFF;border-radius:10px;padding:15px 18px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#9CA3AF;letter-spacing:0.12em;text-transform:uppercase;">Visit Reference</p>
                  <p style="margin:0;font-size:12px;font-weight:700;color:#0A1F44;font-family:'Courier New',monospace;">${visitId}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:#F8FAFF;padding:20px 36px;text-align:center;border-top:1px solid #E8EFF8;">
            <p style="margin:0;font-size:11px;color:#C4C9D4;">&#169; ${year} VTS Infosoft &middot; VISITORPASS Enterprise</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function notifyVisitStatus(opts: {
  visitorEmail?: string;
  visitorName: string;
  hostEmail?: string;
  hostName?: string;
  status: 'Approved' | 'Rejected';
  visitId: string;
  qrToken?: string;
  scheduledTime?: string;
  fromTime?: string;
  createdAt?: string;
}) {
  const approved = opts.status === 'Approved';

  // Use a fully-public third-party QR API so Gmail (and all email clients) can
  // always fetch the image — our own Replit dev URL is behind a session gate
  // that Gmail's fetch servers cannot pass.
  const qrImageUrl = approved && opts.qrToken
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(opts.qrToken)}&bgcolor=ffffff&color=000000&qzone=1`
    : '';
  logger.info({ qrImageUrl }, 'QR image URL for email');

  if (opts.visitorEmail) {
    const ok = await sendEmail(
      opts.visitorEmail,
      approved ? `Your visit is approved — here's your QR code` : `Update on your visit request`,
      approved
        ? visitorApprovedHtml(opts.visitorName, opts.qrToken ?? '', opts.visitId, qrImageUrl, opts.scheduledTime, opts.fromTime, opts.createdAt)
        : visitorRejectedHtml(opts.visitorName, opts.visitId),
      approved
        ? `Hi ${opts.visitorName}, your visit has been approved. QR Token: ${opts.qrToken}`
        : `Hi ${opts.visitorName}, your visit request was not approved. Please contact your host to reschedule.`,
    );
    if (!ok) logger.warn({ email: opts.visitorEmail }, 'Failed to send visitor notification email');
  }

  if (opts.hostEmail) {
    const ok = await sendEmail(
      opts.hostEmail,
      `You ${approved ? 'approved' : 'declined'} a visitor — ${opts.visitorName}`,
      hostNotifyHtml(opts.visitorName, opts.status, opts.visitId),
      `Visit for ${opts.visitorName} (ref: ${opts.visitId}) has been ${opts.status.toLowerCase()}.`,
    );
    if (!ok) logger.warn({ email: opts.hostEmail }, 'Failed to send host notification email');
  }
}
