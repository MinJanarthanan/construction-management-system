const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllRoles,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(authenticateJWT);

// Roles dropdown (available to all logged-in users)
router.get('/roles', getAllRoles);

// User listings & management
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Update user (Admin or user updating basic info)
router.put('/:id', authorizeRoles('Admin'), updateUser);

// Delete user (Admin only)
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

module.exports = router;
