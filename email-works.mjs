import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

console.log('\n=== TESTING EMAIL CONFIGURATION ===');
console.log('Using credentials:');
console.log('Email: sameershaiks2468@gmail.com');
console.log('Password: ozxw...hkes (hidden)');

async function testEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'sameershaiks2468@gmail.com',
        pass: 'ozxwllgdvwvshkes'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send test email
    const info = await transporter.sendMail({
      from: '"Student Portal" <sameershaiks2468@gmail.com>',
      to: 'sameershaiks2468@gmail.com',
      subject: '✅ Email System Working!',
      html: `
        <h2>Success! Your email system is configured correctly.</h2>
        <p>Students will now receive email notifications when you:</p>
        <ul>
          <li>✅ Approve their achievements</li>
          <li>❌ Reject their achievements</li>
        </ul>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      text: 'Success! Your email system is working.'
    });

    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n📧 Check your inbox at: sameershaiks2468@gmail.com');
    console.log('📁 Also check spam/junk folder if not in inbox');
    console.log('\n🎉 Your email notification system is ready!');
    
  } catch (error) {
    console.log('\n❌ Email failed!');
    console.log('Error:', error.message);
    
    if (error.code === 'EAUTH' || error.response?.includes('Username and Password not accepted')) {
      console.log('\n🔧 Fix: Authentication failed');
      console.log('1. Make sure 2FA is enabled on your Gmail');
      console.log('2. Generate a new App Password at:');
      console.log('   https://myaccount.google.com/apppasswords');
      console.log('3. Update the password in your .env file');
    }
  }
}

testEmail();
