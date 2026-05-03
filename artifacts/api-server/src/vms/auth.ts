import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { VmsUser } from './models.js';

const router = Router();

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('JWT_SECRET is required in production — set it as a Replit Secret');
    }
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
  const result: any = { message: 'OTP sent' };

  if (email) {
    const otp = generateOTP();
    otpStore.set(`email:${email}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    // OTP is stored server-side only; never returned in the response
  }

  if (phone) {
    const otp = generateOTP();
    otpStore.set(`phone:${phone}`, { otp, expires: Date.now() + 10 * 60 * 1000 });
    await sendSmsOtp(phone, otp);
    // OTP is stored server-side only; never returned in the response regardless of SMS delivery
  }

  res.json(result);
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
