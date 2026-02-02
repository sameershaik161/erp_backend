import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('\n=========================================');
console.log('🔍 VALIDATING YOUR .ENV CONFIGURATION');
console.log('=========================================\n');

// Configuration checks
const checks = [];

// 1. Check required variables
console.log('1️⃣ Checking Required Variables:\n');

const requiredVars = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
};

let allPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('PASSWORD') || key.includes('SECRET') ? '***hidden***' : value.substring(0, 30) + '...'}`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allPresent = false;
  }
}
checks.push({ name: 'Required Variables', passed: allPresent });

// 2. Check for common mistakes
console.log('\n2️⃣ Checking for Common Mistakes:\n');

// Check if EMAIL_PASSWORD has quotes
if (process.env.EMAIL_PASSWORD?.includes('"') || process.env.EMAIL_PASSWORD?.includes("'")) {
  console.log('❌ EMAIL_PASSWORD has quotes - REMOVE THEM!');
  console.log('   Current:', process.env.EMAIL_PASSWORD);
  console.log('   Should be:', process.env.EMAIL_PASSWORD.replace(/['"]/g, ''));
  checks.push({ name: 'No Quotes in Password', passed: false });
} else {
  console.log('✅ EMAIL_PASSWORD: No quotes found (good!)');
  checks.push({ name: 'No Quotes in Password', passed: true });
}

// Check if EMAIL_PASSWORD is 16 characters
if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length === 16) {
  console.log('✅ EMAIL_PASSWORD: 16 characters (App Password format)');
  checks.push({ name: 'Password Length', passed: true });
} else {
  console.log('⚠️  EMAIL_PASSWORD: Not 16 characters (might not be App Password)');
  checks.push({ name: 'Password Length', passed: false });
}

// 3. Test Database Connection
console.log('\n3️⃣ Checking Database Configuration:\n');
if (process.env.MONGO_URI) {
  if (process.env.MONGO_URI.includes('mongodb+srv://') || process.env.MONGO_URI.includes('mongodb://')) {
    console.log('✅ MongoDB URI format looks correct');
    checks.push({ name: 'MongoDB Format', passed: true });
  } else {
    console.log('❌ MongoDB URI format incorrect');
    checks.push({ name: 'MongoDB Format', passed: false });
  }
}

// 4. Test Email Configuration
console.log('\n4️⃣ Testing Email Configuration:\n');
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD.replace(/['"]/g, '') // Remove any quotes
      }
    });
    
    await transporter.verify();
    console.log('✅ Email configuration VERIFIED!');
    checks.push({ name: 'Email Config', passed: true });
  } catch (error) {
    console.log('❌ Email configuration FAILED:', error.message);
    checks.push({ name: 'Email Config', passed: false });
  }
}

// 5. Check optional configurations
console.log('\n5️⃣ Optional Configurations:\n');
console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️ Not set (AI features disabled)'}`);
console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID === 'yourAWSkey' ? '⚠️ Using placeholder' : process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '⚠️ Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Summary
console.log('\n=========================================');
console.log('📊 VALIDATION SUMMARY');
console.log('=========================================\n');

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

checks.forEach(check => {
  console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
});

console.log(`\nScore: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 PERFECT! Your .env configuration is correct!');
  console.log('Your application should work without issues.');
} else if (percentage >= 75) {
  console.log('\n⚠️  MOSTLY GOOD! Fix the issues above for full functionality.');
} else {
  console.log('\n❌ NEEDS ATTENTION! Several configuration issues found.');
  console.log('Please fix the issues marked with ❌ above.');
}

// Fixes needed
if (percentage < 100) {
  console.log('\n📝 FIXES NEEDED:');
  if (!checks.find(c => c.name === 'Required Variables')?.passed) {
    console.log('• Add missing required variables to .env');
  }
  if (!checks.find(c => c.name === 'No Quotes in Password')?.passed) {
    console.log('• Remove quotes from EMAIL_PASSWORD');
  }
  if (!checks.find(c => c.name === 'Email Config')?.passed) {
    console.log('• Generate new App Password for Gmail');
    console.log('  Go to: https://myaccount.google.com/apppasswords');
  }
}

console.log('\n=========================================\n');
