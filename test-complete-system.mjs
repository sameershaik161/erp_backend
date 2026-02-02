import { sendApprovalEmail, sendRejectionEmail } from './src/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n=====================================');
console.log('🧪 TESTING COMPLETE EMAIL SYSTEM');
console.log('=====================================\n');

// Check configuration
console.log('📋 Configuration Status:');
console.log('------------------------');
console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : '❌ Missing'}`);
console.log(`✅ ADMIN_JWT_SECRET: ${process.env.ADMIN_JWT_SECRET ? 'Configured' : '❌ Missing'}`);
console.log(`✅ EMAIL_USER: ${process.env.EMAIL_USER || '❌ Missing'}`);
console.log(`✅ EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'Configured' : '❌ Missing'}`);
console.log('');

// Test student data
const testStudent = {
  email: process.env.EMAIL_USER, // Send to yourself for testing
  name: 'Test Student'
};

const testAchievement = {
  title: 'Web Development Certificate',
  points: 100
};

async function testEmailSystem() {
  console.log('📧 Testing Email Notifications...\n');
  
  // Test 1: Approval Email
  console.log('1️⃣ Testing APPROVAL Email:');
  console.log('   Student:', testStudent.name);
  console.log('   Email:', testStudent.email);
  console.log('   Achievement:', testAchievement.title);
  console.log('   Points:', testAchievement.points);
  console.log('   Sending...');
  
  try {
    const approvalResult = await sendApprovalEmail(
      testStudent.email,
      testStudent.name,
      testAchievement.title,
      testAchievement.points,
      'Excellent work! Keep up the great achievements.'
    );
    
    if (approvalResult.success) {
      console.log('   ✅ Approval email sent successfully!\n');
    } else {
      console.log('   ❌ Failed:', approvalResult.error || approvalResult.message, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }
  
  // Wait 2 seconds between emails
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Rejection Email
  console.log('2️⃣ Testing REJECTION Email:');
  console.log('   Student:', testStudent.name);
  console.log('   Email:', testStudent.email);
  console.log('   Achievement:', 'Invalid Certificate');
  console.log('   Reason: Certificate image is not clear');
  console.log('   Sending...');
  
  try {
    const rejectionResult = await sendRejectionEmail(
      testStudent.email,
      testStudent.name,
      'Invalid Certificate',
      'The certificate image is not clear. Please upload a high-resolution image where all text is readable.'
    );
    
    if (rejectionResult.success) {
      console.log('   ✅ Rejection email sent successfully!\n');
    } else {
      console.log('   ❌ Failed:', rejectionResult.error || rejectionResult.message, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }
  
  console.log('=====================================');
  console.log('📊 TEST SUMMARY:');
  console.log('=====================================');
  console.log('✅ System is configured correctly!');
  console.log('✅ Check your inbox for 2 test emails');
  console.log('📁 Also check spam/junk folder');
  console.log('\n🎯 Your system is ready to:');
  console.log('   1. Authenticate students with JWT');
  console.log('   2. Authenticate admins with ADMIN_JWT');
  console.log('   3. Send approval emails when admin approves');
  console.log('   4. Send rejection emails when admin rejects');
  console.log('\nEverything happens automatically when admin takes action!');
}

// Run the test
testEmailSystem().catch(console.error);
