import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Email Configuration');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD configured:', !!process.env.EMAIL_PASSWORD);

async function testEmail() {
  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Email content
  const mailOptions = {
    from: `"Test Portal" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to yourself for testing
    subject: '✅ Test Email - Configuration Working!',
    html: `
      <h1>Success!</h1>
      <p>Your email configuration is working correctly.</p>
      <p>Now when you approve or reject achievements, students will receive email notifications.</p>
    `,
    text: 'Success! Your email configuration is working correctly.'
  };

  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox at:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Invalid login')) {
      console.error('Fix: Use App Password, not regular Gmail password');
      console.error('Go to: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail();
