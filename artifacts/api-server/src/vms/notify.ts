import nodemailer from 'nodemailer';
import { logger } from '../lib/logger.js';

function createTransport() {
  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || '587');
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
  });
}

function visitorApprovedHtml(name: string, qrToken: string, visitId: string): string {
  const year = new Date().getFullYear();
  const steps = [
    ['01', 'Arrive at reception', 'Walk up to the security desk at the main entrance.'],
    ['02', 'Open this email', 'Show the QR code above on your phone screen.'],
    ['03', 'Get scanned', 'The security officer will scan your QR code.'],
    ['04', "You're in!", 'Collect your gate pass and proceed to your destination.'],
  ];
  const stepsHtml = steps.map(([num, title, desc]) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #F0F4FA;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:36px;height:36px;background:linear-gradient(135deg,#2F5DAA,#1a3a7a);border-radius:10px;text-align:center;vertical-align:middle;font-size:11px;font-weight:900;color:#fff;letter-spacing:0.05em;">${num}</td>
          <td style="padding-left:14px;vertical-align:middle;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#0A1F44;">${title}</p>
            <p style="margin:0;font-size:12px;color:#6B7FA3;line-height:1.5;">${desc}</p>
          </td>
        </tr></table>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Visit is Approved</title>
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
                <span style="display:inline-block;background:#22C55E;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">&#10003; Approved</span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- HERO BAND -->
        <tr>
          <td style="background:linear-gradient(135deg,#2F5DAA 0%,#1a3a7a 100%);padding:44px 40px 40px;text-align:center;">
            <div style="width:68px;height:68px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 22px;line-height:68px;font-size:32px;">&#128274;</div>
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;letter-spacing:-0.03em;color:#fff;">You're cleared to visit!</h1>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.75);line-height:1.65;">Hi <strong style="color:#fff;">${name}</strong>, your visit has been approved.<br/>Show the QR code below at reception to check in.</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#fff;padding:40px;">

            <!-- QR CODE BOX -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
              <tr>
                <td align="center" style="background:#F8FAFF;border:1.5px dashed #C8D8F0;border-radius:20px;padding:32px 24px;">
                  <p style="margin:0 0 16px;font-size:10px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#2F5DAA;">Your QR Access Code</p>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrToken)}&bgcolor=ffffff&color=0A1F44&qzone=2" width="160" height="160" alt="QR Code" style="display:block;margin:0 auto 20px;border-radius:12px;border:4px solid #fff;box-shadow:0 4px 24px rgba(10,31,68,0.12);"/>
                  <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#0A1F44;font-family:'Courier New',monospace;background:#EEF3FB;padding:10px 20px;border-radius:8px;display:inline-block;">${qrToken}</p>
                </td>
              </tr>
            </table>

            <!-- CHECK-IN STEPS -->
            <p style="margin:0 0 4px;font-size:10px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#6B7FA3;">How to check in</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${stepsHtml}
            </table>

            <!-- VISIT ID -->
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
            <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;line-height:1.6;">This QR code is for your personal use only. Do not share it.<br/>If you did not request this visit, please ignore this email.</p>
            <p style="margin:0;font-size:11px;color:#C4C9D4;">&#169; ${year} VTS Infosoft &middot; VISITORPASS Enterprise</p>
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
  const transport = createTransport();
  if (!transport) {
    logger.info(
      { visitId: opts.visitId, status: opts.status },
      'Email notifications not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS to enable). Visit status update logged only.'
    );
    return;
  }

  const from = `"VISITORPASS" <${process.env['SMTP_FROM'] || process.env['SMTP_USER'] || 'noreply@visitorpass.com'}>`;

  if (opts.visitorEmail) {
    try {
      const approved = opts.status === 'Approved';
      await transport.sendMail({
        from,
        to: opts.visitorEmail,
        subject: approved
          ? `Your visit is approved — here's your QR code`
          : `Update on your visit request`,
        html: approved
          ? visitorApprovedHtml(opts.visitorName, opts.qrToken ?? '', opts.visitId)
          : visitorRejectedHtml(opts.visitorName, opts.visitId),
        text: approved
          ? `Hi ${opts.visitorName}, your visit has been approved. QR Token: ${opts.qrToken}`
          : `Hi ${opts.visitorName}, your visit request was not approved. Please contact your host to reschedule.`,
      });
    } catch (err) {
      logger.warn({ err, email: opts.visitorEmail }, 'Failed to send visitor notification email');
    }
  }

  if (opts.hostEmail) {
    try {
      await transport.sendMail({
        from,
        to: opts.hostEmail,
        subject: `You ${opts.status === 'Approved' ? 'approved' : 'declined'} a visitor — ${opts.visitorName}`,
        html: hostNotifyHtml(opts.visitorName, opts.status, opts.visitId),
        text: `Visit for ${opts.visitorName} (ref: ${opts.visitId}) has been ${opts.status.toLowerCase()}.`,
      });
    } catch (err) {
      logger.warn({ err, email: opts.hostEmail }, 'Failed to send host notification email');
    }
  }
}
