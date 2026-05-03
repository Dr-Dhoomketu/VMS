import { Router, Request, Response } from 'express';
import { Designation } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

router.get('/', protect, async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await Designation.find()); } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try { res.status(201).json(await Designation.create(req.body)); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const des = await Designation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!des) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(des);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try { await Designation.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
