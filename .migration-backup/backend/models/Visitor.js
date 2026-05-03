const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aadhar: { type: String, sparse: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
