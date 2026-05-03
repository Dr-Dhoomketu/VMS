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

  const from = process.env['SMTP_FROM'] || process.env['SMTP_USER'] || 'noreply@visitorpass.com';

  if (opts.visitorEmail) {
    try {
      await transport.sendMail({
        from, to: opts.visitorEmail,
        subject: `Your visit request has been ${opts.status.toLowerCase()}`,
        text: opts.status === 'Approved'
          ? `Dear ${opts.visitorName}, your visit request has been approved. Your QR token: ${opts.qrToken}`
          : `Dear ${opts.visitorName}, your visit request has been declined.`,
      });
    } catch (err) {
      logger.warn({ err, email: opts.visitorEmail }, 'Failed to send visitor notification email');
    }
  }

  if (opts.hostEmail) {
    try {
      await transport.sendMail({
        from, to: opts.hostEmail,
        subject: `You ${opts.status === 'Approved' ? 'approved' : 'declined'} a visitor request`,
        text: `Visit for ${opts.visitorName} has been ${opts.status.toLowerCase()}.`,
      });
    } catch (err) {
      logger.warn({ err, email: opts.hostEmail }, 'Failed to send host notification email');
    }
  }
}
