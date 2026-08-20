const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, applicationController.apply);
router.get('/', authMiddleware, authMiddleware.requireRole('admin'), applicationController.listByPromotion);

const topRouter = express.Router();
topRouter.get('/me', authMiddleware, applicationController.listMine);
topRouter.patch('/:id/cancel', authMiddleware, applicationController.cancel);

module.exports = router;
module.exports.topRouter = topRouter;
