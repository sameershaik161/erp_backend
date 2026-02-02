import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res) {
  try {
    const { name, email, rollNumber, password, department, section, year, admissionYear } = req.body;
    
    // Check for missing fields
    if (!name || !email || !rollNumber || !password || !department || !section || !year || !admissionYear) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate admission year
    const currentYear = new Date().getFullYear();
    const admissionYearNum = parseInt(admissionYear);
    
    if (admissionYearNum < 2020 || admissionYearNum > currentYear + 1) {
      return res.status(400).json({ message: "Please enter a valid admission year" });
    }
    
    // Calculate graduation year (4-year B.Tech program)
    const graduationYear = admissionYearNum + 4;
    const academicBatch = `${admissionYearNum}-${graduationYear}`;
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existing) {
      if (existing.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      } else {
        return res.status(400).json({ message: "Roll number already registered" });
      }
    }
    
    // Hash password and create user
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      name, 
      email, 
      rollNumber, 
      passwordHash: hash, 
      department, 
      section, 
      year,
      admissionYear: admissionYearNum,
      graduationYear,
      academicBatch
    });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        department: user.department, 
        section: user.section,
        academicBatch: user.academicBatch,
        admissionYear: user.admissionYear,
        graduationYear: user.graduationYear
      } 
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    // allow login with email or rollNumber (client sends email field)
    const { email, password } = req.body;
    console.log("Login attempt:", { email, passwordProvided: !!password });
    
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });
    
    const user = await User.findOne({ $or: [{ email }, { rollNumber: email }] });
    console.log("User found:", user ? `Yes - ${user.email}` : "No");
    
    if (!user) {
      console.log("User not found with email or rollNumber:", email);
      return res.status(400).json({ message: "Invalid credentials - User not found" });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log("Password match:", ok);
    
    if (!ok) {
      console.log("Password mismatch for user:", user.email);
      return res.status(400).json({ message: "Invalid credentials - Wrong password" });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
    console.log("Login successful for:", user.email);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, section: user.section, role: "student" } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    console.log("Auth me() - User data being sent:", {
      id: user._id,
      name: user.name,
      year: user.year,
      section: user.section,
      department: user.department,
      hasYear: !!user.year
    });
    
    // Calculate user's rank
    const rank = await User.countDocuments({ totalPoints: { $gt: user.totalPoints } }) + 1;
    
    const responseData = { ...user.toObject(), rank };
    console.log("Auth me() - Response includes year:", !!responseData.year);
    
    res.json(responseData);
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { year, department } = req.query;
    
    console.log("=== LEADERBOARD DEBUG ===");
    console.log("Query params received:", req.query);
    console.log("Year filter:", year);
    console.log("Department filter:", department);
    
    // First, let's check total students
    const totalStudents = await User.countDocuments();
    const thirdYearStudents = await User.countDocuments({ year: "III" });
    
    console.log(`Total students in database: ${totalStudents}`);
    console.log(`III year students: ${thirdYearStudents}`);
    
    // Build filter query
    const filter = {};
    if (year) {
      filter.year = year;
      console.log("Adding year filter:", year);
    }
    if (department) {
      filter.department = department;
      console.log("Adding department filter:", department);
    }
    
    console.log("Final filter object:", filter);
    
    // Get filtered students sorted by points (including 0 points)
    const leaderboard = await User.find(filter)
      .select("name rollNumber department section year totalPoints profilePicUrl")
      .sort({ totalPoints: -1, createdAt: 1 }) // Sort by points desc, then by creation date
      .limit(100); // Top 100 students
    
    // Add rank to each student and ensure totalPoints defaults to 0
    const leaderboardWithRank = leaderboard.map((student, index) => ({
      ...student.toObject(),
      totalPoints: student.totalPoints || 0,
      rank: index + 1
    }));
    
    console.log(`Leaderboard query filter:`, filter);
    console.log(`Found ${leaderboard.length} students after filtering`);
    if (leaderboard.length > 0) {
      console.log(`Sample students:`, leaderboard.slice(0, 3).map(s => ({ 
        name: s.name, 
        year: s.year, 
        section: s.section,
        points: s.totalPoints || 0 
      })));
    }
    console.log("=== END LEADERBOARD DEBUG ===");
    
    res.json(leaderboardWithRank);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getMyRank(req, res) {
  try {
    const { year, department } = req.query;
    const user = await User.findById(req.userId).select("name rollNumber totalPoints year department");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const userPoints = user.totalPoints || 0;
    
    console.log("=== MY RANK DEBUG ===");
    console.log("User:", user.name);
    console.log("User year:", user.year);
    console.log("Query year param:", year);
    console.log("User points:", userPoints);
    console.log("User ID:", user._id.toString());
    
    // Use user's own year if no year filter provided in query
    const filterYear = year || user.year;
    const filterDept = department || user.department;
    
    console.log("Filtering rank by year:", filterYear);
    console.log("Filtering rank by department:", filterDept);
    
    // Build filter query - same as leaderboard
    const filter = {};
    if (filterYear) filter.year = filterYear;
    if (filterDept) filter.department = filterDept;
    
    console.log("Filter:", filter);
    
    // Get ALL students with the same filter and sort them the same way as leaderboard
    // This ensures rank calculation matches the leaderboard display
    const allStudents = await User.find(filter)
      .select("_id totalPoints")
      .sort({ totalPoints: -1, createdAt: 1 }); // Same sort as leaderboard
    
    console.log("Total students found:", allStudents.length);
    
    // Find user's position in the sorted list
    const userPosition = allStudents.findIndex(s => s._id.toString() === user._id.toString());
    const rank = userPosition + 1; // Convert 0-based index to 1-based rank
    
    console.log("User position in sorted list:", userPosition);
    console.log("User rank:", rank);
    
    // Count total students in filtered set
    const totalStudents = allStudents.length;
    
    // Calculate percentile
    const percentile = totalStudents > 0 ? Math.round(((totalStudents - rank + 1) / totalStudents) * 100) : 0;
    
    console.log("Final rank:", rank);
    console.log("Total students in year:", totalStudents);
    console.log("Percentile:", percentile);
    console.log("=== END MY RANK DEBUG ===");
    
    res.json({
      rank,
      totalStudents,
      percentile,
      totalPoints: userPoints,
      name: user.name,
      rollNumber: user.rollNumber,
      year: user.year,
      department: user.department
    });
  } catch (err) {
    console.error("Rank calculation error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function uploadProfilePic(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    // Store the file path relative to server
    const fileUrl = `/uploads/${req.file.filename}`;
    req.user.profilePicUrl = fileUrl;
    await req.user.save();
    res.json({ message: "Profile picture uploaded", url: fileUrl, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadBanner(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    // Store the file path relative to server
    const fileUrl = `/uploads/${req.file.filename}`;
    req.user.bannerUrl = fileUrl;
    await req.user.save();
    res.json({ message: "Banner uploaded", url: fileUrl, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    // Store the file path relative to server
    const fileUrl = `/uploads/${req.file.filename}`;
    req.user.resumeUrl = fileUrl;
    await req.user.save();
    res.json({ message: "Resume uploaded", url: fileUrl, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, year, section, socialLinks } = req.body;
    
    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters long" });
      }
      req.user.name = name.trim();
    }
    
    // Update year if provided
    if (year !== undefined) {
      if (!["I", "II", "III", "IV"].includes(year)) {
        return res.status(400).json({ message: "Year must be I, II, III, or IV" });
      }
      req.user.year = year;
    }
    
    // Update section if provided
    if (section !== undefined) {
      if (!["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"].includes(section)) {
        return res.status(400).json({ message: "Invalid section" });
      }
      req.user.section = section;
    }
    
    // Update social links if provided
    if (socialLinks) {
      req.user.socialLinks = { ...req.user.socialLinks, ...socialLinks };
    }
    
    await req.user.save();
    
    res.json({ 
      message: "Profile updated successfully", 
      user: {
        name: req.user.name,
        email: req.user.email,
        rollNumber: req.user.rollNumber,
        department: req.user.department,
        section: req.user.section,
        year: req.user.year,
        socialLinks: req.user.socialLinks
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: err.message });
  }
}
