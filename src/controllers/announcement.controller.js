import Announcement from "../models/Announcement.js";
import User from "../models/User.js";
import { sendAnnouncementEmail } from "../services/emailService.js";

// Admin: Create announcement
export async function createAnnouncement(req, res) {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      postedBy: req.admin._id
    });
    
    // Send email notifications
    console.log('📢 New announcement created:', announcement.title);
    console.log('📧 Sending email notifications...');
    
    try {
      // Get admin email for notification
      const adminEmail = process.env.EMAIL_USER;
      const adminName = req.admin.username || 'Admin';
      
      // Send notification to admin (you)
      if (adminEmail) {
        const adminEmailResult = await sendAnnouncementEmail(
          adminEmail,
          'Admin',
          announcement,
          adminName
        );
        console.log('📧 Admin notification:', adminEmailResult.success ? 'Sent' : 'Failed');
      }
      
      // Optionally, send to all active students
      if (req.body.sendToAllStudents) {
        const students = await User.find({ isActive: true }).select('email name');
        console.log(`📧 Sending to ${students.length} students...`);
        
        // Send emails in batches to avoid overload
        const emailPromises = students.map(student => 
          sendAnnouncementEmail(
            student.email,
            student.name,
            announcement,
            adminName
          ).catch(err => {
            console.error(`Failed to send to ${student.email}:`, err.message);
            return { success: false };
          })
        );
        
        const results = await Promise.all(emailPromises);
        const successCount = results.filter(r => r.success).length;
        console.log(`📧 Emails sent: ${successCount}/${students.length}`);
      }
      
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError.message);
      // Don't fail the announcement creation if email fails
    }
    
    res.status(201).json({ 
      message: "Announcement created successfully", 
      announcement,
      emailSent: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Get all announcements
export async function getAllAnnouncementsAdmin(req, res) {
  try {
    const { type, isActive } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === "true";
    
    const announcements = await Announcement.find(query)
      .populate("postedBy", "username")
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Update announcement
export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true }
    );
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    
    res.json({ message: "Announcement updated", announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Delete announcement
export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Student: Get active announcements
export async function getActiveAnnouncements(req, res) {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    
    if (type) query.type = type;
    
    // Filter by student's year if targetYear is set
    const announcements = await Announcement.find(query)
      .populate("postedBy", "username")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);
    
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Student: Increment view count
export async function incrementViewCount(req, res) {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    res.json({ message: "View counted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get announcement stats
export async function getAnnouncementStats(req, res) {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const academicCount = await Announcement.countDocuments({ type: "academic", isActive: true });
    const careerCount = await Announcement.countDocuments({ type: "career_opportunity", isActive: true });
    
    res.json({
      total: totalAnnouncements,
      active: activeAnnouncements,
      academic: academicCount,
      career: careerCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
