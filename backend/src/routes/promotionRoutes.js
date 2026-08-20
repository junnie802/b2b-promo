const express = require('express');
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middlewares/authMiddleware');
const applicationRoutes = require('./applicationRoutes');

const router = express.Router();

router.get('/', authMiddleware, promotionController.list);
router.get('/:id', authMiddleware, promotionController.getById);
router.post('/', authMiddleware, authMiddleware.requireRole('admin'), promotionController.create);
router.patch('/:id', authMiddleware, authMiddleware.requireRole('admin'), promotionController.update);
router.patch('/:id/status', authMiddleware, authMiddleware.requireRole('admin'), promotionController.changeStatus);
router.use('/:id/applications', applicationRoutes);

module.exports = router;
