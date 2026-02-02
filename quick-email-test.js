import nodemailer from 'nodemailer';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=================================');
console.log('📧 QUICK EMAIL FIX');
console.log('=================================\n');

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function quickFix() {
  console.log('Enter your Gmail credentials:\n');
  
  const email = await question('Gmail address: ');
  const password = await question('App Password (16 chars): ');
  
  console.log('\nTesting with:');
  console.log('Email:', email);
  console.log('Password:', password.replace(/./g, '*'));
  
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email.trim(),
        pass: password.trim().replace(/\s/g, '') // Remove spaces
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('\n📤 Sending test email...');
    
    const info = await transporter.sendMail({
      from: email,
      to: email,
      subject: '✅ Email Working!',
      text: 'Your email is configured correctly!'
    });

    console.log('\n✅ SUCCESS! Email sent!');
    console.log('Message ID:', info.messageId);
    console.log('\n📝 Add these to your .env file:');
    console.log(`EMAIL_USER=${email}`);
    console.log(`EMAIL_PASSWORD=${password.trim().replace(/\s/g, '')}`);
    
  } catch (error) {
    console.log('\n❌ Failed:', error.message);
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 Fix:');
      console.log('1. Make sure 2FA is enabled for', email);
      console.log('2. Go to: https://myaccount.google.com/apppasswords');
      console.log('3. Generate NEW App Password');
      console.log('4. Try again with the new password');
    }
  }
  
  rl.close();
}

quickFix();
