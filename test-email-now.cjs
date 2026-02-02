const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('===============================');
console.log('📧 Testing Email Configuration');
console.log('===============================');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Missing');
console.log('');

async function sendTestEmail() {
  try {
    console.log('Creating email transporter...');
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

    console.log('✅ Transporter created!');
    console.log('');
    console.log('Sending test email to:', process.env.EMAIL_USER);
    
    const mailOptions = {
      from: `"Student Portal Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Email Configuration Working - Student Achievement Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
            <h1>🎉 Success!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Your email configuration is working perfectly!</h2>
            <p style="font-size: 16px; color: #333;">
              Great job! Your Student Achievement Portal can now send email notifications.
            </p>
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ What's Working:</strong>
              <ul>
                <li>Email credentials are correctly configured</li>
                <li>Gmail App Password is valid</li>
                <li>SMTP connection successful</li>
                <li>Students will receive notifications when you approve/reject achievements</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              This is a test email from your Student Achievement Portal.<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: 'Success! Your email configuration is working. Students will now receive notifications.'
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('');
    console.log('================================');
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('================================');
    console.log('📧 Check your inbox at:', process.env.EMAIL_USER);
    console.log('📬 Message ID:', info.messageId);
    console.log('🔍 Also check spam/junk folder');
    console.log('');
    console.log('🎉 Your email system is working perfectly!');
    console.log('Students will now receive emails when you approve/reject their achievements.');
    
  } catch (error) {
    console.log('');
    console.log('================================');
    console.log('❌ EMAIL FAILED');
    console.log('================================');
    console.error('Error:', error.message);
    console.log('');
    
    if (error.message.includes('Invalid login')) {
      console.log('🔧 FIX: Check your App Password');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Generate a new App Password');
      console.log('3. Update EMAIL_PASSWORD in .env file');
    } else if (error.message.includes('EAUTH')) {
      console.log('🔧 FIX: Authentication failed');
      console.log('- Make sure 2FA is enabled on your Gmail');
      console.log('- Use App Password, not regular password');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('🔧 FIX: Network timeout');
      console.log('- Check your internet connection');
      console.log('- Check firewall settings');
    }
  }
}

sendTestEmail();
