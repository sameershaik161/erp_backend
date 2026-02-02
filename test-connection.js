import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

async function testConnection() {
  try {
    // Test with different connection options
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      bufferCommands: false
    };

    console.log('⏳ Attempting to connect...');
    
    await mongoose.connect(MONGO_URI, connectionOptions);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple query
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    console.log('🏓 Database ping successful:', result);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check IP whitelist in MongoDB Atlas');
      console.log('4. Try connecting from MongoDB Compass with the same URI');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('1. Verify username and password in connection string');
      console.log('2. Check database user permissions in MongoDB Atlas');
    }
    
    if (error.message.includes('querySrv')) {
      console.log('\n🔧 DNS Resolution Issue:');
      console.log('1. Try using a different DNS server (8.8.8.8 or 1.1.1.1)');
      console.log('2. Check if your firewall/antivirus is blocking the connection');
      console.log('3. Try using the standard connection string instead of SRV');
    }
  }
}

testConnection();