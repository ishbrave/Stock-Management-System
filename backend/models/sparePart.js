const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, default: 0 },
  description: { type: String },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Update total price whenever quantity or unit price changes
sparePartSchema.pre('save', function() {
  this.totalPrice = this.quantity * this.unitPrice;
});

module.exports = mongoose.model('SparePart', sparePartSchema);
