import nodemailer from 'nodemailer';

// Create transporter with multiple fallback methods
const createTransporter = () => {
  console.log('🔧 Creating email transporter...');
  console.log('📧 Email User:', process.env.EMAIL_USER || 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials missing!');
    console.log('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    return null;
  }
  
  // Try multiple connection methods
  const configs = [
    // Method 1: Standard Gmail SMTP
    {
      name: 'Gmail SMTP (Port 587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      }
    },
    // Method 2: Gmail Service
    {
      name: 'Gmail Service',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    // Method 3: Gmail SSL
    {
      name: 'Gmail SSL (Port 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      }
    }
  ];

  // Try each configuration
  for (const { name, config } of configs) {
    try {
      console.log(`Trying ${name}...`);
      const transporter = nodemailer.createTransport(config);
      
      // Don't verify in production to avoid delays
      if (process.env.NODE_ENV !== 'production') {
        transporter.verify((error, success) => {
          if (error) {
            console.log(`⚠️ ${name} verification warning:`, error.message);
          } else {
            console.log(`✅ ${name} is ready!`);
          }
        });
      }
      
      return transporter;
    } catch (error) {
      console.log(`❌ ${name} failed:`, error.message);
    }
  }
  
  console.error('❌ All email configurations failed!');
  return null;
};

// Email templates
const getApprovalEmailTemplate = (studentName, achievementTitle, points, adminNote) => {
  return {
    subject: '🎉 Certificate Approved - Student Achievement Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
          .points { font-size: 24px; color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Student Achievement Portal</h1>
            <p>Official Communication from Administration</p>
          </div>
          <div class="content">
            <h2>Dear ${studentName},</h2>
            <div class="success-badge">✅ CERTIFICATE APPROVED</div>
            <p>Congratulations! We are pleased to inform you that your certificate submission has been reviewed and <strong>approved</strong> by the administration.</p>
            
            <div class="details">
              <h3>📋 Achievement Details:</h3>
              <p><strong>Title:</strong> ${achievementTitle}</p>
              <p><strong>Points Awarded:</strong> <span class="points">${points} points</span></p>
              ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ''}
            </div>

            <p>These points have been added to your total score and will be reflected on your profile and the leaderboard.</p>
            
            <p>Keep up the excellent work! Continue submitting your achievements to earn more recognition and points.</p>

            <p>Best regards,<br>
            <strong>Administration Team</strong><br>
            Student Achievement Portal</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Student Achievement Portal. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Student Achievement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${studentName},

CERTIFICATE APPROVED

Congratulations! We are pleased to inform you that your certificate submission has been reviewed and approved by the administration.

Achievement Details:
- Title: ${achievementTitle}
- Points Awarded: ${points} points
${adminNote ? `- Admin Note: ${adminNote}` : ''}

These points have been added to your total score and will be reflected on your profile and the leaderboard.

Keep up the excellent work! Continue submitting your achievements to earn more recognition and points.

Best regards,
Administration Team
Student Achievement Portal

---
This is an automated message from the Student Achievement Portal.
© ${new Date().getFullYear()} Student Achievement Portal. All rights reserved.
    `
  };
};

const getRejectionEmailTemplate = (studentName, achievementTitle, adminNote) => {
  return {
    subject: '📋 Certificate Review Update - Student Achievement Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-badge { background: #ef4444; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
          .action-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Student Achievement Portal</h1>
            <p>Official Communication from Administration</p>
          </div>
          <div class="content">
            <h2>Dear ${studentName},</h2>
            <div class="warning-badge">❌ CERTIFICATE NOT APPROVED</div>
            <p>We have reviewed your certificate submission. Unfortunately, we are unable to approve it at this time.</p>
            
            <div class="details">
              <h3>📋 Submission Details:</h3>
              <p><strong>Title:</strong> ${achievementTitle}</p>
              ${adminNote ? `<p><strong>Reason for Rejection:</strong><br>${adminNote}</p>` : ''}
            </div>

            <div class="action-box">
              <h3>📝 What to do next?</h3>
              <p>Please review the reason provided above and:</p>
              <ul>
                <li>Ensure your certificate meets all the required criteria</li>
                <li>Upload clear and legible proof documents</li>
                <li>Provide accurate and complete information</li>
                <li>Resubmit your achievement after making necessary corrections</li>
              </ul>
            </div>

            <p>If you have any questions or need clarification, please contact the administration office.</p>

            <p>Thank you for your understanding.</p>

            <p>Best regards,<br>
            <strong>Administration Team</strong><br>
            Student Achievement Portal</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Student Achievement Portal. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Student Achievement Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${studentName},

CERTIFICATE NOT APPROVED

We have reviewed your certificate submission. Unfortunately, we are unable to approve it at this time.

Submission Details:
- Title: ${achievementTitle}
${adminNote ? `- Reason for Rejection: ${adminNote}` : ''}

What to do next?
Please review the reason provided above and:
- Ensure your certificate meets all the required criteria
- Upload clear and legible proof documents
- Provide accurate and complete information
- Resubmit your achievement after making necessary corrections

If you have any questions or need clarification, please contact the administration office.

Thank you for your understanding.

Best regards,
Administration Team
Student Achievement Portal

---
This is an automated message from the Student Achievement Portal.
© ${new Date().getFullYear()} Student Achievement Portal. All rights reserved.
    `
  };
};

// Send email function with retry logic
export const sendApprovalEmail = async (studentEmail, studentName, achievementTitle, points, adminNote) => {
  console.log('\n=== 📧 SENDING APPROVAL EMAIL ===');
  console.log('To:', studentEmail);
  
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Could not create email transporter');
      console.log('📝 Email would have been sent to:', studentEmail);
      console.log('   Subject: Certificate Approved');
      console.log('   Points:', points);
      return { success: false, message: 'Email service unavailable' };
    }
    
    const template = getApprovalEmailTemplate(studentName, achievementTitle, points, adminNote);
    
    const mailOptions = {
      from: `"Student Achievement Portal" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    };
    
    console.log('📤 Sending email...');
    
    // Try to send with timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 30000))
    ]);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Log what would have been sent
    console.log('\n📝 EMAIL DETAILS (for manual sending):');
    console.log('To:', studentEmail);
    console.log('Subject: Certificate Approved');
    console.log('Message: Your certificate for', achievementTitle, 'has been approved with', points, 'points');
    
    // Don't break the approval process
    return { success: false, error: error.message };
  }
};

export const sendRejectionEmail = async (studentEmail, studentName, achievementTitle, adminNote) => {
  console.log('\n=== 📧 SENDING REJECTION EMAIL ===');
  console.log('To:', studentEmail);
  
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Could not create email transporter');
      console.log('📝 Email would have been sent to:', studentEmail);
      console.log('   Subject: Certificate Review Update');
      console.log('   Reason:', adminNote);
      return { success: false, message: 'Email service unavailable' };
    }
    
    const template = getRejectionEmailTemplate(studentName, achievementTitle, adminNote);
    
    const mailOptions = {
      from: `"Student Achievement Portal" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    };
    
    console.log('📤 Sending email...');
    
    // Try to send with timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 30000))
    ]);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Log what would have been sent
    console.log('\n📝 EMAIL DETAILS (for manual sending):');
    console.log('To:', studentEmail);
    console.log('Subject: Certificate Review Update');
    console.log('Message: Your certificate for', achievementTitle, 'was not approved');
    console.log('Reason:', adminNote);
    
    // Don't break the rejection process
    return { success: false, error: error.message };
  }
};

