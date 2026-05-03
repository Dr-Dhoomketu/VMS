import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { VmsUser } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

router.get('/employees', async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await VmsUser.find({ role: 'Employee', isActive: true }).select('name _id');
    res.json(employees);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await VmsUser.find(filter).populate('department designation').select('-password');
    res.json(users);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, department, designation } = req.body;
  try {
    if (await VmsUser.findOne({ email })) { res.status(400).json({ message: 'User already exists' }); return; }
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const user = await VmsUser.create({ name, email, password: hashed, role, department, designation });
    const safe = user.toObject();
    delete (safe as any).password;
    res.status(201).json(safe);
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.put('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, department, designation, isActive, password } = req.body;
    const update: any = { name, email, role, department, designation, isActive };
    if (password) update.password = await bcrypt.hash(password, 10);
    const user = await VmsUser.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    await VmsUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
