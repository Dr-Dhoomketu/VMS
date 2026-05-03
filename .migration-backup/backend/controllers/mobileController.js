const Visit = require('../models/Visit');
const { verifySecureQR } = require('../services/qrService');
const logger = require('../utils/logger');

// @desc    Scan and Decode QR Code
// @route   POST /api/v1/mobile/scan
// @access  Private (Security)
const scanQR = async (req, res) => {
  const { qrData } = req.body; // Expected { visitId, token }
  
  if (!qrData || !qrData.token || !qrData.visitId) {
    return res.status(400).json({ message: 'Invalid QR format' });
  }

  const decoded = verifySecureQR(qrData.token);
  if (!decoded || decoded.visitId !== qrData.visitId) {
    return res.status(401).json({ message: 'Invalid or expired QR code' });
  }

  try {
    const visit = await Visit.findById(decoded.visitId)
      .populate('visitor', 'name aadhar phone imageUrl')
      .populate('meetWith', 'name department');
      
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark Check-In
// @route   POST /api/v1/mobile/checkin
// @access  Private (Security)
const checkIn = async (req, res) => {
  const { visitId } = req.body;

  try {
    const visit = await Visit.findById(visitId);
    
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    
    // Validation Logic
    if (visit.status !== 'Approved') {
      return res.status(400).json({ message: `Cannot check-in. Current status is ${visit.status}` });
    }

    // Time validation (e.g. check if scheduled for today)
    if (visit.scheduledTime) {
      const today = new Date().setHours(0,0,0,0);
      const visitDate = new Date(visit.scheduledTime).setHours(0,0,0,0);
      if (today !== visitDate) {
         return res.status(400).json({ message: 'Visit is not scheduled for today.' });
      }
    }

    visit.status = 'CheckedIn';
    visit.checkInTime = new Date();
    await visit.save();

    req.io.to('admin_channel').emit('check_in', { visitId: visit._id });
    req.io.emit('scan_events', { action: 'CheckIn', visitId: visit._id });

    res.json({ message: 'Checked in successfully', visit });
  } catch (error) {
    logger.error(`Error in checkIn: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark Check-Out
// @route   POST /api/v1/mobile/checkout
// @access  Private (Security)
const checkOut = async (req, res) => {
  const { visitId } = req.body;

  try {
    const visit = await Visit.findById(visitId);
    
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    if (visit.status !== 'CheckedIn') {
      return res.status(400).json({ message: `Cannot check-out. Visitor is ${visit.status}` });
    }

    visit.status = 'CheckedOut';
    visit.checkOutTime = new Date();
    await visit.save();

    req.io.to('admin_channel').emit('check_out', { visitId: visit._id });
    req.io.emit('scan_events', { action: 'CheckOut', visitId: visit._id });

    res.json({ message: 'Checked out successfully', visit });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get live approval status for mobile app polling
// @route   GET /api/v1/mobile/status/:id
// @access  Public
const getVisitStatus = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id).select('status');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    res.json({ status: visit.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Gate Pass Data
// @route   GET /api/v1/mobile/pass/:id
// @access  Private (Security)
const getGatePass = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('visitor')
      .populate('meetWith');
    
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { scanQR, checkIn, checkOut, getVisitStatus, getGatePass };
