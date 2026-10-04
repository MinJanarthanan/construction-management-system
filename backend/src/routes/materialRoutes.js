const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Material_Name').trim().notEmpty().withMessage('Material_Name is required.'),
    body('Quantity').isFloat({ min: 0 }).withMessage('Quantity must be >= 0.'),
    body('Unit').notEmpty().withMessage('Unit is required (e.g. kg, ton, bag, m³).'),
    body('Unit_Cost').isFloat({ min: 0 }).withMessage('Unit_Cost must be >= 0.')
  ],
  validateRequest,
  createMaterial
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  updateMaterial
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  deleteMaterial
);

module.exports = router;
