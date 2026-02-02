import ERP from "../models/ERP.js";
import User from "../models/User.js";

// Get student's ERP profile
export async function getMyERP(req, res) {
  try {
    let erp = await ERP.findOne({ student: req.user._id });
    
    // If no ERP exists, create a draft one with academic year context
    if (!erp) {
      // Get current academic year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();
      
      // Academic year runs from June to May (6-5)
      let academicYearStart, academicYearEnd;
      if (currentMonth >= 6) {
        // June-December: Academic year starts this year
        academicYearStart = currentYear;
        academicYearEnd = currentYear + 1;
      } else {
        // January-May: Academic year started last year
        academicYearStart = currentYear - 1;
        academicYearEnd = currentYear;
      }
      
      const currentAcademicYear = `${academicYearStart}-${academicYearEnd}`;
      
      erp = await ERP.create({
        student: req.user._id,
        currentSemester: "1-1",
        currentYear: 1,
        phoneNumber: "0000000000", // placeholder
        status: "draft",
        admissionYear: req.user.admissionYear,
        graduationYear: req.user.graduationYear,
        academicBatch: req.user.academicBatch,
        currentAcademicYear
      });
    }
    
    res.json(erp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update ERP profile (can update partially)
export async function updateERP(req, res) {
  try {
    const erp = await ERP.findOne({ student: req.user._id });
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }
    
    // Don't allow update if already submitted and verified
    if (erp.status === "verified") {
      return res.status(400).json({ message: "Cannot update verified ERP. Contact admin." });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'status' && key !== 'verifiedBy' && key !== 'erpPoints') {
        erp[key] = req.body[key];
      }
    });
    
    await erp.save();
    res.json({ message: "ERP updated successfully", erp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update personal information with file uploads
export async function updatePersonalInfo(req, res) {
  try {
    const erp = await ERP.findOne({ student: req.user._id });
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }
    
    // Don't allow update if already submitted and verified
    if (erp.status === "verified") {
      return res.status(400).json({ message: "Cannot update verified ERP. Contact admin." });
    }
    
    // Parse personal data from form
    const personalData = JSON.parse(req.body.personalData);
    
    // Map scholarship basis values from display names to enum values
    if (personalData.scholarshipBasis) {
      const scholarshipBasisMap = {
        'VSAT': 'vsat',
        'EMECT': 'emect', 
        'EAMCET': 'emect', // Handle both EMECT and EAMCET
        'IPE': 'ipe',
        'JEE Mains': 'jee_mains',
        'JEE Advance': 'jee_advance'
      };
      
      const mappedBasis = scholarshipBasisMap[personalData.scholarshipBasis] || personalData.scholarshipBasis.toLowerCase();
      personalData.scholarshipBasis = mappedBasis;
    }
    
    // Remove deprecated fields
    delete personalData.scholarshipType;
    
    // Update personal information fields
    Object.keys(personalData).forEach(key => {
      if (key !== 'status' && key !== 'verifiedBy' && key !== 'erpPoints') {
        erp[key] = personalData[key];
      }
    });
    
    // Handle file uploads
    if (req.files) {
      if (req.files.scholarshipProof) {
        erp.scholarshipProofUrl = `/uploads/${req.files.scholarshipProof[0].filename}`;
      }
      if (req.files.tenthProof) {
        erp.tenthProofUrl = `/uploads/${req.files.tenthProof[0].filename}`;
      }
      if (req.files.intermediateProof) {
        erp.intermediateProofUrl = `/uploads/${req.files.intermediateProof[0].filename}`;
      }
    }
    
    await erp.save();
    res.json({ message: "Personal information updated successfully", erp });
  } catch (err) {
    console.error('Personal info update error:', err);
    res.status(500).json({ message: err.message || "Failed to update personal information" });
  }
}

// Submit ERP for verification
export async function submitERP(req, res) {
  try {
    const erp = await ERP.findOne({ student: req.user._id });
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }
    
    // Validate required fields
    if (!erp.phoneNumber || erp.phoneNumber === "0000000000") {
      return res.status(400).json({ message: "Please provide a valid phone number" });
    }
    
    if (!erp.semesters || erp.semesters.length === 0) {
      return res.status(400).json({ message: "Please add at least one semester's academic details" });
    }
    
    erp.status = "submitted";
    erp.submittedAt = new Date();
    await erp.save();
    
    res.json({ message: "ERP submitted for verification", erp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Get all submitted ERPs
export async function getAllERPs(req, res) {
  try {
    const { status, academicBatch, admissionYear } = req.query;
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by academic batch (e.g., "2023-2027")
    if (academicBatch) {
      query.academicBatch = academicBatch;
    }
    
    // Filter by admission year (e.g., 2023)
    if (admissionYear) {
      query.admissionYear = parseInt(admissionYear);
    }
    
    const erps = await ERP.find(query)
      .populate("student", "name rollNumber email section year totalPoints academicBatch admissionYear graduationYear")
      .populate("verifiedBy", "username")
      .sort({ submittedAt: -1 });
    
    // Get unique academic batches for filtering options
    const uniqueBatches = await ERP.distinct("academicBatch");
    const uniqueAdmissionYears = await ERP.distinct("admissionYear");
    
    res.json({
      erps,
      filterOptions: {
        academicBatches: uniqueBatches.sort().reverse(),
        admissionYears: uniqueAdmissionYears.sort().reverse()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Get specific student's ERP
export async function getStudentERP(req, res) {
  try {
    const { studentId } = req.params;
    
    const erp = await ERP.findOne({ student: studentId })
      .populate("student", "name rollNumber email section year totalPoints profilePicUrl");
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found for this student" });
    }
    
    res.json(erp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Verify/Reject ERP
export async function verifyERP(req, res) {
  try {
    const { id } = req.params;
    const { action, points = 0, adminNote = "" } = req.body;
    
    const erp = await ERP.findById(id).populate("student");
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }
    
    if (action === "verify") {
      erp.status = "verified";
      erp.verifiedAt = new Date();
      erp.verifiedBy = req.admin._id;
      erp.erpPoints = Number(points || 0);
      erp.adminNote = adminNote;
      
      await erp.save();
      
      // Award points to student
      const user = await User.findById(erp.student._id);
      user.totalPoints = (user.totalPoints || 0) + Number(points || 0);
      await user.save();
      
      return res.json({ 
        message: "ERP verified successfully", 
        erp, 
        studentPoints: user.totalPoints 
      });
      
    } else if (action === "reject") {
      erp.status = "rejected";
      erp.adminNote = adminNote;
      erp.verifiedBy = req.admin._id;
      
      await erp.save();
      
      return res.json({ message: "ERP rejected", erp });
      
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'verify' or 'reject'" });
    }
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: Update ERP points
export async function updateERPPoints(req, res) {
  try {
    const { id } = req.params;
    const { points } = req.body;
    
    const erp = await ERP.findById(id).populate("student");
    
    if (!erp) {
      return res.status(404).json({ message: "ERP not found" });
    }
    
    const oldPoints = erp.erpPoints || 0;
    const newPoints = Number(points || 0);
    const pointsDiff = newPoints - oldPoints;
    
    erp.erpPoints = newPoints;
    await erp.save();
    
    // Update student points
    const user = await User.findById(erp.student._id);
    user.totalPoints = (user.totalPoints || 0) + pointsDiff;
    await user.save();
    
    res.json({ 
      message: "ERP points updated", 
      erp, 
      studentPoints: user.totalPoints 
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
