import nodemailer from 'nodemailer';

console.log('\n=================================');
console.log('📧 TESTING YOUR EMAIL CREDENTIALS');
console.log('=================================\n');

const EMAIL = 'shaiksamer7277@gmail.com';
const PASSWORD = 'prnhziktmrspwrmn';  // Without quotes!

console.log('Testing with:');
console.log('Email:', EMAIL);
console.log('Password:', PASSWORD);
console.log('');

async function testYourEmail() {
  try {
    console.log('Creating transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD
      }
    });

    console.log('✅ Transporter created!');
    console.log('📤 Sending test email...\n');
    
    const info = await transporter.sendMail({
      from: `"Student Achievement Portal" <${EMAIL}>`,
      to: EMAIL,
      subject: '🎉 Email System Working! - ' + new Date().toLocaleTimeString(),
      html: `
        <div style="font-family: Arial; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 10px;">
          <h1>✅ Success!</h1>
          <p style="font-size: 18px;">Your email system is configured correctly!</p>
          <hr style="border: 1px solid white; margin: 20px 0;">
          <p><strong>What's Working:</strong></p>
          <ul>
            <li>Gmail credentials: ✅</li>
            <li>App Password: ✅</li>
            <li>SMTP Connection: ✅</li>
            <li>Email sending: ✅</li>
          </ul>
          <p style="margin-top: 20px;">Students will now receive emails when you approve/reject their achievements!</p>
          <p style="font-size: 12px; opacity: 0.8;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: 'Success! Your email system is working. Students will receive notifications.'
    });
    
    console.log('=================================');
    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅');
    console.log('=================================\n');
    console.log('📧 Check your inbox at:', EMAIL);
    console.log('📬 Message ID:', info.messageId);
    console.log('📁 Also check spam folder if not in inbox\n');
    console.log('🎉 Perfect! Your email system is ready!');
    console.log('Students will get emails when you approve/reject!\n');
    
    console.log('📝 Make sure your .env has (NO QUOTES):');
    console.log('EMAIL_USER=' + EMAIL);
    console.log('EMAIL_PASSWORD=' + PASSWORD);
    
  } catch (error) {
    console.log('=================================');
    console.log('❌ EMAIL FAILED');
    console.log('=================================\n');
    console.log('Error:', error.message);
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 Your App Password might be wrong.');
      console.log('Try generating a new one:');
      console.log('1. Login to:', EMAIL);
      console.log('2. Go to: https://myaccount.google.com/apppasswords');
      console.log('3. Delete old passwords');
      console.log('4. Create new App Password for "Mail"');
      console.log('5. Update .env with new password (NO QUOTES)');
    }
  }
}

testYourEmail().catch(console.error);