// Announcement email template
const getAnnouncementEmailTemplate = (announcement, adminName) => {
  const typeLabel = announcement.type === 'career_opportunity' ? '💼 Career Opportunity' : '📚 Academic Announcement';
  
  return {
    subject: `${typeLabel}: ${announcement.title} - Student Achievement Portal`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .type-badge { display: inline-block; background: white; color: #667eea; padding: 8px 20px; border-radius: 20px; margin-top: 15px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .announcement-box { background: linear-gradient(to right, #f6f9fc, #f0f4f8); padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #667eea; }
          .announcement-title { color: #2d3748; font-size: 22px; margin-bottom: 15px; font-weight: bold; }
          .announcement-desc { color: #4a5568; font-size: 16px; line-height: 1.8; }
          .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
          .detail-item { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .detail-label { color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
          .detail-value { color: #2d3748; font-size: 15px; font-weight: 600; }
          .action-button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .action-button:hover { background: #5a67d8; }
          .footer { background: #f7fafc; padding: 25px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0; }
          .icon { font-size: 20px; margin-right: 8px; vertical-align: middle; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Student Achievement Portal</h1>
            <div class="type-badge">${typeLabel}</div>
          </div>
          <div class="content">
            <h2 style="color: #2d3748; margin-bottom: 25px;">📢 New Announcement Posted</h2>
            
            <div class="announcement-box">
              <div class="announcement-title">${announcement.title}</div>
              <div class="announcement-desc">${announcement.description}</div>
            </div>
            
            ${announcement.type === 'career_opportunity' ? `
              <div class="details-grid">
                ${announcement.company ? `
                  <div class="detail-item">
                    <div class="detail-label">🏢 Company</div>
                    <div class="detail-value">${announcement.company}</div>
                  </div>
                ` : ''}
                ${announcement.location ? `
                  <div class="detail-item">
                    <div class="detail-label">📍 Location</div>
                    <div class="detail-value">${announcement.location}</div>
                  </div>
                ` : ''}
                ${announcement.package ? `
                  <div class="detail-item">
                    <div class="detail-label">💰 Package</div>
                    <div class="detail-value">${announcement.package}</div>
                  </div>
                ` : ''}
                ${announcement.deadline ? `
                  <div class="detail-item">
                    <div class="detail-label">⏰ Application Deadline</div>
                    <div class="detail-value">${new Date(announcement.deadline).toLocaleDateString()}</div>
                  </div>
                ` : ''}
              </div>
              ${announcement.eligibilityCriteria ? `
                <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
                  <h4 style="color: #2d3748; margin-bottom: 10px;">📋 Eligibility Criteria:</h4>
                  <p style="color: #4a5568;">${announcement.eligibilityCriteria}</p>
                </div>
              ` : ''}
              ${announcement.applyLink ? `
                <center>
                  <a href="${announcement.applyLink}" class="action-button" style="background: #48bb78;">
                    🚀 Apply Now
                  </a>
                </center>
              ` : ''}
            ` : ''}
            
            ${announcement.type === 'academic' ? `
              <div class="details-grid">
                ${announcement.eventDate ? `
                  <div class="detail-item">
                    <div class="detail-label">📅 Event Date</div>
                    <div class="detail-value">${new Date(announcement.eventDate).toLocaleDateString()}</div>
                  </div>
                ` : ''}
                ${announcement.venue ? `
                  <div class="detail-item">
                    <div class="detail-label">📍 Venue</div>
                    <div class="detail-value">${announcement.venue}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 20px; background: #fef5e7; border-radius: 8px; border-left: 4px solid #f39c12;">
              <p style="margin: 0; color: #856404;">
                <strong>💡 Note:</strong> This is an important announcement. Please read carefully and take necessary action if applicable.
              </p>
            </div>
            
            <p style="color: #718096; margin-top: 25px; font-size: 14px;">
              Posted by: <strong>${adminName || 'Administration'}</strong><br>
              Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
          </div>
          <div class="footer">
            <p style="margin: 5px 0;">This is an automated notification from the Student Achievement Portal</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Student Achievement Portal. All rights reserved.</p>
            <p style="margin: 10px 0; color: #a0aec0; font-size: 11px;">
              You received this email because you are registered in the Student Achievement Portal system.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${typeLabel}: ${announcement.title}

NEW ANNOUNCEMENT POSTED

${announcement.description}

${announcement.type === 'career_opportunity' ? `
OPPORTUNITY DETAILS:
${announcement.company ? `Company: ${announcement.company}` : ''}
${announcement.location ? `Location: ${announcement.location}` : ''}
${announcement.package ? `Package: ${announcement.package}` : ''}
${announcement.deadline ? `Application Deadline: ${new Date(announcement.deadline).toLocaleDateString()}` : ''}
${announcement.eligibilityCriteria ? `\nEligibility:\n${announcement.eligibilityCriteria}` : ''}
${announcement.applyLink ? `\nApply at: ${announcement.applyLink}` : ''}
` : ''}

${announcement.type === 'academic' ? `
EVENT DETAILS:
${announcement.eventDate ? `Date: ${new Date(announcement.eventDate).toLocaleDateString()}` : ''}
${announcement.venue ? `Venue: ${announcement.venue}` : ''}
` : ''}

Posted by: ${adminName || 'Administration'}
Date: ${new Date().toLocaleDateString()}

---
This is an automated notification from the Student Achievement Portal
    `
  };
};

// Send announcement email
export const sendAnnouncementEmail = async (recipientEmail, recipientName, announcement, adminName) => {
  console.log('\n=== 📢 SENDING ANNOUNCEMENT EMAIL ===');
  console.log('To:', recipientEmail);
  console.log('Announcement:', announcement.title);
  console.log('Type:', announcement.type);
  
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Could not create email transporter');
      return { success: false, message: 'Email service unavailable' };
    }
    
    const template = getAnnouncementEmailTemplate(announcement, adminName);
    
    const mailOptions = {
      from: `"Student Achievement Portal" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    };
    
    console.log('📤 Sending announcement notification...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Announcement email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send announcement email:', error.message);
    return { success: false, error: error.message };
  }
};

// Export for testing
export default { sendApprovalEmail, sendRejectionEmail, sendAnnouncementEmail };
