const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).populate('department designation').select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public endpoint: only returns employees for dropdown lists
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('name _id');
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role, department, designation } = req.body;
  try {
    console.log(`[DATABASE] ATTEMPTING TO SAVE ${role}: ${name} (${email})`);
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role, department, designation });
    console.log(`[DATABASE] SUCCESS: ${role} SAVED -> ${name}`);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, designation } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, designation },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, getEmployees, createUser, updateUser, deleteUser };
