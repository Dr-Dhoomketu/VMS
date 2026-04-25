const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      console.log(`\n[DATABASE] CONNECTING TO PRODUCTION DATABASE...`);
      await mongoose.connect(process.env.MONGO_URI);
      console.log(`[DATABASE] CONNECTED: Production Database Active\n`);
    } else {
      console.log(`\n[DATABASE] INITIALIZING MEMORY SERVER...`);
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      await mongoose.connect(uri);
      console.log(`[DATABASE] CONNECTED: Memory Server Active`);
      console.log(`[DATABASE] MODE: LOCAL DEVELOPMENT\n`);
      
      // Auto-seed required data for testing
      const User = require('../models/User');
      const Department = require('../models/Department');
      const Designation = require('../models/Designation');
      
      if (await User.countDocuments() === 0) {
        console.log('[DATABASE] SEEDING INITIAL ACCOUNTS...');
        const hr = await Department.create({ name: 'Human Resources', code: 'HR' });
        const manager = await Designation.create({ name: 'Manager', level: 5 });
        
        await User.create({ 
          name: 'Admin', 
          email: 'admin@vms.com', 
          password: 'password123', 
          role: 'Admin', 
          department: hr._id,
          designation: manager._id
        });

        // Seed Generic Teams
        const it = await Department.create({ name: 'Information Technology', code: 'IT' });
        const gen = await Department.create({ name: 'General', code: 'GEN' });
        const staff = await Designation.create({ name: 'Staff', level: 1 });

        await User.insertMany([
          { name: 'IT Team', email: 'it@vms.com', password: 'password123', role: 'Employee', department: it._id, designation: staff._id },
          { name: 'HR Team', email: 'hr@vms.com', password: 'password123', role: 'Employee', department: hr._id, designation: staff._id },
          { name: 'General Team', email: 'general@vms.com', password: 'password123', role: 'Employee', department: gen._id, designation: staff._id }
        ]);

        console.log('[DATABASE] SEED COMPLETE: Login with admin@vms.com / password123');
      }
    }
  } catch (error) {
    console.error(`\n[DATABASE] ERROR: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
