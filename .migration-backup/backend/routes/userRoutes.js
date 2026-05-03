const express = require('express');
const router = express.Router();
const { getUsers, getEmployees, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public: employee list for visitor forms (no auth required)
router.get('/employees', getEmployees);

router.route('/')
  .get(protect, authorize('Admin'), getUsers)
  .post(protect, authorize('Admin'), createUser);

router.route('/:id')
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
