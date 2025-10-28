const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🧪 Testing MongoDB Atlas connection...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    // Show masked connection string for security
    const maskedUri = MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://USER:PASSWORD@');
    console.log('Connection string:', maskedUri);

    console.log('🔗 Attempting to connect...');
    
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Successfully connected to MongoDB Atlas!');

    // Test if we can create and read data
    const Test = mongoose.model('Test', new mongoose.Schema({ 
      name: String,
      timestamp: { type: Date, default: Date.now }
    }));
    
    // Create a test document
    const testDoc = new Test({ name: 'Connection Test - ' + new Date().toISOString() });
    await testDoc.save();
    console.log('✅ Test document created successfully');

    // Read the test document
    const foundDoc = await Test.findOne({ name: testDoc.name });
    console.log('✅ Test document retrieved:', foundDoc);

    // Count documents to verify connection is stable
    const count = await Test.countDocuments();
    console.log(`✅ Total test documents in collection: ${count}`);

    // Clean up - remove our test document
    await Test.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up');

    console.log('✅ All database operations completed successfully!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('🔍 This usually means:');
      console.error('   - Wrong password in connection string');
      console.error('   - IP address not whitelisted in MongoDB Atlas');
      console.error('   - Network connectivity issues');
    }
    
    process.exit(1);
  }
};

testConnection();