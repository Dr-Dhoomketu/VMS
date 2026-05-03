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
