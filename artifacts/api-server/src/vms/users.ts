import { Router, Request, Response } from 'express';
import { VmsUser } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

router.get('/employees', async (_req: Request, res: Response) => {
  try {
    const employees = await VmsUser.find({ role: 'Employee' }).select('name _id');
    res.json(employees);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', protect, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await VmsUser.find(filter).populate('department designation').select('-password');
    res.json(users);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('Admin'), async (req: Request, res: Response) => {
  const { name, email, password, role, department, designation } = req.body;
  try {
    if (await VmsUser.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const user = await VmsUser.create({ name, email, password: password || 'password123', role, department, designation });
    res.status(201).json(user);
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.put('/:id', protect, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const { name, email, role, department, designation, isActive } = req.body;
    const user = await VmsUser.findByIdAndUpdate(req.params.id, { name, email, role, department, designation, isActive }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    await VmsUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
