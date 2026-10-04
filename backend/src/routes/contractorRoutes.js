const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllContractors,
  getContractorById,
  createContractor,
  updateContractor,
  deleteContractor
} = require('../controllers/contractorController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllContractors);
router.get('/:id', getContractorById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager'),
  [
    body('Contractor_Name').trim().notEmpty().withMessage('Contractor Name is required.'),
    body('Phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('Email').isEmail().withMessage('Valid email is required.'),
    body('Address').trim().notEmpty().withMessage('Address is required.')
  ],
  validateRequest,
  createContractor
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager'),
  updateContractor
);

router.delete(
  '/:id',
  authorizeRoles('Admin'),
  deleteContractor
);

module.exports = router;
