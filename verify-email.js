import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n=================================');
console.log('📧 VERIFYING YOUR EMAIL SETUP');
console.log('=================================\n');

console.log('Current .env configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('❌ ERROR: Email credentials missing in .env file!');
  console.log('\n📝 Add these to your .env file:');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASSWORD=your-16-char-app-password');
  process.exit(1);
}

// Test with current credentials
async function verifyEmail() {
  const configs = [
    {
      name: 'Method 1: SMTP Port 587',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '') // Remove any spaces
        },
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Method 2: Gmail Service',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '')
        }
      }
    },
    {
      name: 'Method 3: SMTP Port 465',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '')
        }
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\nTrying ${name}...`);
    
    try {
      const transporter = nodemailer.createTransport(config);
      
      // Try to verify connection
      await transporter.verify();
      console.log('✅ Connection verified!');
      
      // Send test email
      console.log('📤 Sending test email...');
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `✅ Email Working - ${new Date().toLocaleTimeString()}`,
        html: `
          <h2>Success! Your email is working!</h2>
          <p>Method: ${name}</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>Your Student Achievement Portal can now send emails!</p>
        `,
        text: 'Success! Your email configuration is working!'
      });
      
      console.log('\n=================================');
      console.log('✅✅✅ SUCCESS! ✅✅✅');
      console.log('=================================');
      console.log('Email sent to:', process.env.EMAIL_USER);
      console.log('Message ID:', info.messageId);
      console.log('Working method:', name);
      console.log('\n📧 Check your inbox (and spam folder)!');
      console.log('🎉 Your email system is ready!');
      return true;
      
    } catch (error) {
      console.log(`❌ ${name} failed:`, error.message);
    }
  }
  
  // All methods failed
  console.log('\n=================================');
  console.log('❌ ALL METHODS FAILED');
  console.log('=================================\n');
  console.log('Your credentials are incorrect or expired.\n');
  console.log('📝 TO FIX:');
  console.log(`1. Login to: ${process.env.EMAIL_USER}`);
  console.log('2. Go to: https://myaccount.google.com/apppasswords');
  console.log('3. Delete old App Passwords');
  console.log('4. Create NEW App Password for "Mail"');
  console.log('5. Copy the 16 characters (remove spaces)');
  console.log('6. Update EMAIL_PASSWORD in .env');
  console.log('7. Run this test again');
  
  return false;
}

verifyEmail().catch(console.error);
