// Environment variable validation for AWS deployment
export function validateEnv() {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'ADMIN_JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional but recommended variables
  const recommended = ['EMAIL_USER', 'EMAIL_PASSWORD', 'GEMINI_API_KEY', 'FRONTEND_URL'];
  for (const varName of recommended) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\\n⚠️  Please check your .env file!\\n');
    process.exit(1);
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Missing recommended environment variables:');
    warnings.forEach(v => console.warn(`   - ${v}`));
    console.warn('\\nSome features may not work correctly.\\n');
  }

  // Validate JWT secrets length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }

  if (process.env.ADMIN_JWT_SECRET && process.env.ADMIN_JWT_SECRET.length < 32) {
    console.warn('⚠️  ADMIN_JWT_SECRET should be at least 32 characters long');
  }

  console.log('✅ Environment variables validated successfully');
}

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}

export default validateEnv;
