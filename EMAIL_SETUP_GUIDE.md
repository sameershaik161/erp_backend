# 📧 Email Notification Setup Guide

This guide will help you configure email notifications for certificate approval/rejection in the Student Achievement Portal.

## 🔧 Configuration Steps

### 1. Add Email Credentials to .env File

Add the following environment variables to your `.env` file in the backend directory:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Setting Up Gmail (Recommended)

If you're using Gmail, follow these steps:

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other" and name it "Student Achievement Portal"
4. Click **Generate**
5. Copy the 16-character password (without spaces)
6. Use this password in your `.env` file as `EMAIL_PASSWORD`

**Example .env configuration:**
```env
EMAIL_USER=admin@yourinstitute.edu
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 3. Using Other Email Providers

If you're not using Gmail, update the email service configuration:

**Edit:** `backend/src/services/emailService.js`

Replace the service name in the `createTransporter` function:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'outlook', // Change this: 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

#### Supported Email Services:
- Gmail (`service: 'gmail'`)
- Outlook (`service: 'outlook'`)
- Yahoo (`service: 'yahoo'`)
- Hotmail (`service: 'hotmail'`)

#### Custom SMTP Server:
```javascript
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.your-email-provider.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

## 📨 Email Templates

The system includes two professional email templates:

### ✅ Approval Email
- Official college branding
- Achievement details
- Points awarded
- Admin notes (if any)
- Motivational message

### ❌ Rejection Email
- Professional and respectful tone
- Reason for rejection
- Clear next steps
- Guidance for resubmission

## 🧪 Testing Email Configuration

After setup, test the email functionality:

1. Start your backend server:
```bash
npm run dev
```

2. Log in as admin
3. Approve or reject a test certificate
4. Check if the student receives the email

## 🔍 Troubleshooting

### Emails Not Sending?

Check the server console logs:
- ✅ "Approval email sent:" - Email sent successfully
- ⚠️  "Email credentials not configured" - Missing .env variables
- ❌ "Error sending approval email:" - Configuration error

### Common Issues:

1. **"Invalid login"**
   - Make sure you're using an App Password, not your regular password
   - Check if 2FA is enabled

2. **"Connection timeout"**
   - Check your internet connection
   - Verify firewall settings
   - Try a different email provider

3. **Emails going to spam**
   - Ask students to check their spam folder
   - Add your email to their contacts
   - Consider using your institution's official email domain

## 🔒 Security Best Practices

1. ✅ **Never commit .env file** - Already gitignored
2. ✅ **Use App Passwords** - More secure than regular passwords
3. ✅ **Rotate credentials** - Change passwords periodically
4. ✅ **Use institutional email** - More professional and trustworthy

## 📝 Email Content Customization

To customize email templates, edit:
`backend/src/services/emailService.js`

You can modify:
- Email subject lines
- HTML/CSS styling
- Email body content
- Sender name
- Footer information

## ✨ Features

- ✅ Professional HTML email templates
- ✅ Plain text fallback for email clients that don't support HTML
- ✅ Responsive design
- ✅ Official college branding
- ✅ Clear approval/rejection messages
- ✅ Admin notes included
- ✅ Actionable next steps for rejected submissions
- ✅ Graceful error handling

## 📞 Support

If you encounter issues:
1. Check server console logs
2. Verify .env configuration
3. Test with a different email provider
4. Check email provider's SMTP settings

---

**Note:** The email system will work without configuration, but emails won't be sent. The application logs a warning: "Email credentials not configured. Skipping email notification."
