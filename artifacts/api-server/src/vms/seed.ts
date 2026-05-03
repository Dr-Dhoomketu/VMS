import mongoose from 'mongoose';
import { VmsUser, Department, Designation } from './models.js';

const MONGO_URI = process.env['MONGODB_URI'] || process.env['MONGO_URI'] || '';

async function seed() {
  if (!MONGO_URI) { console.error('No MONGODB_URI set'); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existingAdmin = await VmsUser.findOne({ email: 'admin@visitorpass.com' });
  if (!existingAdmin) {
    const admin = await VmsUser.create({
      name: 'Admin User', email: 'admin@visitorpass.com',
      password: 'admin123', role: 'Admin', isActive: true,
    });
    console.log('Created admin:', admin.email);
  } else {
    console.log('Admin already exists:', existingAdmin.email);
  }

  const deptNames = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Marketing'];
  for (const name of deptNames) {
    const exists = await Department.findOne({ name });
    if (!exists) {
      await Department.create({ name, code: name.slice(0,3).toUpperCase() });
      console.log('Created dept:', name);
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

  const eng = await Department.findOne({ name: 'Engineering' });
  const mgr = await Designation.findOne({ name: 'Manager' });
  const emp = await VmsUser.findOne({ email: 'employee@visitorpass.com' });
  if (!emp && eng && mgr) {
    await VmsUser.create({
      name: 'John Smith', email: 'employee@visitorpass.com',
      password: 'employee123', role: 'Employee', isActive: true,
      department: eng._id, designation: mgr._id,
    });
    console.log('Created employee: employee@visitorpass.com');
  }

  console.log('\nSeed complete!');
  console.log('  Admin login:    admin@visitorpass.com / admin123');
  console.log('  Employee login: employee@visitorpass.com / employee123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
