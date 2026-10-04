const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllProjects,
  getProjectById,
  getProjectSummary,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { validateRequest } = require('../middleware/validator');

router.use(authenticateJWT);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.get('/:id/summary', getProjectSummary);

router.post(
  '/',
  authorizeRoles('Admin', 'Project Manager'),
  [
    body('Project_Name').trim().notEmpty().withMessage('Project Name is required.'),
    body('Start_Date').isISO8601().withMessage('Valid Start Date (YYYY-MM-DD) is required.'),
    body('End_Date').isISO8601().withMessage('Valid End Date (YYYY-MM-DD) is required.')
  ],
  validateRequest,
  createProject
);

router.put(
  '/:id',
  authorizeRoles('Admin', 'Project Manager'),
  updateProject
);

router.delete(
  '/:id',
  authorizeRoles('Admin', 'Project Manager'),
  deleteProject
);

module.exports = router;
