const express = require('express');
const router = express.Router();
const { getDesignations, createDesignation, updateDesignation, deleteDesignation } = require('../controllers/designationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getDesignations)
  .post(protect, authorize('Admin'), createDesignation);

router.route('/:id')
  .put(protect, authorize('Admin'), updateDesignation)
  .delete(protect, authorize('Admin'), deleteDesignation);

module.exports = router;
