import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { protect, authorize } from './auth.js';

const router = Router();

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});
const Settings = mongoose.model('Settings', settingsSchema);

const DEFAULT_PERMISSIONS = [
  { key: 'approve_visits',      label: 'Approve / Reject Visits',     description: 'Allow role to approve or reject pending visitor requests', roles: { Admin: true, Employee: true, Security: false } },
  { key: 'view_visitor_log',    label: 'View Visitor Log',             description: 'Access to the full visitor log and history',              roles: { Admin: true, Employee: false, Security: true } },
  { key: 'checkout_visitor',    label: 'Check-out Visitors',           description: 'Mark visitors as checked out from the premises',           roles: { Admin: true, Employee: false, Security: true } },
  { key: 'manage_employees',    label: 'Manage Employees',             description: 'Create, edit and deactivate employee accounts',            roles: { Admin: true, Employee: false, Security: false } },
  { key: 'manage_departments',  label: 'Manage Departments',           description: 'Create and manage department and designation records',      roles: { Admin: true, Employee: false, Security: false } },
  { key: 'view_dashboard',      label: 'View Dashboard & Stats',       description: 'Access real-time stats and operations dashboard',           roles: { Admin: true, Employee: true,  Security: true } },
  { key: 'manage_appointments', label: 'Manage Appointments',          description: 'View and manage pre-scheduled visitor appointments',        roles: { Admin: true, Employee: true,  Security: false } },
  { key: 'manage_admins',       label: 'Manage Administrators',        description: 'Create and manage admin accounts',                         roles: { Admin: true, Employee: false, Security: false } },
  { key: 'scan_qr',             label: 'QR Code Scanning',             description: 'Scan visitor QR codes at entry/exit points',               roles: { Admin: true, Employee: true,  Security: true } },
  { key: 'export_data',         label: 'Export Reports',               description: 'Export visitor logs and reports',                          roles: { Admin: true, Employee: false, Security: false } },
];

router.get('/permissions', async (_req: Request, res: Response): Promise<void> => {
  try {
    const doc = await Settings.findOne({ key: 'role_permissions' });
    res.json(doc ? doc.value : DEFAULT_PERMISSIONS);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

router.put('/permissions', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const permissions = req.body;
    if (!Array.isArray(permissions)) { res.status(400).json({ message: 'Permissions must be an array' }); return; }
    await Settings.findOneAndUpdate(
      { key: 'role_permissions' },
      { key: 'role_permissions', value: permissions, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    const io = req.app.get('io');
    if (io) io.emit('permissions_updated', permissions);
    res.json({ message: 'Permissions saved', permissions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save permissions' });
  }
});

export default router;
