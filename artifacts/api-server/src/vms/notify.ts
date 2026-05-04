import nodemailer from 'nodemailer';
import { logger } from '../lib/logger.js';

// ── Resend HTTP API (preferred — works on Render free tier, no SMTP port blocking) ──
async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) return false;
  const from = process.env['RESEND_FROM'] || 'VISITORPASS <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    const data: any = await res.json();
    if (!res.ok) { logger.error({ data, to }, 'Resend API error'); return false; }
    logger.info({ id: data.id, to }, 'Email sent via Resend');
    return true;
  } catch (err: any) {
    logger.error({ err: err?.message, to }, 'Resend fetch failed');
    return false;
  }
}

// ── SMTP fallback (nodemailer) ──
function createSmtpTransport() {
  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || '587');
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  if (!user || !pass) return null;
  if (!host) {
    const domain = user.split('@')[1]?.toLowerCase() ?? '';
    if (domain === 'gmail.com') return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return nodemailer.createTransport({ service: 'hotmail', auth: { user, pass } });
    return null;
  }
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function sendViaSmtp(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const transport = createSmtpTransport();
  if (!transport) return false;
  const from = `"VISITORPASS" <${process.env['SMTP_FROM'] || process.env['SMTP_USER']}>`;
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SMTP timeout')), 10000));
    await Promise.race([timeout, transport.sendMail({ from, to, subject, html, text })]);
    logger.info({ to }, 'Email sent via SMTP');
    return true;
  } catch (err: any) {
    logger.error({ err: { message: err?.message, code: err?.code }, to }, 'SMTP send failed');
    return false;
  }
}

// ── Unified send: Resend first, SMTP fallback ──
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (await sendViaResend(to, subject, html, text)) return true;
  return sendViaSmtp(to, subject, html, text);
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

