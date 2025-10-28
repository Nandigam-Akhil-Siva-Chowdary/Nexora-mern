const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/pricing', require('./routes/pricing'));

// MongoDB Connection with better configuration
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB Atlas...');

// Remove deprecated options and use modern connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

db.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
});

db.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Initialize pricing data on startup
const initializePricing = async () => {
  try {
    const Pricing = require('./models/Pricing');
    const existingPricing = await Pricing.findOne({ category: 'default' });
    
    if (!existingPricing) {
      console.log('📊 Initializing default pricing data...');
      const defaultPricing = new Pricing({ category: 'default' });
      await defaultPricing.save();
      console.log('✅ Default pricing data initialized successfully!');
    } else {
      console.log('ℹ️ Pricing data already exists in database');
      
      // Verify we can read from the database
      const pricingCount = await Pricing.countDocuments();
      console.log(`📊 Total pricing records: ${pricingCount}`);
    }
  } catch (error) {
    console.error('❌ Error initializing pricing data:', error);
  }
};

db.once('open', async () => {
  console.log('✅ MongoDB connection is open and stable');
  await initializePricing();
});

// Health check endpoint to test database connection
app.get('/api/health', async (req, res) => {
  try {
    // Check if database is connected
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.json({
      status: 'OK',
      database: states[dbState],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});