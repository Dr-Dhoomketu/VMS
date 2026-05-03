import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Visit, Visitor, VmsUser } from './models.js';
import { protect, authorize } from './auth.js';
import { notifyVisitStatus } from './notify.js';

const router = Router();

const uploadDir = 'public/uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

router.post('/request', upload.single('photo'), async (req: any, res: Response): Promise<void> => {
  const { name, aadhar, phone, email, address, gender, meetWith, purpose, scheduledTime, fromTime, toTime, duration } = req.body;
  try {
    let visitor: any = aadhar ? await Visitor.findOne({ aadhar }) : null;
    if (!visitor) {
      visitor = await Visitor.create({
        name, phone, email, address, gender,
        aadhar: aadhar || undefined,
        imageUrl: req.file ? `/public/uploads/${req.file.filename}` : undefined,
      });
    }
    const visit: any = await Visit.create({
      visitor: visitor._id, meetWith, purpose,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      fromTime, toTime, duration, status: 'Pending',
    });
    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('new_visit', { visitId: visit._id, visitorName: visitor.name });
      const employee = await VmsUser.findById(meetWith);
      if (employee) io.to(`employee_${(employee as any)._id}`).emit('new_visit_request', { visitId: visit._id, visitorName: visitor.name });
    }
    res.status(201).json({ message: 'Visit request submitted', visitId: visit._id });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/pending', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const query: any = { status: 'Pending' };
    if (req.user.role === 'Employee') query.meetWith = req.user._id;
    const visits = await Visit.find(query).populate('visitor', 'name phone imageUrl').populate('meetWith', 'name');
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/approved', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const query: any = { status: 'Approved' };
    if (req.user.role === 'Employee') query.meetWith = req.user._id;
    const visits = await Visit.find(query)
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email')
      .sort({ updatedAt: -1 });
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.query;
  if (!phone) { res.status(400).json({ message: 'Phone required' }); return; }
  try {
    const visitor = await Visitor.findOne({ phone: String(phone) });
    if (!visitor) { res.status(404).json({ message: 'Visitor not found' }); return; }
    const lastVisit = await Visit.findOne({ visitor: (visitor as any)._id })
      .sort({ createdAt: -1 })
      .populate('meetWith', 'name');
    res.json({ visitor, lastVisit });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/stats', protect, authorize('Admin'), async (_req: any, res: Response): Promise<void> => {
  try {
    const total = await Visit.countDocuments();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const today = await Visit.countDocuments({ createdAt: { $gte: todayStart } });
    const checkedIn = await Visit.countDocuments({ status: 'Approved' });
    const checkedOut = await Visit.countDocuments({ status: 'CheckedOut' });
    const preVisitor = await Visit.countDocuments({ scheduledTime: { $ne: null } });
    res.json({ total, today, checkedIn, checkedOut, preVisitor });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(String(startDate));
      if (endDate) query.createdAt.$lte = new Date(String(endDate));
    }
    const visits = await Visit.find(query).populate('visitor').populate('meetWith', 'name').sort({ createdAt: -1 });
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/status', protect, authorize('Admin', 'Employee'), async (req: any, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) { res.status(400).json({ message: 'Invalid status' }); return; }
  try {
    const visit = await Visit.findById(req.params.id).populate('visitor').populate('meetWith');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    if (req.user.role === 'Employee') {
      const meetWithId = String((visit.meetWith as any)?._id ?? visit.meetWith);
      if (meetWithId !== String(req.user._id)) {
        res.status(403).json({ message: 'Not authorized to update this visit' }); return;
      }
    }
    visit.status = status;
    if (status === 'Approved') visit.qrToken = uuidv4();
    await visit.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('approval_updates', { visitId: visit._id, status });
      io.to('admin_channel').emit('visit_updated', { visitId: visit._id, status });
    }
    const visitor = visit.visitor as any;
    const host = visit.meetWith as any;
    notifyVisitStatus({
      visitorEmail: visitor?.email,
      visitorName: visitor?.name || 'Visitor',
      hostEmail: host?.email,
      hostName: host?.name,
      status,
      visitId: String(visit._id),
      qrToken: visit.qrToken,
    }).catch(() => {});
    res.json({ message: `Visit ${status.toLowerCase()}`, visit });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/checkout', protect, authorize('Admin'), async (req: any, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    visit.status = 'CheckedOut';
    visit.checkoutTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedOut' });
    res.json({ message: 'Checked out' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
