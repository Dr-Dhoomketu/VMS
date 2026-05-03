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
    }

    // Auto-seed required data for production AND local testing
    const User = require('../models/User');
    const Department = require('../models/Department');
    const Designation = require('../models/Designation');
    
    const adminEmail = 'admin@vms.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('[DATABASE] ADMIN NOT FOUND. SEEDING INITIAL ACCOUNTS...');
      
      let hr = await Department.findOne({ code: 'HR' });
      if (!hr) hr = await Department.create({ name: 'Human Resources', code: 'HR' });
      
      let manager = await Designation.findOne({ name: 'Manager' });
      if (!manager) manager = await Designation.create({ name: 'Manager', level: 5 });
      
      await User.create({ 
        name: 'Admin', 
        email: adminEmail, 
        password: 'password123', 
        role: 'Admin', 
        department: hr._id,
        designation: manager._id
      });

      // Seed Generic Teams
      let it = await Department.findOne({ code: 'IT' });
      if (!it) it = await Department.create({ name: 'Information Technology', code: 'IT' });
      
      let gen = await Department.findOne({ code: 'GEN' });
      if (!gen) gen = await Department.create({ name: 'General', code: 'GEN' });
      
      let staff = await Designation.findOne({ name: 'Staff' });
      if (!staff) staff = await Designation.create({ name: 'Staff', level: 1 });

      const teams = [
        { name: 'IT Team', email: 'it@vms.com', password: 'password123', role: 'Employee', department: it._id, designation: staff._id },
        { name: 'HR Team', email: 'hr@vms.com', password: 'password123', role: 'Employee', department: hr._id, designation: staff._id },
        { name: 'General Team', email: 'general@vms.com', password: 'password123', role: 'Employee', department: gen._id, designation: staff._id }
      ];

      for (const team of teams) {
        const teamExists = await User.findOne({ email: team.email });
        if (!teamExists) await User.create(team);
      }

      console.log(`[DATABASE] SEED COMPLETE: Admin account created (${adminEmail})`);
    } else {
      console.log(`[DATABASE] VERIFIED: Admin account exists (${adminEmail})`);
    }
  } catch (error) {
    console.error(`\n[DATABASE] ERROR: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
