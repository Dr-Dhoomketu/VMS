const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  requestVisit, getPendingVisits, updateVisitStatus, 
  checkoutVisit, getAllVisits, getHistoryByPhone, getStats 
} = require('../controllers/visitController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/';
    // Ensure directory exists
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.post('/request', upload.single('webcamImage'), requestVisit);
router.get('/', protect, authorize('Admin'), getAllVisits);
router.get('/pending', protect, authorize('Admin', 'Employee'), getPendingVisits);
router.put('/:id/status', protect, authorize('Admin', 'Employee'), updateVisitStatus);
router.post('/:id/checkout', protect, authorize('Admin'), checkoutVisit);
router.get('/history', getHistoryByPhone);
router.get('/stats', protect, authorize('Admin'), getStats);

module.exports = router;
