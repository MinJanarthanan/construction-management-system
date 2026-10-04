const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { verifyToken } = require('../middleware/auth');

// All authenticated roles can access site forms and analytics
router.use(verifyToken);

router.get('/', formController.getForms);
router.get('/stats', formController.getFormStats);
router.get('/filter-options', formController.getFilterOptions);
router.get('/export', formController.exportFormsCsv);

module.exports = router;
