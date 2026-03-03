const SparePart = require('../models/sparePart');
const StockIn = require('../models/stockIn');
const StockOut = require('../models/stockOut');

// ===================== SPARE PART CONTROLLERS =====================

exports.getAllSpareParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find();
    res.json(spareParts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spare parts', error: error.message });
  }
};

exports.getSparePartById = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json(sparePart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spare part', error: error.message });
  }
};

exports.createSparePart = async (req, res) => {
  try {
    const { name, category, quantity, unitPrice, description } = req.body;

    if (!name || !category || quantity === undefined || !unitPrice) {
      return res.status(400).json({ message: 'Name, category, quantity, and unitPrice are required' });
    }

    const sparePart = new SparePart({
      name,
      category,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice),
      description,
    });

    await sparePart.save();
    res.status(201).json({ message: 'Spare part created successfully', sparePart });
  } catch (error) {
    res.status(500).json({ message: 'Error creating spare part', error: error.message });
  }
};

exports.updateSparePart = async (req, res) => {
  try {
    const { name, category, quantity, unitPrice, description } = req.body;

    const sparePart = await SparePart.findById(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    if (name) sparePart.name = name;
    if (category) sparePart.category = category;
    if (quantity !== undefined) sparePart.quantity = parseInt(quantity);
    if (unitPrice) sparePart.unitPrice = parseFloat(unitPrice);
    if (description) sparePart.description = description;

    await sparePart.save();
    res.json({ message: 'Spare part updated successfully', sparePart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating spare part', error: error.message });
  }
};

exports.deleteSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findByIdAndDelete(req.params.id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting spare part', error: error.message });
  }
};

// ===================== STOCK IN CONTROLLERS =====================

exports.createStockIn = async (req, res) => {
  try {
    const { sparePartId, stockInQuantity, supplier, notes } = req.body;

    if (!sparePartId || !stockInQuantity) {
      return res.status(400).json({ message: 'Spare part ID and quantity are required' });
    }

    const sparePart = await SparePart.findById(sparePartId);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Create stock in record
    const stockIn = new StockIn({
      sparePart: sparePartId,
      stockInQuantity: parseInt(stockInQuantity),
      supplier,
      notes,
      createdBy: req.user.id,
    });

    await stockIn.save();

    // Update spare part quantity and totalPrice
    sparePart.quantity += parseInt(stockInQuantity);
    sparePart.lastUpdated = Date.now();
    await sparePart.save();

    res.status(201).json({ 
      message: 'Stock in recorded successfully', 
      stockIn,
      updatedSparePart: sparePart 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording stock in', error: error.message });
  }
};

exports.getAllStockIn = async (req, res) => {
  try {
    const stockInRecords = await StockIn.find()
      .populate('sparePart')
      .populate('createdBy', 'username email')
      .sort({ stockInDate: -1 });
    res.json(stockInRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock in records', error: error.message });
  }
};

exports.getStockInById = async (req, res) => {
  try {
    const stockIn = await StockIn.findById(req.params.id)
      .populate('sparePart')
      .populate('createdBy', 'username email');
    if (!stockIn) {
      return res.status(404).json({ message: 'Stock in record not found' });
    }
    res.json(stockIn);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock in record', error: error.message });
  }
};

// ===================== STOCK OUT CONTROLLERS =====================

exports.createStockOut = async (req, res) => {
  try {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice, issuedTo, notes } = req.body;

    if (!sparePartId || !stockOutQuantity || !stockOutUnitPrice) {
      return res.status(400).json({ message: 'Spare part ID, quantity, and unit price are required' });
    }

    const sparePart = await SparePart.findById(sparePartId);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    if (sparePart.quantity < parseInt(stockOutQuantity)) {
      return res.status(400).json({ message: 'Insufficient stock quantity' });
    }

    // Create stock out record
    const stockOut = new StockOut({
      sparePart: sparePartId,
      stockOutQuantity: parseInt(stockOutQuantity),
      stockOutUnitPrice: parseFloat(stockOutUnitPrice),
      issuedTo,
      notes,
      createdBy: req.user.id,
    });

    await stockOut.save();

    // Update spare part quantity and totalPrice
    sparePart.quantity -= parseInt(stockOutQuantity);
    sparePart.lastUpdated = Date.now();
    await sparePart.save();

    res.status(201).json({ 
      message: 'Stock out recorded successfully', 
      stockOut,
      updatedSparePart: sparePart 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording stock out', error: error.message });
  }
};

exports.getAllStockOut = async (req, res) => {
  try {
    const stockOutRecords = await StockOut.find()
      .populate('sparePart')
      .populate('createdBy', 'username email')
      .sort({ stockOutDate: -1 });
    res.json(stockOutRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock out records', error: error.message });
  }
};

exports.getStockOutById = async (req, res) => {
  try {
    const stockOut = await StockOut.findById(req.params.id)
      .populate('sparePart')
      .populate('createdBy', 'username email');
    if (!stockOut) {
      return res.status(404).json({ message: 'Stock out record not found' });
    }
    res.json(stockOut);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock out record', error: error.message });
  }
};

// ===================== DASHBOARD STATS =====================

exports.getDashboardStats = async (req, res) => {
  try {
    const totalSpareParts = await SparePart.countDocuments();
    const totalStockValue = await SparePart.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const stockInCount = await StockIn.countDocuments();
    const stockOutCount = await StockOut.countDocuments();

    const lowStockItems = await SparePart.find({ quantity: { $lte: 5 } });

    res.json({
      totalSpareParts,
      totalStockValue: totalStockValue[0]?.total || 0,
      stockInCount,
      stockOutCount,
      lowStockItems: lowStockItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// ===================== FULL STOCK REPORT =====================

// Returns a combined list of stock in/out transactions sorted by date
exports.getStockReport = async (req, res) => {
  try {
    // fetch both types of records
    const stockIns = await StockIn.find()
      .populate('sparePart')
      .populate('createdBy', 'username email');
    const stockOuts = await StockOut.find()
      .populate('sparePart')
      .populate('createdBy', 'username email');

    // build unified array with a type flag
    const combined = [];

    stockIns.forEach(si => {
      combined.push({
        type: 'IN',
        date: si.stockInDate,
        sparePart: si.sparePart,
        quantity: si.stockInQuantity,
        supplier: si.supplier,
        notes: si.notes,
        createdBy: si.createdBy,
      });
    });

    stockOuts.forEach(so => {
      combined.push({
        type: 'OUT',
        date: so.stockOutDate,
        sparePart: so.sparePart,
        quantity: so.stockOutQuantity,
        unitPrice: so.stockOutUnitPrice,
        totalPrice: so.stockOutTotalPrice,
        issuedTo: so.issuedTo,
        notes: so.notes,
        createdBy: so.createdBy,
      });
    });

    // sort descending by date
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock report', error: error.message });
  }
};
