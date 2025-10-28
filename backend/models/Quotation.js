const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  clientInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  projectInfo: {
    gameType: { type: String, required: false },
    courtType: { type: String, required: true },
    courtSize: { type: String, required: true },
    sport: { type: String, required: true },
    customDimensions: {
      length: { type: Number },
      width: { type: Number },
      area: { type: Number }
    }
  },
  requirements: {
    base: {
      type: { type: String, required: true },
      area: { type: Number, required: true }
    },
    flooring: {
      type: { type: String, required: true },
      area: { type: Number, required: true }
    },
    equipment: [{
      name: String,
      quantity: Number,
      unitCost: Number,
      totalCost: Number
    }],
    lighting: {
      required: { type: Boolean, default: false },
      type: { type: String },
      quantity: { type: Number }
    },
    roof: {
      required: { type: Boolean, default: false },
      type: { type: String },
      area: { type: Number }
    },
    additionalFeatures: [{
      name: String,
      cost: Number
    }]
  },
  pricing: {
    baseCost: { type: Number, required: true },
    flooringCost: { type: Number, required: true },
    equipmentCost: { type: Number, default: 0 },
    lightingCost: { type: Number, default: 0 },
    roofCost: { type: Number, default: 0 },
    additionalCost: { type: Number, default: 0 },
    totalCost: { type: Number, required: true }
  },
  quotationNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

quotationSchema.pre('save', async function(next) {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    this.quotationNumber = `NXR${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);