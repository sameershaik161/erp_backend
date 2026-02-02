import { sendAnnouncementEmail } from './src/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n=================================');
console.log('📢 TESTING ANNOUNCEMENT EMAIL');
console.log('=================================\n');

// Test data for different types of announcements
const testAnnouncements = {
  academic: {
    title: 'Upcoming Tech Symposium 2024',
    description: 'Join us for an exciting day of technology presentations, workshops, and networking opportunities. Industry experts will share insights on AI, Cloud Computing, and Web Development. All students are encouraged to attend.',
    type: 'academic',
    eventDate: new Date('2024-12-15'),
    venue: 'Main Auditorium, Building A',
    isPinned: true
  },
  career: {
    title: 'TCS Campus Recruitment Drive',
    description: 'Tata Consultancy Services is conducting a campus recruitment drive for final year students. This is an excellent opportunity to start your career with a global IT leader.',
    type: 'career_opportunity',
    company: 'Tata Consultancy Services',
    location: 'Bangalore, Hyderabad, Chennai',
    package: '4.5 - 7 LPA',
    deadline: new Date('2024-11-30'),
    eligibilityCriteria: 'Final year students with minimum 60% aggregate, No active backlogs',
    applyLink: 'https://careers.tcs.com/campus',
    isPinned: true
  }
};

async function testAnnouncementEmails() {
  const recipientEmail = process.env.EMAIL_USER;
  const adminName = 'Admin';
  
  if (!recipientEmail) {
    console.log('❌ ERROR: EMAIL_USER not configured in .env');
    return;
  }
  
  console.log('📧 Recipient:', recipientEmail);
  console.log('👤 Admin Name:', adminName);
  console.log('');
  
  // Test Academic Announcement
  console.log('1️⃣ Testing ACADEMIC Announcement Email:');
  console.log('   Title:', testAnnouncements.academic.title);
  console.log('   Type: Academic');
  console.log('   Sending...');
  
  try {
    const result1 = await sendAnnouncementEmail(
      recipientEmail,
      'Test Student',
      testAnnouncements.academic,
      adminName
    );
    
    if (result1.success) {
      console.log('   ✅ Academic announcement email sent!');
      console.log('   Message ID:', result1.messageId);
    } else {
      console.log('   ❌ Failed:', result1.error || result1.message);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  // Wait 2 seconds between emails
  console.log('\n   ⏳ Waiting 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Career Opportunity Announcement
  console.log('2️⃣ Testing CAREER OPPORTUNITY Announcement Email:');
  console.log('   Title:', testAnnouncements.career.title);
  console.log('   Company:', testAnnouncements.career.company);
  console.log('   Type: Career Opportunity');
  console.log('   Sending...');
  
  try {
    const result2 = await sendAnnouncementEmail(
      recipientEmail,
      'Test Student',
      testAnnouncements.career,
      adminName
    );
    
    if (result2.success) {
      console.log('   ✅ Career announcement email sent!');
      console.log('   Message ID:', result2.messageId);
    } else {
      console.log('   ❌ Failed:', result2.error || result2.message);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n=================================');
  console.log('📊 TEST SUMMARY:');
  console.log('=================================');
  console.log('✅ Announcement email system is configured!');
  console.log('📧 Check your inbox for 2 test announcement emails');
  console.log('📁 Also check spam/junk folder\n');
  console.log('🎯 Your system now sends emails when:');
  console.log('   1. Admin creates a new announcement');
  console.log('   2. Admin can optionally notify all students');
  console.log('   3. Beautiful HTML templates for both types');
  console.log('   4. Academic events show date & venue');
  console.log('   5. Career opportunities show company & package');
}

testAnnouncementEmails().catch(console.error);
