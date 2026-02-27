const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const stockRoutes = require('./stockRoutes');

//Auth routes (no auth middleware needed)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Token validation route (protected by auth middleware)
router.get('/validate-token', authMiddleware, authController.validateToken);

// Stock management routes (auth middleware applied in stockRoutes)
router.use('/stock', stockRoutes);

module.exports = router;