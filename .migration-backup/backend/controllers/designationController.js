const Designation = require('../models/Designation');

const getDesignations = async (req, res) => {
  try {
    const designations = await Designation.find();
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createDesignation = async (req, res) => {
  const { name, level } = req.body;
  try {
    const desExists = await Designation.findOne({ name });
    if (desExists) return res.status(400).json({ message: 'Designation already exists' });
    
    const designation = await Designation.create({ name, level });
    res.status(201).json(designation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { name, level } = req.body;
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      { name, level },
      { new: true, runValidators: true }
    );
    if (!designation) return res.status(404).json({ message: 'Designation not found' });
    res.status(200).json(designation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    await Designation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Designation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDesignations, createDesignation, updateDesignation, deleteDesignation };
