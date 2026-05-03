import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { VmsUser, Department, Designation } from './models.js';

const MONGO_URI = process.env['MONGODB_URI'] || process.env['MONGO_URI'] || '';

async function ensureUser(
  email: string, name: string, password: string, role: string,
  extra: Record<string, unknown> = {}
) {
  const existing = await VmsUser.findOne({ email }).select('+password');
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await VmsUser.create({ name, email, password: hashed, role, isActive: true, ...extra });
    console.log(`Created ${role.toLowerCase()}: ${email}`);
    return true;
  }
  if (!existing.password.startsWith('$2')) {
    existing.password = await bcrypt.hash(existing.password, 10);
    await existing.save();
    console.log(`Migrated password to bcrypt for: ${email}`);
  }
  return false;
}

export async function autoSeed() {
  const deptData = [
    { name: 'IT', code: 'IT' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'General', code: 'GEN' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Engineering', code: 'ENG' },
  ];
  for (const d of deptData) {
    const exists = await Department.findOne({ name: d.name });
    if (!exists) {
      await Department.create(d);
      console.log('Created dept:', d.name);
    }
  }

  const desNames = [
    { name: 'Director', level: '1' },
    { name: 'Manager', level: '2' },
    { name: 'Senior Engineer', level: '3' },
    { name: 'Engineer', level: '4' },
    { name: 'Analyst', level: '5' },
  ];
  for (const d of desNames) {
    const exists = await Designation.findOne({ name: d.name });
    if (!exists) {
      await Designation.create(d);
      console.log('Created designation:', d.name);
    }
  }

  const it = await Department.findOne({ name: 'IT' });
  const hr = await Department.findOne({ name: 'Human Resources' });
  const gen = await Department.findOne({ name: 'General' });
  const mgr = await Designation.findOne({ name: 'Manager' });
  const eng = await Department.findOne({ name: 'Engineering' });

  await ensureUser('admin@vms.com', 'Admin User', 'password123', 'Admin');
  await ensureUser('it@vms.com', 'IT Employee', 'password123', 'Employee', { department: it?._id, designation: mgr?._id });
  await ensureUser('hr@vms.com', 'HR Employee', 'password123', 'Employee', { department: hr?._id, designation: mgr?._id });
  await ensureUser('general@vms.com', 'General Employee', 'password123', 'Employee', { department: gen?._id, designation: mgr?._id });

  await ensureUser('admin@visitorpass.com', 'Admin User', 'admin123', 'Admin');
  await ensureUser('employee@visitorpass.com', 'John Smith', 'employee123', 'Employee', { department: eng?._id, designation: mgr?._id });

  console.log('Auto-seed complete.');
}

async function seed() {
  if (!MONGO_URI) { console.error('No MONGODB_URI set'); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  await autoSeed();
  console.log('\nSeed complete!');
  await mongoose.disconnect();
}

if (process.argv[1] && process.argv[1].includes('seed')) {
  seed().catch(err => { console.error(err); process.exit(1); });
}

export default seed;
