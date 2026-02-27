const mongoose = require('mongoose');

const stockInSchema = new mongoose.Schema({
  sparePart: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SparePart', 
    required: true 
  },
  stockInQuantity: { type: Number, required: true },
  stockInDate: { type: Date, default: Date.now },
  supplier: { type: String },
  notes: { type: String },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('StockIn', stockInSchema);
