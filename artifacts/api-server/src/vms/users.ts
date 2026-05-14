import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { VmsUser } from './models.js';
import { protect, authorize } from './auth.js';
import { sendInviteEmail } from './notify.js';

const router = Router();

function getFrontendUrl(): string {
  if (process.env['FRONTEND_URL']) return process.env['FRONTEND_URL'].replace(/\/$/, '');
  const replDomains = process.env['REPLIT_DOMAINS'];
  if (replDomains) {
    const first = replDomains.split(',')[0]?.trim();
    if (first) return `https://${first}`;
  }
  const devDomain = process.env['REPLIT_DEV_DOMAIN'];
  if (devDomain) return `https://${devDomain}`;
  return '';
}

router.get('/employees', async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = { role: 'Employee', isActive: true };
    if (req.query.department) filter.department = req.query.department;
    const employees = await VmsUser.find(filter).select('name _id department').populate('department', 'name');
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
  const { name, email, role, department, designation, sendInvite } = req.body;
  try {
    if (await VmsUser.findOne({ email })) { res.status(400).json({ message: 'User already exists' }); return; }

    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tempPassword = await bcrypt.hash(inviteToken, 10);

    const user = await VmsUser.create({
      name, email, password: tempPassword, role: role || 'Employee',
      department, designation, inviteToken, inviteExpires,
    });

    const frontendUrl = getFrontendUrl();
    const inviteUrl = `${frontendUrl}/setup-password?token=${inviteToken}`;
    sendInviteEmail(email, name, inviteUrl).catch(() => {});

    const safe = user.toObject();
    delete (safe as any).password;
    delete (safe as any).inviteToken;
    res.status(201).json({ ...safe, inviteUrl });
  } catch (err: any) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

router.post('/:id/resend-invite', protect, authorize('Admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const user = await VmsUser.findByIdAndUpdate(req.params.id, { inviteToken, inviteExpires }, { new: true });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    const frontendUrl = getFrontendUrl();
    const inviteUrl = `${frontendUrl}/setup-password?token=${inviteToken}`;
    sendInviteEmail(user.email, user.name, inviteUrl).catch(() => {});
    res.json({ message: 'Invite resent', inviteUrl });
  } catch { res.status(500).json({ message: 'Server error' }); }
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
