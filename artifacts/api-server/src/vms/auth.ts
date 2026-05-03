import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { VmsUser } from './models.js';

const router = Router();

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

const generateToken = (id: string) => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await VmsUser.findOne({ email }).select('+password').populate('department designation');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

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

    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      department: user.department, designation: user.designation,
      token: generateToken(String(user._id)),
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', protect, async (req: any, res: Response) => {
  try {
    const user = await VmsUser.findById(req.user.id).populate('department designation');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error' });
  }
});

export async function protect(req: any, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded: any = jwt.verify(auth.split(' ')[1], getJwtSecret());
    req.user = await VmsUser.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
}

export function authorize(...roles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) return res.status(403).json({ message: 'Not authorized' });
    next();
  };
}

export default router;
