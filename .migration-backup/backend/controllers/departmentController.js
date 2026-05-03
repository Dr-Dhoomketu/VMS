const Department = require('../models/Department');

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    console.log(`[DATABASE] ATTEMPTING TO SAVE DEPARTMENT: ${name} (${code || 'No Code'})`);
    const deptExists = await Department.findOne({ name });
    if (deptExists) return res.status(400).json({ message: 'Department already exists' });
    
    const department = await Department.create({ name, code });
    console.log(`[DATABASE] SUCCESS: DEPARTMENT SAVED -> ${name}`);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code },
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
