import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { VmsUser, Department, Designation } from './models.js';

const MONGO_URI = process.env['MONGODB_URI'] || process.env['MONGO_URI'] || '';

async function seed() {
  if (!MONGO_URI) { console.error('No MONGODB_URI set'); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@visitorpass.com';
  const existingAdmin = await VmsUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await VmsUser.create({
      name: 'Admin User', email: adminEmail,
      password: hashed, role: 'Admin', isActive: true,
    });
    console.log('Created admin:', adminEmail);
  } else {
    const isHashed = existingAdmin.password.startsWith('$2');
    if (!isHashed) {
      existingAdmin.password = await bcrypt.hash(existingAdmin.password, 10);
      await existingAdmin.save();
      console.log('Migrated admin password to hash');
    } else {
      console.log('Admin already exists:', adminEmail);
    }
  }

  const deptNames = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Marketing'];
  for (const name of deptNames) {
    const exists = await Department.findOne({ name });
    if (!exists) {
      await Department.create({ name, code: name.replace(/\s+/g, '').slice(0, 3).toUpperCase() });
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
  const empEmail = 'employee@visitorpass.com';
  const emp = await VmsUser.findOne({ email: empEmail });
  if (!emp && eng && mgr) {
    const hashed = await bcrypt.hash('employee123', 10);
    await VmsUser.create({
      name: 'John Smith', email: empEmail,
      password: hashed, role: 'Employee', isActive: true,
      department: eng._id, designation: mgr._id,
    });
    console.log('Created employee:', empEmail);
  } else if (emp) {
    const isHashed = emp.password.startsWith('$2');
    if (!isHashed) {
      emp.password = await bcrypt.hash(emp.password, 10);
      await emp.save();
      console.log('Migrated employee password to hash');
    } else {
      console.log('Employee already exists:', empEmail);
    }
  }

  console.log('\nSeed complete!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
