require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Department = require('./models/Department');

const seedData = async () => {
  await connectDB();
  
  try {
    // Clear existing users and departments
    await User.deleteMany();
    await Department.deleteMany();

    // Create a department
    const hrDept = await Department.create({ name: 'Human Resources' });
    const engDept = await Department.create({ name: 'Engineering' });

    // Create Admin User
    await User.create({
      name: 'Admin User',
      email: 'admin@vms.com',
      password: 'password123', // In real app, hash this
      role: 'Admin',
      department: hrDept._id
    });

    // Create Employee User
    await User.create({
      name: 'John Doe',
      email: 'employee@vms.com',
      password: 'password123',
      role: 'Employee',
      department: engDept._id
    });

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
