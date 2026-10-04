const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllMilestones);
router.get('/:id', getMilestoneById);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  [
    body('Project_ID').isInt().withMessage('Project_ID is required.'),
    body('Milestone_Name').trim().notEmpty().withMessage('Milestone Name is required.'),
    body('Due_Date').isISO8601().withMessage('Valid Due Date is required.')
  ],
  validateRequest,
  createMilestone
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  updateMilestone
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager', 'Site Engineer'),
  deleteMilestone
);

module.exports = router;
