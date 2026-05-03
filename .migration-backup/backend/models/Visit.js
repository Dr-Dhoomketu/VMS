const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  meetWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'CheckedIn', 'CheckedOut'], 
    default: 'Pending' 
  },
  scheduledTime: { type: Date }, // For pre-booking
  fromTime: { type: String },
  toTime: { type: String },
  duration: { type: String },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  qrToken: { type: String }, // Signed JWT for secure QR validation
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
