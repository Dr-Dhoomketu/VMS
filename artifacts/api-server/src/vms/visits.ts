import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import QRCode from 'qrcode';
import { Visit, Visitor, VmsUser } from './models.js';
import { protect, authorize } from './auth.js';
import { notifyVisitStatus, sendVisitRequestEmail } from './notify.js';

const router = Router();

router.get('/qr/:token', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  if (!token) { res.status(400).send('Missing token'); return; }
  try {
    const buf: Buffer = await QRCode.toBuffer(token, { width: 260, margin: 2, color: { dark: '#0B1E45', light: '#ffffff' } });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch { res.status(500).send('QR generation failed'); }
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/request', upload.single('photo'), async (req: any, res: Response): Promise<void> => {
  const { name, aadhar, phone, email, address, gender, meetWith, purpose, scheduledTime, fromTime, toTime, duration } = req.body;
  try {
    let imageUrl: string | undefined;
    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype || 'image/jpeg'};base64,${b64}`;
    }
    let visitor: any = aadhar ? await Visitor.findOne({ aadhar }) : null;
    if (!visitor) visitor = await Visitor.create({ name, phone, email, address, gender, aadhar: aadhar || undefined, imageUrl });

    let resolvedMeetWith: string | undefined;
    let resolvedMeetWithDept: string | undefined;
    let isVariableEmployee = false;
    if (meetWith && meetWith.startsWith('dept:')) {
      resolvedMeetWithDept = meetWith.replace('dept:', '');
      isVariableEmployee = true;
    } else if (meetWith && meetWith !== 'unallocated') {
      resolvedMeetWith = meetWith;
    }

    const visit: any = await Visit.create({
      visitor: visitor._id, meetWith: resolvedMeetWith || undefined,
      meetWithDept: resolvedMeetWithDept || undefined, isVariableEmployee,
      purpose, scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      fromTime, toTime, duration, status: 'Pending',
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('new_visit', { visitId: visit._id, visitorName: visitor.name });
      if (resolvedMeetWith) {
        const employee = await VmsUser.findById(resolvedMeetWith);
        if (employee) {
          io.to(`employee_${(employee as any)._id}`).emit('new_visit_request', { visitId: visit._id, visitorName: visitor.name });
          if (employee.email) {
            const dashboardUrl = (process.env['FRONTEND_URL'] || 'https://vms-shaurya.vercel.app').replace(/\/$/, '');
            sendVisitRequestEmail({ employeeEmail: employee.email, employeeName: employee.name, visitorName: visitor.name, purpose: purpose || 'Visit', visitId: String(visit._id), dashboardUrl }).catch(() => {});
          }
        }
      } else if (resolvedMeetWithDept) {
        const deptEmps = await VmsUser.find({ department: resolvedMeetWithDept, isActive: true, role: 'Employee' });
        for (const emp of deptEmps) io.to(`employee_${(emp as any)._id}`).emit('new_visit_request', { visitId: visit._id, visitorName: visitor.name });
      }
    }
    res.status(201).json({ message: 'Visit request submitted', visitId: visit._id });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.get('/pending', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const query: any = { status: 'Pending' };
    if (req.user.role === 'Employee') {
      query.$or = [
        { meetWith: req.user._id },
        { meetWithDept: req.user.department, isVariableEmployee: true },
      ];
    }
    const visits = await Visit.find(query)
      .populate('visitor', 'name phone imageUrl')
      .populate('meetWith', 'name')
      .populate('meetWithDept', 'name')
      .sort({ createdAt: -1 });
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/approved', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const query: any = { status: 'Approved' };
    if (req.user.role === 'Employee') {
      query.$or = [
        { meetWith: req.user._id },
        { meetWithDept: req.user.department, isVariableEmployee: true },
      ];
    }
    const visits = await Visit.find(query)
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email department')
      .populate('meetWithDept', 'name')
      .populate('divertHistory.from', 'name')
      .populate('divertHistory.to', 'name')
      .populate('divertHistory.by', 'name')
      .sort({ updatedAt: -1 });
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get all incoming divert requests directed to this employee (status=Pending)
router.get('/divert-requests/incoming', protect, authorize('Employee', 'Admin'), async (req: any, res: Response): Promise<void> => {
  try {
    const visits = await Visit.find({
      'divertRequests': { $elemMatch: { to: req.user._id, status: 'Pending' } },
    })
      .populate('visitor', 'name phone imageUrl email')
      .populate('meetWith', 'name')
      .populate('meetWithDept', 'name')
      .populate('divertRequests.from', 'name')
      .populate('divertRequests.to', 'name')
      .sort({ updatedAt: -1 });
    res.json(visits);
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Send a divert REQUEST — only valid on Pending visits, must not have an active visit ongoing
router.post('/:id/divert-request', protect, authorize('Admin', 'Employee'), async (req: any, res: Response): Promise<void> => {
  const { toEmployeeId, reason } = req.body;
  if (!toEmployeeId) { res.status(400).json({ message: 'toEmployeeId required' }); return; }
  try {
    const visit = await Visit.findById(req.params.id).populate('meetWith', 'name department').populate('visitor', 'name');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }

    // Only allow divert-request on Pending visits (not Approved/active)
    if (visit.status !== 'Pending') {
      res.status(400).json({ message: 'Cannot divert an active or completed visit. Divert requests are only for pending visits.' });
      return;
    }

    const targetEmp = await VmsUser.findById(toEmployeeId);
    if (!targetEmp) { res.status(404).json({ message: 'Target employee not found' }); return; }

    // Employees can only divert within their own department
    if (req.user.role === 'Employee') {
      const myDept = String(req.user.department);
      const targetDept = String(targetEmp.department);
      if (myDept !== targetDept) { res.status(403).json({ message: 'Can only divert within your department' }); return; }
    }

    // Cancel any existing pending divert requests first
    if (visit.divertRequests) {
      for (const dr of visit.divertRequests as any[]) {
        if (dr.status === 'Pending') dr.status = 'Rejected';
      }
    }

    // Add new divert request
    (visit as any).divertRequests = (visit.divertRequests || []);
    (visit as any).divertRequests.push({
      from: req.user._id,
      to: toEmployeeId,
      reason: reason || '',
      status: 'Pending',
      at: new Date(),
    });
    await visit.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`employee_${toEmployeeId}`).emit('divert_request_received', {
        visitId: visit._id,
        visitorName: (visit.visitor as any)?.name || 'A visitor',
        fromName: req.user.name,
      });
    }
    res.json({ message: 'Divert request sent, waiting for acceptance' });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Respond to a divert request (accept or reject)
router.put('/:id/divert-request/:reqId/respond', protect, authorize('Admin', 'Employee'), async (req: any, res: Response): Promise<void> => {
  const { action } = req.body; // 'accept' | 'reject'
  if (!['accept', 'reject'].includes(action)) { res.status(400).json({ message: "action must be 'accept' or 'reject'" }); return; }
  try {
    const visit = await Visit.findById(req.params.id).populate('visitor', 'name').populate('meetWith', 'name');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }

    const dr = (visit.divertRequests as any[])?.id(req.params.reqId);
    if (!dr) { res.status(404).json({ message: 'Divert request not found' }); return; }

    // Only the target employee can respond
    if (String(dr.to) !== String(req.user._id) && req.user.role !== 'Admin') {
      res.status(403).json({ message: 'Not authorized' }); return;
    }

    if (action === 'accept') {
      dr.status = 'Accepted';
      // Record in divert history
      if (!visit.divertHistory) (visit as any).divertHistory = [];
      (visit as any).divertHistory.push({
        from: visit.meetWith || null,
        to: req.user._id,
        by: req.user._id,
        reason: dr.reason || 'Accepted divert request',
        at: new Date(),
      });
      visit.meetWith = req.user._id;
      visit.isVariableEmployee = false;
    } else {
      dr.status = 'Rejected';
    }
    await visit.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`employee_${String(dr.from)}`).emit('divert_request_responded', {
        visitId: visit._id,
        action,
        byName: req.user.name,
        visitorName: (visit.visitor as any)?.name || 'visitor',
      });
      io.to('admin_channel').emit('visit_updated', { visitId: visit._id });
    }
    res.json({ message: `Divert request ${action === 'accept' ? 'accepted' : 'rejected'}` });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// Immediate divert — Admin only (or for Approved visits by Admin)
router.put('/:id/divert', protect, authorize('Admin'), async (req: any, res: Response): Promise<void> => {
  const { toEmployeeId, reason } = req.body;
  if (!toEmployeeId) { res.status(400).json({ message: 'toEmployeeId required' }); return; }
  try {
    const visit = await Visit.findById(req.params.id).populate('meetWith', 'name department');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    const targetEmployee = await VmsUser.findById(toEmployeeId);
    if (!targetEmployee) { res.status(404).json({ message: 'Target employee not found' }); return; }

    const previousMeetWith = visit.meetWith;
    if (!visit.divertHistory) (visit as any).divertHistory = [];
    (visit as any).divertHistory.push({ from: previousMeetWith || null, to: toEmployeeId, by: req.user._id, reason: reason || '', at: new Date() });
    visit.meetWith = toEmployeeId;
    visit.isVariableEmployee = false;
    await visit.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`employee_${toEmployeeId}`).emit('new_visit_request', { visitId: visit._id });
      io.emit('approval_updates', { visitId: visit._id, status: visit.status });
    }
    res.json({ message: 'Visit diverted', visit });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.post('/checkin/:token', protect, authorize('Admin', 'Employee', 'Security'), async (req: any, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findOne({ qrToken: req.params.token })
      .populate('visitor', 'name phone email imageUrl')
      .populate('meetWith', 'name email');
    if (!visit) { res.status(404).json({ message: 'Invalid or expired QR token' }); return; }
    if (visit.status === 'CheckedIn') { res.json({ message: 'Already checked in', visit }); return; }
    if (visit.status !== 'Approved') { res.status(400).json({ message: `Cannot check in — visit status is ${visit.status}` }); return; }
    visit.status = 'CheckedIn';
    (visit as any).checkInTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedIn' });
    res.json({ message: 'Visitor checked in successfully', visit });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.post('/checkout/:token', protect, authorize('Admin', 'Employee', 'Security'), async (req: any, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findOne({ qrToken: req.params.token })
      .populate('visitor', 'name phone email imageUrl')
      .populate('meetWith', 'name email');
    if (!visit) { res.status(404).json({ message: 'Invalid or expired QR token' }); return; }
    if (visit.status === 'CheckedOut') { res.json({ message: 'Already checked out', visit }); return; }
    if (!['Approved', 'CheckedIn'].includes(visit.status)) { res.status(400).json({ message: `Cannot check out — visit status is ${visit.status}` }); return; }
    visit.status = 'CheckedOut';
    visit.checkoutTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedOut' });
    res.json({ message: 'Visitor checked out successfully', visit });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.get('/scan/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findOne({ qrToken: req.params.token })
      .populate('visitor', 'name phone email imageUrl aadhar gender')
      .populate('meetWith', 'name email')
      .populate('meetWithDept', 'name');
    if (!visit) { res.status(404).json({ message: 'Invalid or expired QR token' }); return; }
    res.json(visit);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.query;
  if (!phone) { res.status(400).json({ message: 'Phone required' }); return; }
  try {
    const rawPhone = String(phone).trim();
    let visitor: any = await Visitor.findOne({ phone: rawPhone });
    if (!visitor) visitor = await Visitor.findOne({ phone: rawPhone.replace(/[\s\-\(\)]/g, '') });
    if (!visitor) {
      const digits = rawPhone.replace(/\D/g, '');
      if (digits.length >= 7) {
        const suffix = digits.slice(-10);
        const candidates = await Visitor.find({ phone: { $regex: suffix + '$' } });
        visitor = candidates[0] || null;
      }
    }
    if (!visitor) { res.status(404).json({ message: 'Visitor not found' }); return; }
    const lastVisit = await Visit.findOne({ visitor: (visitor as any)._id }).sort({ createdAt: -1 }).populate('meetWith', 'name').populate('meetWithDept', 'name');
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

router.get('/', protect, async (req: any, res: Response): Promise<void> => {
  try {
    const { status, startDate, endDate } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(String(startDate));
      if (endDate) query.createdAt.$lte = new Date(String(endDate));
    }
    if (req.user.role === 'Employee') {
      query.$or = [
        { meetWith: req.user._id },
        { meetWithDept: req.user.department },
      ];
    }
    const visits = await Visit.find(query)
      .populate('visitor')
      .populate('meetWith', 'name department')
      .populate('meetWithDept', 'name')
      .sort({ createdAt: -1 });
    res.json(visits);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id/status', protect, authorize('Admin', 'Employee'), async (req: any, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) { res.status(400).json({ message: 'Invalid status' }); return; }
  try {
    const visit = await Visit.findById(req.params.id).populate('visitor').populate('meetWith').populate('meetWithDept');
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    if (req.user.role === 'Employee') {
      const meetWithId = String((visit.meetWith as any)?._id ?? visit.meetWith);
      const deptMatch = visit.isVariableEmployee && String(visit.meetWithDept) === String(req.user.department);
      if (meetWithId !== String(req.user._id) && !deptMatch) { res.status(403).json({ message: 'Not authorized' }); return; }
      if (deptMatch && status === 'Approved') { visit.meetWith = req.user._id; visit.isVariableEmployee = false; }
    }
    visit.status = status;
    if (status === 'Approved') visit.qrToken = uuidv4();
    await visit.save();
    const io = req.app.get('io');
    if (io) { io.emit('approval_updates', { visitId: visit._id, status }); io.to('admin_channel').emit('visit_updated', { visitId: visit._id, status }); }
    const visitor = visit.visitor as any;
    const host = visit.meetWith as any;
    notifyVisitStatus({ visitorEmail: visitor?.email, visitorName: visitor?.name || 'Visitor', hostEmail: host?.email, hostName: host?.name, status, visitId: String(visit._id), qrToken: visit.qrToken, scheduledTime: (visit as any).scheduledTime ? String((visit as any).scheduledTime) : undefined, fromTime: (visit as any).fromTime || undefined, createdAt: (visit as any).createdAt ? String((visit as any).createdAt) : undefined }).catch(() => {});
    res.json({ message: `Visit ${status.toLowerCase()}`, visit });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.post('/:id/checkout', protect, authorize('Admin', 'Employee'), async (req: any, res: Response): Promise<void> => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) { res.status(404).json({ message: 'Visit not found' }); return; }
    if (req.user.role === 'Employee') {
      const meetWithId = String((visit.meetWith as any)?._id ?? visit.meetWith);
      if (meetWithId !== String(req.user._id)) { res.status(403).json({ message: 'Not authorized' }); return; }
    }
    visit.status = 'CheckedOut'; visit.checkoutTime = new Date();
    await visit.save();
    const io = req.app.get('io');
    if (io) io.emit('visit_updated', { visitId: visit._id, status: 'CheckedOut' });
    res.json({ message: 'Checked out' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
