import { Router, Request, Response } from 'express';
import { Department } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await Department.find()); } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;
    if (await Department.findOne({ name })) { res.status(400).json({ message: 'Department already exists' }); return; }
    res.status(201).json(await Department.create({ name, code }));
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(dept);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try { await Department.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
