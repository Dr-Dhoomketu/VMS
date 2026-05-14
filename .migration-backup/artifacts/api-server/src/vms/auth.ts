import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { VmsUser } from './models.js';
import { sendOtpEmail } from './notify.js';

const router = Router();

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    if (process.env['NODE_ENV'] === 'production') {
      console.error('FATAL: JWT_SECRET is not set. Exiting to prevent insecure token signing.');
      process.exit(1);
    }
    console.warn('[dev] JWT_SECRET not set — using insecure dev fallback. Set JWT_SECRET before deploying.');
    return 'dev-fallback-jwt-secret-change-in-production';
  }
  return secret;
}

const generateToken = (id: string) => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await VmsUser.findOne({ email }).select('+password').populate('department designation');
    if (!user) { res.status(401).json({ message: 'Invalid email or password' }); return; }

    let valid = false;
    if (user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      valid = user.password === password;
      if (valid) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!valid) { res.status(401).json({ message: 'Invalid email or password' }); return; }
    if (!user.isActive) { res.status(401).json({ message: 'Account deactivated' }); return; }

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      department: user.department, designation: user.designation,
      token: generateToken(String(user._id)),
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const otpStore = new Map<string, { otp: string; expires: number }>();
function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString(); }

async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env['FAST2SMS_API_KEY'];
  if (!apiKey) return false;
  // Strip country code — Fast2SMS expects 10-digit Indian number
  const digits = phone.replace(/\D/g, '');
  const number = digits.length > 10 ? digits.slice(-10) : digits;
  const message = `Your VISITORPASS OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=q&message=${encodeURIComponent(message)}&numbers=${number}&flash=0`;
    const res = await fetch(url);
    const data: any = await res.json();
    return data.return === true;
  } catch {
    return false;
  }
}

router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { email, phone } = req.body;
  if (!email && !phone) { res.status(400).json({ message: 'Email or phone required' }); return; }

  // Fail fast if no email provider is configured
  const hasBrevo = process.env['BREVO_API_KEY'] && process.env['BREVO_USER'];
  const hasGmail = process.env['SMTP_USER'] && process.env['SMTP_PASS'];
  if (email && !hasBrevo && !hasGmail) {
    res.status(503).json({ message: 'Email service not configured. Set BREVO_API_KEY + BREVO_USER on the server.' });
    return;
  }

  if (email) {
    const otp = generateOTP();
    otpStore.set(`email:${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    const ok = await sendOtpEmail(email, otp);
    if (!ok) {
      otpStore.delete(`email:${email}`);
      res.status(502).json({ message: 'Failed to send OTP email. Check server SMTP configuration.' });
      return;
    }
  }

  if (phone) {
    const otp = generateOTP();
    otpStore.set(`phone:${phone}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    sendSmsOtp(phone, otp).catch(() => {});
  }

  res.json({ message: 'OTP sent' });
});

router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { email, phone, emailOtp, phoneOtp } = req.body;
  const errors: string[] = [];
  if (email && emailOtp) {
    const s = otpStore.get(`email:${email}`);
    if (!s || s.otp !== String(emailOtp) || Date.now() > s.expires) errors.push('Invalid or expired email OTP');
    else otpStore.delete(`email:${email}`);
  }
  if (phone && phoneOtp) {
    const s = otpStore.get(`phone:${phone}`);
    if (!s || s.otp !== String(phoneOtp) || Date.now() > s.expires) errors.push('Invalid or expired phone OTP');
    else otpStore.delete(`phone:${phone}`);
  }
  if (errors.length > 0) { res.status(400).json({ message: errors.join('. ') }); return; }
  res.json({ message: 'OTP verified' });
});

router.get('/test-email', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  const to = req.query['to'] as string || process.env['SMTP_USER'] || '';
  if (!to) { res.status(400).json({ error: 'Provide ?to=your@email.com as query param' }); return; }
  const method = process.env['BREVO_API_KEY'] ? 'brevo-api' : 'gmail-smtp';
  const ok = await sendOtpEmail(to, '123456');
  res.json({
    success: ok,
    method,
    to,
    tip: ok ? 'Check your inbox (and spam folder)' : 'Check server logs for the exact error',
  });
});

router.post('/accept-invite', async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ message: 'Token and password are required' }); return; }
  if (password.length < 8) { res.status(400).json({ message: 'Password must be at least 8 characters' }); return; }
  try {
    const user = await VmsUser.findOne({ inviteToken: token, inviteExpires: { $gt: new Date() } }).select('+inviteToken +inviteExpires +password');
    if (!user) { res.status(400).json({ message: 'Invalid or expired invitation link. Please ask your admin to resend.' }); return; }
    user.password = await bcrypt.hash(password, 10);
    (user as any).inviteToken = undefined;
    (user as any).inviteExpires = undefined;
    await user.save();
    res.json({ message: 'Account activated successfully. You can now log in.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const user = await VmsUser.findById(req.user.id).populate('department designation');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error' });
  }
});

export async function protect(req: any, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) { res.status(401).json({ message: 'Not authorized' }); return; }
  try {
    const decoded: any = jwt.verify(auth.split(' ')[1], getJwtSecret());
    req.user = await VmsUser.findById(decoded.id).select('-password');
    if (!req.user) { res.status(401).json({ message: 'User not found' }); return; }
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
}

export function authorize(...roles: string[]) {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role)) { res.status(403).json({ message: 'Not authorized' }); return; }
    next();
  };
}

export default router;
