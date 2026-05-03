const express = require('express');
const router = express.Router();
const { scanQR, checkIn, checkOut, getVisitStatus, getGatePass } = require('../controllers/mobileController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/scan', protect, authorize('Security', 'Admin'), scanQR);
router.post('/checkin', protect, authorize('Security', 'Admin'), checkIn);
router.post('/checkout', protect, authorize('Security', 'Admin'), checkOut);
router.get('/status/:id', getVisitStatus);
router.get('/pass/:id', protect, authorize('Security', 'Admin'), getGatePass);

module.exports = router;
