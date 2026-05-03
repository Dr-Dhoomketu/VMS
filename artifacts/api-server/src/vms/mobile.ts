import { Router, Request, Response } from 'express';
import { Visit, Visitor } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

router.get('/scan/:qrToken', protect, async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findOne({ qrToken: req.params.qrToken })
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
    if (!visit) return res.status(404).json({ message: 'QR code not found or invalid' });
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/scan', protect, async (req: Request, res: Response) => {
  const { qrToken } = req.body;
  try {
    const visit = await Visit.findOne({ qrToken })
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
    if (!visit) return res.status(404).json({ message: 'QR code not found or invalid' });
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/checkin', protect, authorize('Admin', 'Security'), async (req: any, res: Response) => {
  const { qrToken } = req.body;
  try {
    const visit = await Visit.findOne({ qrToken });
    if (!visit) return res.status(404).json({ message: 'QR code not found or invalid' });
    if (visit.status !== 'Approved') return res.status(400).json({ message: `Visit is ${visit.status}, cannot check in` });
    visit.status = 'CheckedIn';
    visit.checkinTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedIn' });
    res.json({ message: 'Visitor checked in successfully', visit });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/checkout', protect, authorize('Admin', 'Security'), async (req: any, res: Response) => {
  const { qrToken, visitId } = req.body;
  try {
    const visit = qrToken
      ? await Visit.findOne({ qrToken })
      : await Visit.findById(visitId);
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    visit.status = 'CheckedOut';
    visit.checkoutTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedOut' });
    res.json({ message: 'Visitor checked out successfully', visit });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/status/:visitId', protect, async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findById(req.params.visitId)
      .populate('visitor', 'name phone email imageUrl')
      .populate('meetWith', 'name email');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/gate-pass/:visitId', protect, async (req: Request, res: Response) => {
  try {
    const visit = await Visit.findById(req.params.visitId)
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    if (visit.status !== 'Approved' && visit.status !== 'CheckedIn') {
      return res.status(400).json({ message: 'Gate pass only available for approved visits' });
    }
    res.json({
      visitId: visit._id,
      visitor: visit.visitor,
      meetWith: visit.meetWith,
      purpose: visit.purpose,
      scheduledTime: visit.scheduledTime,
      qrToken: visit.qrToken,
      status: visit.status,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/visitor/:phone', async (req: Request, res: Response) => {
  try {
    const visitor = await Visitor.findOne({ phone: req.params.phone });
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    const visits = await Visit.find({ visitor: visitor._id })
      .populate('meetWith', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ visitor, visits });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
