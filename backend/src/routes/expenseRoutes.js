const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/financeController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Accountant', 'Site Engineer', 'Site Supervisor'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Category').isIn(['Labor', 'Material', 'Equipment', 'Misc']).withMessage('Category must be Labor, Material, Equipment, or Misc.'),
    body('Amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number.'),
    body('Expense_Date').isISO8601().withMessage('Valid Expense_Date is required.')
  ],
  validateRequest,
  createExpense
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Accountant'),
  updateExpense
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Accountant'),
  deleteExpense
);

module.exports = router;
