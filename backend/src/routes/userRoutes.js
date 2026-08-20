const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateMe);
router.patch('/me/password', authMiddleware, userController.changePassword);

module.exports = router;
