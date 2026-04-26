const Visit = require('../models/Visit');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { generateSecureQR } = require('../services/qrService');
const logger = require('../utils/logger');

// @desc    Register a new visit request
// @route   POST /api/v1/visits/request
// @access  Public
const requestVisit = async (req, res) => {
  const { 
    name, aadhar, phone, email, address, gender, 
    meetWith, purpose, scheduledTime, fromTime, toTime, duration 
  } = req.body;

  try {
    // Only look up existing visitor by aadhar if it was provided
    let visitor = null;
    if (aadhar) {
      visitor = await Visitor.findOne({ aadhar });
    }
    if (!visitor) {
      visitor = await Visitor.create({
        name, phone, email, address, gender,
        aadhar: aadhar || undefined,
        imageUrl: req.file ? `/public/uploads/${req.file.filename}` : null
      });
    }

    const visit = await Visit.create({
      visitor: visitor._id,
      meetWith,
      purpose,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      fromTime,
      toTime,
      duration,
      status: 'Pending'
    });

    const employee = await User.findById(meetWith);
    if (employee) {
      sendEmail(
        employee.email,
        'New Visitor Request',
        `You have a new visitor: ${visitor.name}. Purpose: ${purpose}. Please check your dashboard to approve or reject.`
      );
    }

    req.io.to('admin_channel').emit('new_visit', { visitId: visit._id, visitorName: visitor.name });
    if (employee) {
      req.io.to(`employee_${employee._id}`).emit('new_visit_request', { visitId: visit._id, visitorName: visitor.name });
    }

    res.status(201).json({ message: 'Visit request submitted successfully', visitId: visit._id });
  } catch (error) {
    logger.error(`Error in requestVisit: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get pending visits for approval dashboard
// @route   GET /api/v1/visits/pending
// @access  Private (Admin/Employee)
const getPendingVisits = async (req, res) => {
  try {
    let query = { status: 'Pending' };
    if (req.user.role === 'Employee') {
      query.meetWith = req.user._id;
    }

    const visits = await Visit.find(query)
      .populate('visitor', 'name phone imageUrl')
      .populate('meetWith', 'name');

    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve or Reject Visit
// @route   PUT /api/v1/visits/:id/status
// @access  Private (Admin/Employee)
const updateVisitStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const visit = await Visit.findById(req.params.id).populate('visitor').populate('meetWith');
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (req.user.role === 'Employee' && visit.meetWith._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this visit' });
    }

    visit.status = status;

    if (status === 'Approved') {
      const { token, qrImage } = await generateSecureQR(visit._id);
      visit.qrToken = token;

      if (visit.visitor.email) {
        const hostName = visit.meetWith ? visit.meetWith.name : 'your host';
        const dateStr = visit.scheduledTime ? new Date(visit.scheduledTime).toLocaleDateString() : new Date().toLocaleDateString();
        
        const gatePassHtml = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; padding: 40px 20px; color: #1d1d1f; line-height: 1.6;">
            <div style="max-w-md mx-auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 auto; max-width: 450px;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #111111, #000000); padding: 30px 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 4px;">Premium VMS</h2>
                <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 28px; font-weight: 300;">Digital Gate Pass</h1>
              </div>

              <!-- Body -->
              <div style="padding: 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #86868b; text-align: center;">
                  Hello <strong>${visit.visitor.name}</strong>,<br>Your visit has been approved by ${hostName}.
                </p>

                <div style="background: #fbfbfd; border-radius: 16px; padding: 20px; margin-bottom: 30px; border: 1px solid #e5e5ea;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding-bottom: 15px;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #86868b;">Date</div>
                        <div style="font-size: 16px; font-weight: 600; color: #1d1d1f;">${dateStr}</div>
                      </td>
                      <td style="padding-bottom: 15px; text-align: right;">
                        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #86868b;">Purpose</div>
                        <div style="font-size: 16px; font-weight: 600; color: #1d1d1f;">${visit.purpose || 'Meeting'}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- QR Code Section -->
                <div style="text-align: center;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #86868b; margin-bottom: 15px;">Scan at Terminal</div>
                  <div style="display: inline-block; padding: 15px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #f0f0f0;">
                    <img src="${qrImage}" alt="Secure QR Code" style="width: 200px; height: 200px; display: block;" />
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #fbfbfd; padding: 20px; text-align: center; border-top: 1px solid #e5e5ea;">
                <p style="margin: 0; font-size: 12px; color: #86868b;">
                  Please present this QR code at the security desk upon arrival.
                </p>
              </div>

            </div>
          </div>
        `;

        sendEmail(
          visit.visitor.email,
          'Your Digital Gate Pass - Visit Approved',
          `Your visit has been approved. Please show this QR code at the gate.`,
          gatePassHtml
        );
      }
    } else {
      if (visit.visitor.email) {
        sendEmail(
          visit.visitor.email,
          'Visit Rejected',
          `Sorry, your visit request was declined by ${visit.meetWith.name}.`
        );
      }
    }

    await visit.save();

    req.io.emit('approval_updates', { visitId: visit._id, status });
    req.io.to('admin_channel').emit('visit_updated', { visitId: visit._id, status });

    res.json({ message: `Visit ${status.toLowerCase()}`, visit });
  } catch (error) {
    logger.error(`Error in updateVisitStatus: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check-out Visit
// @route   POST /api/v1/visits/:id/checkout
// @access  Private (Admin/Security)
const checkoutVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Visit not found' });

    visit.status = 'CheckedOut';
    visit.checkoutTime = Date.now();
    await visit.save();

    req.io.emit('visit_updated', { visitId: visit._id, status: 'CheckedOut' });
    res.json({ message: 'Visitor checked out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all visits (with filtering)
// @route   GET /api/v1/visits
// @access  Private (Admin)
const getAllVisits = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const visits = await Visit.find(query)
      .populate('visitor')
      .populate('meetWith', 'name')
      .sort({ createdAt: -1 });

    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get visitor history by phone number
// @route   GET /api/v1/visits/history?phone=123
// @access  Public
const getHistoryByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });

    const visitor = await Visitor.findOne({ phone });
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    const lastVisit = await Visit.findOne({ visitor: visitor._id }).sort({ createdAt: -1 }).populate('meetWith', 'name');

    res.json({ visitor, lastVisit });
  } catch (error) {
    logger.error(`Error in getHistoryByPhone: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/v1/visits/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const total = await Visit.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = await Visit.countDocuments({ createdAt: { $gte: todayStart } });
    const checkedIn = await Visit.countDocuments({ status: 'Approved' }); // Approved means checked in for this VMS
    const checkedOut = await Visit.countDocuments({ status: 'CheckedOut' });
    const preVisitor = await Visit.countDocuments({ scheduledTime: { $ne: null } });

    res.json({ total, today, checkedIn, checkedOut, preVisitor });
  } catch (error) {
    logger.error(`Error in getStats: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get approved visits
// @route   GET /api/v1/visits/approved
// @access  Private (Admin/Employee)
const getApprovedVisits = async (req, res) => {
  try {
    let query = { status: 'Approved' };
    if (req.user.role === 'Employee') {
      query.meetWith = req.user._id;
    }
    const visits = await Visit.find(query)
      .populate('visitor', 'name phone email imageUrl aadhar gender address')
      .populate('meetWith', 'name email')
      .sort({ updatedAt: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  requestVisit, getPendingVisits, updateVisitStatus, 
  checkoutVisit, getAllVisits, getHistoryByPhone, getStats, getApprovedVisits
};
