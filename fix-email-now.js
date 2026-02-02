import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('\n========================================');
console.log('📧 FIXING YOUR EMAIL SYSTEM');
console.log('========================================\n');

// SOLUTION 1: Direct credentials (for testing)
async function testWithDirectCredentials() {
  console.log('🔧 SOLUTION 1: Testing with direct credentials...\n');
  
  try {
    // Method 1: With OAuth2 alternative
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'sameershaiks2468@gmail.com',
        pass: 'ozxwllgdvwvshkes'
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      debug: true,
      logger: true
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Send test email
    const info = await transporter.sendMail({
      from: '"Student Portal" <sameershaiks2468@gmail.com>',
      to: 'sameershaiks2468@gmail.com',
      subject: '✅ Email System Fixed!',
      text: 'Your email system is now working!',
      html: '<h1>Success!</h1><p>Your email system is now working!</p>'
    });

    console.log('✅ Email sent! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
    return false;
  }
}

// SOLUTION 2: Less secure app method
async function testWithLessSecure() {
  console.log('\n🔧 SOLUTION 2: Testing with less secure settings...\n');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'sameershaiks2468@gmail.com',
        pass: 'ozxwllgdvwvshkes'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: 'sameershaiks2468@gmail.com',
      to: 'sameershaiks2468@gmail.com',
      subject: '✅ Alternative Method Working!',
      text: 'Email working with alternative settings!'
    });

    console.log('✅ Email sent! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.log('❌ Method 2 failed:', error.message);
    return false;
  }
}

// SOLUTION 3: OAuth2 method (most reliable)
async function setupOAuth2Instructions() {
  console.log('\n🔧 SOLUTION 3: OAuth2 Setup (Most Reliable)\n');
  console.log('If App Passwords don\'t work, use OAuth2:');
  console.log('1. Go to Google Cloud Console');
  console.log('2. Create OAuth2 credentials');
  console.log('3. Use refresh token method');
  console.log('This is more complex but always works.\n');
}

// Main fix function
async function fixEmailSystem() {
  // Try Solution 1
  const method1 = await testWithDirectCredentials();
  if (method1) {
    console.log('\n🎉 SUCCESS! Your email system is working!');
    console.log('The issue was with the connection method.');
    await updateEmailService();
    return;
  }

  // Try Solution 2
  const method2 = await testWithLessSecure();
  if (method2) {
    console.log('\n🎉 SUCCESS with alternative settings!');
    await updateEmailService();
    return;
  }

  // If both fail, show manual fix
  console.log('\n========================================');
  console.log('❌ AUTOMATIC FIX FAILED');
  console.log('========================================\n');
  console.log('Your App Password is definitely wrong or expired.\n');
  console.log('🔧 MANUAL FIX REQUIRED:\n');
  console.log('1. Open: https://myaccount.google.com/security');
  console.log('2. Make sure 2-Step Verification is ON');
  console.log('3. Go to: https://myaccount.google.com/apppasswords');
  console.log('4. DELETE all existing app passwords');
  console.log('5. Create NEW app password:');
  console.log('   - App: Mail');
  console.log('   - Device: Other (type "Student Portal")');
  console.log('6. Copy the 16-character password');
  console.log('7. Update .env file with new password (no spaces)');
  console.log('8. Run this test again\n');
  
  console.log('🔄 ALTERNATIVE: Use a different email service\n');
  console.log('You can also use:');
  console.log('- Outlook: Create app password at account.microsoft.com');
  console.log('- Yahoo: Create app password at account.yahoo.com');
  console.log('- SendGrid: Free tier at sendgrid.com (100 emails/day)');
  
  await setupOAuth2Instructions();
}

// Update email service with working configuration
async function updateEmailService() {
  console.log('\n📝 To fix permanently, update your emailService.js:');
  console.log('Change the createTransporter function to use:');
  console.log(`
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
});`);
}

// Run the fix
console.log('Current credentials from .env:');
console.log('Email:', process.env.EMAIL_USER);
console.log('Password:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('');

fixEmailSystem().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
