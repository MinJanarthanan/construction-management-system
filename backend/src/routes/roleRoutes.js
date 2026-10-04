const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);

module.exports = router;
