// Debug script to check user points synchronization
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Achievement from './src/models/Achievement.js';

// Connect to MongoDB
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp_portal';

async function debugUserPoints() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user "Nandini" and check their data
    const user = await User.findOne({ name: { $regex: /nandini/i } }).select('name rollNumber totalPoints achievements');
    
    if (!user) {
      console.log('❌ User "Nandini" not found');
      return;
    }
    
    console.log('\n👤 User Data:');
    console.log('Name:', user.name);
    console.log('Roll Number:', user.rollNumber);
    console.log('Database totalPoints:', user.totalPoints || 0);
    
    // Check achievements for this user
    const achievements = await Achievement.find({ student: user._id });
    console.log('\n🏆 User Achievements:');
    
    let calculatedPoints = 0;
    achievements.forEach((ach, index) => {
      console.log(`${index + 1}. ${ach.title}`);
      console.log(`   Status: ${ach.status}`);
      console.log(`   Points: ${ach.points || 0}`);
      console.log(`   Created: ${ach.createdAt}`);
      console.log(`   Updated: ${ach.updatedAt}`);
      
      if (ach.status === 'approved') {
        calculatedPoints += (ach.points || 0);
      }
      console.log('');
    });
    
    console.log('📊 Points Summary:');
    console.log('Database totalPoints:', user.totalPoints || 0);
    console.log('Calculated from approved achievements:', calculatedPoints);
    console.log('Difference:', (user.totalPoints || 0) - calculatedPoints);
    
    if ((user.totalPoints || 0) !== calculatedPoints) {
      console.log('⚠️  SYNCHRONIZATION ISSUE DETECTED!');
      console.log('The database totalPoints does not match calculated points from achievements');
    } else {
      console.log('✅ Points are synchronized correctly');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugUserPoints();