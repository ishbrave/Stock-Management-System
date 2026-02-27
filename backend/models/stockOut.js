const mongoose = require('mongoose');

const stockOutSchema = new mongoose.Schema({
  sparePart: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SparePart', 
    required: true 
  },
  stockOutQuantity: { type: Number, required: true },
  stockOutUnitPrice: { type: Number, required: true },
  stockOutTotalPrice: { type: Number, default: 0 },
  stockOutDate: { type: Date, default: Date.now },
  issuedTo: { type: String },
  notes: { type: String },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

// Calculate total price before saving
stockOutSchema.pre('save', function() {
  this.stockOutTotalPrice = this.stockOutQuantity * this.stockOutUnitPrice;
});

module.exports = mongoose.model('StockOut', stockOutSchema);
