import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load credentials from .env file
dotenv.config();

console.log('\n=================================');
console.log('📧 TESTING YOUR EMAIL SETUP');
console.log('=================================\n');

// Get credentials from .env file
const EMAIL = process.env.EMAIL_USER || 'not-configured';
const PASSWORD = process.env.EMAIL_PASSWORD || 'not-configured';

console.log('Using credentials:');
console.log('📧 Email:', EMAIL);
console.log('🔑 App Password:', PASSWORD);
console.log('');

async function sendTestEmail() {
  try {
    console.log('Creating Gmail transporter...');
    
    // Create transporter (correct function name!)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Transporter created!');
    console.log('');
    console.log('📤 Sending test email...');
    
    // Send email
    const info = await transporter.sendMail({
      from: `"Student Achievement Portal" <${EMAIL}>`,
      to: EMAIL,
      subject: '🎉 Email System Working - Student Achievement Portal',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>✅ Email System Working!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Great News!</h2>
            <p>Your email notification system is configured correctly.</p>
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>What's Working:</strong>
              <ul style="margin: 10px 0;">
                <li>Gmail credentials are valid ✅</li>
                <li>App Password is correct ✅</li>
                <li>SMTP connection successful ✅</li>
              </ul>
            </div>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>When you approve an achievement → Student gets approval email</li>
              <li>When you reject an achievement → Student gets rejection email</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Test performed at: ${new Date().toLocaleString()}<br>
              Student Achievement Portal - Email Notification System
            </p>
          </div>
        </div>
      `,
      text: 'Success! Your email system is working. Students will receive notifications when you approve or reject their achievements.'
    });
    
    console.log('');
    console.log('=================================');
    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅');
    console.log('=================================');
    console.log('');
    console.log('📧 Email sent to:', EMAIL);
    console.log('📬 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('');
    console.log('🔍 CHECK YOUR INBOX NOW!');
    console.log('📁 Also check spam/junk folder');
    console.log('');
    console.log('🎉 Perfect! Your email system is ready!');
    console.log('Students will automatically receive emails when you approve/reject achievements.');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('=================================');
    console.log('❌ EMAIL FAILED');
    console.log('=================================');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.code === 'EAUTH' || error.response?.includes('Username and Password not accepted')) {
      console.log('🔧 SOLUTION:');
      console.log('1. Your App Password might be wrong or expired');
      console.log('2. Go to: https://myaccount.google.com/apppasswords');
      console.log('3. Delete old app password and create a new one');
      console.log('4. Update EMAIL_PASSWORD in .env with new password');
      console.log('');
      console.log('Current password:', PASSWORD);
    } else if (error.code === 'ESOCKET') {
      console.log('🔧 SOLUTION: Network/Firewall issue');
      console.log('- Check internet connection');
      console.log('- Disable VPN if using one');
      console.log('- Check firewall settings');
    } else {
      console.log('Full error details:', error);
    }
  }
}

sendTestEmail();
