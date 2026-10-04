const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} = require('../controllers/resourceController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllResources);
router.get('/:id', getResourceById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Resource_Name').trim().notEmpty().withMessage('Resource_Name is required.'),
    body('Type').notEmpty().withMessage('Resource Type is required (e.g. Equipment, Manpower, Subcontract).'),
    body('Quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number.'),
    body('Unit').notEmpty().withMessage('Unit is required.')
  ],
  validateRequest,
  createResource
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  updateResource
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  deleteResource
);

module.exports = router;
