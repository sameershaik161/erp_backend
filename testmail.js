import pkg from 'nodemailer';
const { createTransporter } = pkg;
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔵 Testing email with your credentials...');
console.log('📧 Email:', process.env.EMAIL_USER);
console.log('🔑 Password:', process.env.EMAIL_PASSWORD ? 'Configured' : 'MISSING');

const transporter = createTransporter({
  service: 'gmail',
  auth: {
    user: 'sameershaiks2468@gmail.com',
    pass: 'ozxwllgdvwvshkes'
  }
});

transporter.sendMail({
  from: '"Test" <sameershaiks2468@gmail.com>',
  to: 'sameershaiks2468@gmail.com',
  subject: 'Test Email - Portal Working ✅',
  text: 'If you see this, emails are working!'
}, (err, info) => {
  if (err) {
    console.log('\n❌ Failed:', err.message);
    if (err.message.includes('self-signed')) {
      console.log('Retrying with TLS disabled...');
      const trans2 = createTransporter({
        service: 'gmail',
        auth: {
          user: 'sameershaiks2468@gmail.com',
          pass: 'ozxwllgdvwvshkes'
        },
        tls: { rejectUnauthorized: false }
      });
      trans2.sendMail({
        from: '"Test" <sameershaiks2468@gmail.com>',
        to: 'sameershaiks2468@gmail.com',
        subject: 'Test Email - Portal Working ✅',
        text: 'If you see this, emails are working!'
      }, (err2, info2) => {
        if (err2) {
          console.log('Still failed:', err2.message);
        } else {
          console.log('\n✅ SUCCESS! Email sent!');
          console.log('Check inbox:', 'sameershaiks2468@gmail.com');
        }
      });
    }
  } else {
    console.log('\n✅ SUCCESS! Email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox at: sameershaiks2468@gmail.com');
    console.log('\nYour email system is working! Students will receive notifications.');
  }
});
