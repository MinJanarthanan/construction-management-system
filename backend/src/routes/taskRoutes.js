const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Task_Name').trim().notEmpty().withMessage('Task Name is required.'),
    body('Start_Date').isISO8601().withMessage('Valid Start Date is required.'),
    body('Due_Date').isISO8601().withMessage('Valid Due Date is required.')
  ],
  validateRequest,
  createTask
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer', 'Site Supervisor'),
  updateTask
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  deleteTask
);

module.exports = router;
