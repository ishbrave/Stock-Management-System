const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all stock routes
router.use(authMiddleware);

// ===================== SPARE PART ROUTES =====================

router.get('/spare-parts', stockController.getAllSpareParts);
router.get('/spare-parts/:id', stockController.getSparePartById);
router.post('/spare-parts', stockController.createSparePart);
router.put('/spare-parts/:id', stockController.updateSparePart);
router.delete('/spare-parts/:id', stockController.deleteSparePart);

// ===================== STOCK IN ROUTES =====================

router.get('/stock-in', stockController.getAllStockIn);
router.get('/stock-in/:id', stockController.getStockInById);
router.post('/stock-in', stockController.createStockIn);

// ===================== STOCK OUT ROUTES =====================

router.get('/stock-out', stockController.getAllStockOut);
router.get('/stock-out/:id', stockController.getStockOutById);
router.post('/stock-out', stockController.createStockOut);

// ===================== DASHBOARD STATS =====================

router.get('/dashboard/stats', stockController.getDashboardStats);

// ===================== REPORTS =====================
// combined in/out transaction history
router.get('/reports', stockController.getStockReport);

module.exports = router;
