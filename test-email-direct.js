import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('📧 Testing Email Configuration');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);

async function testEmail() {
  try {
    const createTransporter = nodemailer.default || nodemailer;
    const transporter = createTransporter.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `"Student Achievement Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 Test Email - Configuration Check',
      html: '<h1>Success!</h1><p>Your email configuration is working correctly.</p>',
      text: 'Success! Your email configuration is working correctly.'
    };

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox at:', process.env.EMAIL_USER);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmail();
