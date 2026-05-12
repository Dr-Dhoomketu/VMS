import { Router, Request, Response } from 'express';
import { Visit, Visitor } from './models.js';
import { protect, authorize } from './auth.js';

const router = Router();

function resolveQrLookup(body: any): Promise<any> {
  if (body.qrData && typeof body.qrData === 'object') {
    const { visitId, token } = body.qrData;
    if (visitId) {
      return Visit.findOne({ _id: visitId, ...(token ? { qrToken: token } : {}) })
        .populate('visitor', 'name phone email imageUrl aadhar gender address')
        .populate('meetWith', 'name email');
    }
  }
  if (body.qrToken) {
    return Visit.findOne({ qrToken: body.qrToken })
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
  }
  return Promise.resolve(null);
}

router.get('/scan/:qrToken', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findOne({ qrToken: req.params.qrToken })
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
    if (!visit) { res.status(404).json({ message: 'QR code not found or invalid' }); return; }
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/scan', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await resolveQrLookup(req.body);
    if (!visit) { res.status(404).json({ message: 'QR code not found or invalid' }); return; }
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/checkin', protect, authorize('Admin', 'Security'), async (req: any, res: Response): Promise<void> => {
  const { qrToken, visitId, qrData } = req.body;
  try {
    let visit: any = null;
    if (visitId) {
      visit = await Visit.findById(visitId);
    } else if (qrData && typeof qrData === 'object') {
      visit = await Visit.findOne({ _id: qrData.visitId, ...(qrData.token ? { qrToken: qrData.token } : {}) });
    } else if (qrToken) {
      visit = await Visit.findOne({ qrToken });
    }
    if (!visit) { res.status(404).json({ message: 'QR code not found or invalid' }); return; }
    if (visit.status !== 'Approved') { res.status(400).json({ message: `Visit is ${visit.status}, cannot check in` }); return; }
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

router.post('/checkout', protect, authorize('Admin', 'Security'), async (req: any, res: Response): Promise<void> => {
  const { qrToken, visitId, qrData } = req.body;
  try {
    let visit: any = null;
    if (visitId) {
      visit = await Visit.findById(visitId);
    } else if (qrData && typeof qrData === 'object') {
      visit = await Visit.findOne({ _id: qrData.visitId });
    } else if (qrToken) {
      visit = await Visit.findOne({ qrToken });
    }
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
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

router.get('/status/:visitId', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findById(req.params.visitId)
      .populate('visitor', 'name phone email imageUrl')
      .populate('meetWith', 'name email');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    res.json(visit);
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

async function gatePassHandler(req: Request, res: Response): Promise<void> {
  try {
    const visit = await Visit.findById(req.params.id || req.params.visitId)
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    if (visit.status !== 'Approved' && visit.status !== 'CheckedIn') {
      res.status(400).json({ message: 'Gate pass only available for approved visits' }); return;
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
}

router.get('/gate-pass/:visitId', protect, gatePassHandler);
router.get('/pass/:id', protect, gatePassHandler);

router.get('/visitor/:phone', async (req: Request, res: Response): Promise<void> => {
  try {
    const visitor = await Visitor.findOne({ phone: req.params.phone });
    if (!visitor) { res.status(404).json({ message: 'Visitor not found' }); return; }
    const visits = await Visit.find({ visitor: (visitor as any)._id })
      .populate('meetWith', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ visitor, visits });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
