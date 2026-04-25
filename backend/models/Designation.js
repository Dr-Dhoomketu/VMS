const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Designation', DesignationSchema);
