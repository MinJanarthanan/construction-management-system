const express = require('express');
const router = express.Router();
const {
  getBudgetVsActualReport,
  getProjectProgressReport,
  getDashboardStats,
  exportFinancialsCsv,
  exportProgressCsv,
  exportInventoryCsv,
  exportSiteFormsSummaryCsv
} = require('../controllers/reportController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/dashboard-stats', getDashboardStats);
router.get('/budget-vs-actual', getBudgetVsActualReport);
router.get('/project-progress', getProjectProgressReport);

// Exports
router.get('/export/financials', exportFinancialsCsv);
router.get('/export/progress', exportProgressCsv);
router.get('/export/inventory', exportInventoryCsv);
router.get('/export/site-forms', exportSiteFormsSummaryCsv);

module.exports = router;
