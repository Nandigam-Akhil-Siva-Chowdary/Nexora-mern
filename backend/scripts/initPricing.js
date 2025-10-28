const mongoose = require('mongoose');
const Pricing = require('../models/Pricing');
require('dotenv').config();

const initializePricing = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Check if pricing data exists
    const existingPricing = await Pricing.findOne({ category: 'default' });
    
    if (!existingPricing) {
      console.log('📊 Creating default pricing data...');
      
      const defaultPricing = new Pricing({
        category: 'default',
        base: {
          'concrete-base': 1500,
          'asphalt-base': 1200,
          'compacted-soil': 800
        },
        flooring: {
          'synthetic-turf': 2500,
          'natural-grass': 1000,
          'clay-court': 1800,
          'acrylic-surface': 2200,
          'concrete-flooring': 1200,
          'wooden-flooring': 3500,
          'pvc-flooring': 2800,
          'rubber-flooring': 3200
        },
        equipment: {
          'basketball-hoop': 15000,
          'basketball-backboard': 8000,
          'football-goalpost': 25000,
          'football-net': 5000,
          'volleyball-posts': 12000,
          'volleyball-net': 3000,
          'badminton-posts': 8000,
          'badminton-net': 2000,
          'pickleball-net': 6000,
          'pickleball-posts': 10000,
          'tennis-net': 15000,
          'tennis-posts': 20000,
          'cricket-pitch': 50000,
          'cricket-sight-screen': 25000,
          'table-tennis-table': 8000,
          'table-tennis-net': 1000,
          'swimming-pool-liner': 80000,
          'filtration-system': 120000,
          'pool-ladder': 15000
        },
        lighting: {
          'led-floodlights': 5000,
          'metal-halide': 3000,
          'solar-lights': 8000,
          'indoor-led': 4000
        },
        roof: {
          'steel-shed': 2000,
          'fabric-shed': 1500,
          'permanent-structure': 3500,
          'swimming-pool-cover': 5000
        },
        courtSizes: {
          'basketball': { standard: 420, custom: 0, premium: 500 },
          'football': { standard: 7140, custom: 0, premium: 8000 },
          'volleyball': { standard: 162, custom: 0, premium: 200 },
          'badminton': { standard: 81, custom: 0, premium: 100 },
          'pickleball': { standard: 65, custom: 0, premium: 80 },
          'tennis': { standard: 260, custom: 0, premium: 300 },
          'cricket': { standard: 15000, custom: 0, premium: 18000 },
          'table-tennis': { standard: 15, custom: 0, premium: 20 },
          'swimming': { standard: 50, custom: 0, premium: 75 },
          'basketball-indoor': { standard: 420, custom: 0, premium: 500 },
          'badminton-indoor': { standard: 81, custom: 0, premium: 100 }
        }
      });

      await defaultPricing.save();
      console.log('✅ Default pricing data created successfully in MongoDB Atlas!');
    } else {
      console.log('ℹ️ Pricing data already exists in MongoDB Atlas.');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error initializing pricing data:', error);
    process.exit(1);
  }
};

initializePricing();