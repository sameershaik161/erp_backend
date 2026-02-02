import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('===============================');
console.log('📧 Testing Your Email Setup');
console.log('===============================');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');
console.log('');

// Get the actual createTransporter function
const mailer = nodemailer.default || nodemailer;

async function testEmail() {
  try {
    console.log('Creating Gmail transporter...');
    
    // Use the correct method to create transporter
    const transporter = mailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Transporter created successfully!');
    console.log('');
    console.log('📤 Sending test email to:', process.env.EMAIL_USER);
    
    const info = await transporter.sendMail({
      from: `"Student Achievement Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Email Working - Student Portal',
      html: '<h1>Success!</h1><p>Your email configuration is working. Students will receive notifications.</p>',
      text: 'Success! Your email configuration is working.'
    });
    
    console.log('');
    console.log('=================================');
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('=================================');
    console.log('Message ID:', info.messageId);
    console.log('');
    console.log('📧 Check your inbox at:', process.env.EMAIL_USER);
    console.log('📁 Also check spam/junk folder!');
    console.log('');
    console.log('🎉 Everything is working! Students will get emails when you approve/reject.');
    
  } catch (error) {
    console.log('');
    console.log('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('');
      console.log('🔧 Fix: Invalid credentials');
      console.log('1. Make sure you have 2FA enabled on Gmail');
      console.log('2. Use App Password (16 characters), not regular password');
      console.log('3. Current password:', process.env.EMAIL_PASSWORD);
    }
  }
}

testEmail();
