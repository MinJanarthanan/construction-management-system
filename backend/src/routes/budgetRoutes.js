const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllBudgets,
  getBudgetByProjectId,
  createOrUpdateBudget,
  deleteBudget
} = require('../controllers/financeController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllBudgets);
router.get('/project/:projectId', getBudgetByProjectId);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Accountant'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Total_Budget').isFloat({ min: 0 }).withMessage('Total_Budget must be a positive number.')
  ],
  validateRequest,
  createOrUpdateBudget
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Accountant'),
  deleteBudget
);

module.exports = router;