function visitorApprovedHtml(name: string, qrToken: string, visitId: string): string {
  const year = new Date().getFullYear();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrToken)}&bgcolor=ffffff&color=0A1F44&qzone=3&margin=10`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<meta name="supported-color-schemes" content="light dark"/>
<title>Visit Approved — VISITORPASS</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; padding:0; }
  .wrapper { background:#F4F6FB; padding:40px 16px; }
  .card { background:#ffffff; border-radius:20px; overflow:hidden; max-width:580px; margin:0 auto; box-shadow:0 4px 40px rgba(0,0,0,0.10); }
  .header { background:#0B1E45; padding:28px 36px; }
  .brand-sub { font-size:9px; font-weight:800; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin:0 0 4px; }
  .brand-name { font-size:22px; font-weight:900; letter-spacing:0.06em; color:#ffffff; margin:0; }
  .badge { display:inline-block; background:#16A34A; color:#fff; font-size:9px; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; padding:5px 14px; border-radius:999px; }
  .hero { background:linear-gradient(160deg,#0B1E45 0%,#1E3A7A 60%,#2F5DAA 100%); padding:40px 36px 36px; text-align:center; }
  .hero-icon { font-size:36px; display:block; margin:0 auto 16px; }
  .hero-title { font-size:24px; font-weight:900; color:#ffffff; margin:0 0 10px; letter-spacing:-0.02em; }
  .hero-sub { font-size:14px; color:rgba(255,255,255,0.72); line-height:1.7; margin:0; }
  .hero-name { color:#ffffff; font-weight:700; }
  .body-area { background:#ffffff; padding:36px; }
  .qr-wrap { text-align:center; padding:28px 20px 24px; background:#F8FAFF; border-radius:16px; border:1px solid #E4EAF6; margin-bottom:28px; }
  .qr-label { font-size:9px; font-weight:800; letter-spacing:0.3em; text-transform:uppercase; color:#4A7FD4; margin:0 0 18px; }
  .qr-img-wrap { display:inline-block; background:#fff; padding:10px; border-radius:12px; box-shadow:0 2px 20px rgba(10,31,68,0.10); margin-bottom:16px; }
  .qr-token { display:inline-block; font-family:'Courier New',monospace; font-size:12px; font-weight:700; letter-spacing:0.12em; color:#0B1E45; background:#EEF3FB; padding:9px 18px; border-radius:8px; }
  .divider { height:1px; background:#EEF3FB; margin:0 0 24px; }
  .step-row { padding:12px 0; border-bottom:1px solid #F0F4FA; }
  .step-num { width:32px; height:32px; background:#0B1E45; border-radius:8px; text-align:center; line-height:32px; font-size:10px; font-weight:900; color:#fff; letter-spacing:0.05em; display:inline-block; vertical-align:middle; }
  .step-title { font-size:13px; font-weight:700; color:#0B1E45; margin:0 0 2px; }
  .step-desc { font-size:12px; color:#7A8FAB; line-height:1.5; margin:0; }
  .ref-box { background:#F8FAFF; border-radius:10px; padding:14px 18px; }
  .ref-label { font-size:9px; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; color:#9CA3AF; margin:0 0 4px; }
  .ref-value { font-size:12px; font-weight:700; color:#0B1E45; font-family:'Courier New',monospace; margin:0; }
  .footer { background:#F8FAFF; padding:20px 36px; text-align:center; border-top:1px solid #E8EFF8; }
  .footer-text { font-size:11px; color:#9CA3AF; line-height:1.7; margin:0 0 6px; }
  .footer-copy { font-size:10px; color:#C0C9D8; margin:0; }

  @media (prefers-color-scheme: dark) {
    .wrapper { background:#0F172A !important; }
    .card { background:#1E293B !important; box-shadow:0 4px 40px rgba(0,0,0,0.40) !important; }
    .body-area { background:#1E293B !important; }
    .qr-wrap { background:#0F172A !important; border-color:#2D3F5C !important; }
    .qr-label { color:#7EB3FF !important; }
    .qr-img-wrap { background:#ffffff !important; }
    .qr-token { background:#0B1E45 !important; color:#A8C4F0 !important; }
    .divider { background:#2D3F5C !important; }
    .step-row { border-bottom-color:#2D3F5C !important; }
    .step-title { color:#E2E8F0 !important; }
    .step-desc { color:#94A3B8 !important; }
    .ref-box { background:#0F172A !important; }
    .ref-value { color:#A8C4F0 !important; }
    .footer { background:#0F172A !important; border-top-color:#2D3F5C !important; }
    .footer-text { color:#64748B !important; }
    .footer-copy { color:#475569 !important; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <!-- HEADER -->
    <div class="header">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <p class="brand-sub">VTS Infosoft</p>
          <p class="brand-name">VISITORPASS</p>
        </td>
        <td align="right" style="vertical-align:middle;">
          <span class="badge">&#10003;&nbsp; Approved</span>
        </td>
      </tr></table>
    </div>

    <!-- HERO -->
    <div class="hero">
      <span class="hero-icon">&#128274;</span>
      <h1 class="hero-title">You&rsquo;re cleared to visit</h1>
      <p class="hero-sub">Hi <span class="hero-name">${name}</span>, your visit request has been approved.<br/>Present the QR code below at reception to check in instantly.</p>
    </div>

    <!-- BODY -->
    <div class="body-area">

      <!-- QR CODE -->
      <div class="qr-wrap">
        <p class="qr-label">Your Digital Gate Pass</p>
        <div class="qr-img-wrap">
          <img src="${qrUrl}" width="200" height="200" alt="QR Access Code" style="display:block;border-radius:8px;"/>
        </div>
        <br/>
        <span class="qr-token">${qrToken}</span>
      </div>

      <div class="divider"></div>

      <!-- STEPS -->
      <p style="font-size:9px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#9CA3AF;margin:0 0 12px;">How to check in</p>
      ${[
        ['01', 'Arrive at reception', 'Head to the main security desk at the entrance.'],
        ['02', 'Show this QR code', 'Open this email and display the code on your screen.'],
        ['03', 'Get scanned &amp; verified', 'The officer scans your QR — identity confirmed instantly.'],
        ['04', 'Collect your pass', 'Receive your physical gate pass and proceed.'],
      ].map(([n, t, d]) => `
      <div class="step-row">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;width:32px;"><span class="step-num">${n}</span></td>
          <td style="vertical-align:middle;padding-left:14px;">
            <p class="step-title">${t}</p>
            <p class="step-desc">${d}</p>
          </td>
        </tr></table>
      </div>`).join('')}

      <div style="height:24px;"></div>

      <!-- REFERENCE -->
      <div class="ref-box">
        <p class="ref-label">Visit Reference</p>
        <p class="ref-value">${visitId}</p>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p class="footer-text">This QR code is for your personal use only — do not share it.<br/>If you did not request this visit, please ignore this email.</p>
      <p class="footer-copy">&copy; ${year} VTS Infosoft &middot; VISITORPASS Enterprise</p>
    </div>

  </div>
</div>
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
          <td style="background:linear-gradient(135deg,#475569 0%,#334155 100%);padding:44px 40px 40px;text-align:center;">
            <div style="width:68px;height:68px;background:rgba(255,255,255,0.12);border-radius:50%;margin:0 auto 22px;line-height:68px;font-size:30px;">&#128683;</div>
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:900;letter-spacing:-0.03em;color:#fff;">Visit Request Declined</h1>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.65;">Hi <strong style="color:#fff;">${name}</strong>, unfortunately your visit request<br/>could not be approved at this time.</p>
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
}) {
  const approved = opts.status === 'Approved';

  if (opts.visitorEmail) {
    const ok = await sendEmail(
      opts.visitorEmail,
      approved ? `Your visit is approved — here's your QR code` : `Update on your visit request`,
      approved
        ? visitorApprovedHtml(opts.visitorName, opts.qrToken ?? '', opts.visitId)
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
