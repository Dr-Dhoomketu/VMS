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
        const dateStr = visit.scheduledTime ? new Date(visit.scheduledTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString();
        const baseUrl = process.env.BASE_URL || 'https://vms-pa97.onrender.com';
        const visitorPhoto = visit.visitor.imageUrl ? `${baseUrl}${visit.visitor.imageUrl}` : null;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(visit.qrToken)}&color=ffffff&bgcolor=000000`;
        const passId = `VMS-${visit._id.toString().slice(-6).toUpperCase()}`;

        const gatePassHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
              <tr>
                <td align="center" style="padding: 40px 10px;">
                  
                  <!-- Premium Card Container -->
                  <div style="max-width: 480px; width: 100%; background-color: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8); margin: 0 auto; text-align: left;">
                    
                    <!-- Top Accent -->
                    <div style="height: 4px; background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.1) 100%);"></div>

                    <!-- Header -->
                    <div style="padding: 30px 40px; background-color: #ffffff; display: block; text-align: center;">
                      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 5px; color: #888888; margin-bottom: 4px;">Premium VMS</div>
                      <div style="font-size: 22px; font-weight: 900; letter-spacing: -1px; color: #000000; text-transform: uppercase;">Digital Gate Pass</div>
                    </div>

                    <!-- Body -->
                    <div style="padding: 40px;">
                      
                      <!-- Greeting -->
                      <div style="text-align: center; margin-bottom: 35px;">
                        <p style="margin: 0; font-size: 16px; color: #86868b;">Hello <strong>${visit.visitor.name}</strong>,</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #555555;">Your access request has been authorized.</p>
                      </div>

                      <!-- Photo & QR Section -->
                      <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td align="center" style="padding-bottom: 25px;">
                               <div style="width: 200px; height: 200px; background-color: #000000; border-radius: 16px; padding: 15px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 30px rgba(255,255,255,0.05);">
                                 <img src="${qrUrl}" alt="Secure QR" width="200" height="200" style="display: block; border-radius: 8px;" />
                               </div>
                               <div style="margin-top: 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #555555; font-weight: 800;">Scan at Terminal</div>
                            </td>
                          </tr>
                          ${visitorPhoto ? `
                          <tr>
                            <td align="center">
                              <div style="width: 80px; height: 100px; border-radius: 12px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); display: inline-block;">
                                <img src="${visitorPhoto}" alt="Visitor" width="80" height="100" style="display: block; object-fit: cover;" />
                              </div>
                              <div style="margin-top: 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #444444; font-weight: 800;">Photo ID</div>
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </div>

                      <!-- Visit Details -->
                      <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding-bottom: 20px;">
                              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555555; font-weight: 800; margin-bottom: 4px;">Host / Meet With</div>
                              <div style="font-size: 15px; color: #ffffff; font-weight: 600;">${hostName}</div>
                            </td>
                            <td style="padding-bottom: 20px; text-align: right;">
                              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555555; font-weight: 800; margin-bottom: 4px;">Pass ID</div>
                              <div style="font-size: 15px; color: #ffffff; font-weight: 600; font-family: monospace;">${passId}</div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555555; font-weight: 800; margin-bottom: 4px;">Visit Date</div>
                              <div style="font-size: 15px; color: #ffffff; font-weight: 600;">${dateStr}</div>
                            </td>
                            <td style="text-align: right;">
                              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #555555; font-weight: 800; margin-bottom: 4px;">Purpose</div>
                              <div style="font-size: 15px; color: #ffffff; font-weight: 600;">${visit.purpose || 'Meeting'}</div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Instructions -->
                      <div style="margin-top: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px;">
                        <p style="margin: 0; font-size: 12px; color: #555555; line-height: 1.8;">
                          Please present this digital pass at the entrance.<br>
                          Authorization is valid only for the date mentioned above.
                        </p>
                      </div>

                    </div>

                    <!-- Footer -->
                    <div style="padding: 25px 40px; background-color: #050505; text-align: center; border-top: 1px solid rgba(255,255,255,0.03);">
                      <div style="font-size: 10px; color: #333333; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;">ValueTech Systems</div>
                    </div>

                  </div>

                  <!-- Branding -->
                  <p style="margin-top: 30px; font-size: 11px; color: #444444; letter-spacing: 1px; font-weight: 600;">PROTECTED BY PREMIUM VMS 2.0</p>

                </td>
              </tr>
            </table>
          </body>
          </html>
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
