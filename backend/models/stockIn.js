const mongoose = require('mongoose');

const stockInSchema = new mongoose.Schema({
  sparePart: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SparePart', 
    required: true 
  },
  stockInQuantity: { type: Number, required: true },
  stockInUnitPrice: { type: Number, required: true },
  stockInTotalPrice: { type: Number, default: 0 },
  stockInDate: { type: Date, default: Date.now },
  supplier: { type: String },
  notes: { type: String },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

stockInSchema.pre('save', function() {
  this.stockInTotalPrice = this.stockInQuantity * this.stockInUnitPrice;
});

module.exports = mongoose.model('StockIn', stockInSchema);
