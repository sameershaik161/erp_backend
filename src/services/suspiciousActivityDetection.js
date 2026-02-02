import Achievement from "../models/Achievement.js";
import User from "../models/User.js";

/**
 * Suspicious Activity Detection Service
 * Identifies patterns that may indicate fake certificate submissions
 */
export class SuspiciousActivityDetector {

  /**
   * Analyze achievement submission patterns for a student
   * @param {string} studentId - Student's ID
   * @param {Object} newAchievement - New achievement being submitted
   * @returns {Object} Suspicion analysis results
   */
  async analyzeSubmissionPattern(studentId, newAchievement) {
    try {
      console.log('🕵️ Analyzing submission patterns for student:', studentId);
      
      const suspiciousPatterns = [];
      const warningFlags = [];
      let riskScore = 0;
      
      // Get student's achievement history
      const studentAchievements = await Achievement.find({ student: studentId })
        .sort({ createdAt: -1 });
      
      // Pattern Analysis
      const bulkSubmissionCheck = this.checkBulkSubmissions(studentAchievements, newAchievement);
      const duplicateCheck = this.checkDuplicateSubmissions(studentAchievements, newAchievement);
      const progressionCheck = this.checkUnrealisticProgression(studentAchievements, newAchievement);
      const timingCheck = this.checkSuspiciousTiming(studentAchievements, newAchievement);
      const frequencyCheck = this.checkSubmissionFrequency(studentAchievements);
      
      // Aggregate results
      if (bulkSubmissionCheck.suspicious) {
        suspiciousPatterns.push(bulkSubmissionCheck);
        riskScore += 25;
      }
      
      if (duplicateCheck.suspicious) {
        suspiciousPatterns.push(duplicateCheck);
        riskScore += 30;
      }
      
      if (progressionCheck.suspicious) {
        suspiciousPatterns.push(progressionCheck);
        riskScore += 20;
      }
      
      if (timingCheck.suspicious) {
        suspiciousPatterns.push(timingCheck);
        riskScore += 15;
      }
      
      if (frequencyCheck.suspicious) {
        suspiciousPatterns.push(frequencyCheck);
        riskScore += 10;
      }
      
      // Cross-student analysis
      const crossStudentCheck = await this.checkCrossStudentPatterns(newAchievement);
      if (crossStudentCheck.suspicious) {
        suspiciousPatterns.push(crossStudentCheck);
        riskScore += 35;
      }
      
      return {
        riskScore: Math.min(riskScore, 100),
        isSuspicious: riskScore >= 50,
        requiresReview: riskScore >= 30,
        suspiciousPatterns: suspiciousPatterns,
        warningFlags: warningFlags,
        recommendations: this.generateRecommendations(riskScore, suspiciousPatterns),
        analysisDate: new Date()
      };
      
    } catch (error) {
      console.error('Suspicious activity analysis error:', error);
      return {
        riskScore: 0,
        isSuspicious: false,
        requiresReview: true,
        error: error.message,
        analysisDate: new Date()
      };
    }
  }
  
  /**
   * Check for bulk submissions (multiple achievements in short time)
   */
  checkBulkSubmissions(achievements, newAchievement) {
    const recentSubmissions = achievements.filter(ach => {
      const daysDiff = (new Date() - new Date(ach.createdAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });
    
    if (recentSubmissions.length >= 5) {
      return {
        suspicious: true,
        type: 'BULK_SUBMISSION',
        description: `${recentSubmissions.length} achievements submitted in the last 7 days`,
        severity: 'HIGH',
        details: {
          count: recentSubmissions.length,
          timeframe: '7 days'
        }
      };
    }
    
    return { suspicious: false };
  }
  
  /**
   * Check for duplicate or very similar submissions
   */
  checkDuplicateSubmissions(achievements, newAchievement) {
    const similarAchievements = achievements.filter(ach => {
      const titleSimilarity = this.calculateStringSimilarity(
        ach.title.toLowerCase(),
        newAchievement.title.toLowerCase()
      );
      
      const organizationSimilarity = this.calculateStringSimilarity(
        (ach.organizedInstitute || '').toLowerCase(),
        (newAchievement.organizedInstitute || '').toLowerCase()
      );
      
      return titleSimilarity > 0.8 || organizationSimilarity > 0.9;
    });
    
    if (similarAchievements.length > 0) {
      return {
        suspicious: true,
        type: 'DUPLICATE_SUBMISSION',
        description: 'Similar or duplicate achievement already exists',
        severity: 'HIGH',
        details: {
          similarCount: similarAchievements.length,
          existingTitles: similarAchievements.map(ach => ach.title)
        }
      };
    }
    
    return { suspicious: false };
  }
  
  /**
   * Check for unrealistic progression (e.g., beginner to advanced very quickly)
   */
  checkUnrealisticProgression(achievements, newAchievement) {
    const recentAchievements = achievements.filter(ach => {
      const daysDiff = (new Date() - new Date(ach.createdAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30; // Last 30 days
    });
    
    const levelProgression = recentAchievements.map(ach => ach.level);
    levelProgression.push(newAchievement.level);
    
    // Check if jumping from Department/College to International too quickly
    const hasBasicLevel = levelProgression.some(level => 
      ['Department', 'College'].includes(level)
    );
    const hasAdvancedLevel = levelProgression.some(level => 
      ['National', 'International'].includes(level)
    );
    
    if (hasBasicLevel && hasAdvancedLevel && recentAchievements.length <= 2) {
      return {
        suspicious: true,
        type: 'UNREALISTIC_PROGRESSION',
        description: 'Rapid progression from basic to advanced levels',
        severity: 'MEDIUM',
        details: {
          progression: levelProgression,
          timeframe: '30 days'
        }
      };
    }
    
    return { suspicious: false };
  }
  
  /**
   * Check suspicious timing patterns
   */
  checkSuspiciousTiming(achievements, newAchievement) {
    // Check for submissions always at unusual hours
    const submissionHours = achievements.map(ach => 
      new Date(ach.createdAt).getHours()
    );
    submissionHours.push(new Date().getHours());
    
    const nightSubmissions = submissionHours.filter(hour => 
      hour >= 23 || hour <= 5
    ).length;
    
    if (nightSubmissions / submissionHours.length > 0.8 && submissionHours.length >= 3) {
      return {
        suspicious: true,
        type: 'SUSPICIOUS_TIMING',
        description: 'Most submissions made during unusual hours (11PM - 5AM)',
        severity: 'LOW',
        details: {
          nightSubmissionPercentage: Math.round((nightSubmissions / submissionHours.length) * 100)
        }
      };
    }
    
    return { suspicious: false };
  }
  
  /**
   * Check submission frequency patterns
   */
  checkSubmissionFrequency(achievements) {
    if (achievements.length < 3) return { suspicious: false };
    
    const intervals = [];
    for (let i = 1; i < achievements.length; i++) {
      const diff = new Date(achievements[i-1].createdAt) - new Date(achievements[i].createdAt);
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    // Check if all submissions are at very regular intervals (possibly automated)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    
    if (variance < 1 && avgInterval < 7 && intervals.length >= 3) {
      return {
        suspicious: true,
        type: 'REGULAR_INTERVALS',
        description: 'Submissions follow suspiciously regular pattern',
        severity: 'MEDIUM',
        details: {
          averageInterval: Math.round(avgInterval * 10) / 10,
          variance: Math.round(variance * 100) / 100
        }
      };
    }
    
    return { suspicious: false };
  }
  
  /**
   * Check patterns across multiple students (e.g., same certificate template)
   */
  async checkCrossStudentPatterns(newAchievement) {
    try {
      // Look for similar achievements from other students
      const similarAchievements = await Achievement.find({
        student: { $ne: newAchievement.student },
        title: { $regex: new RegExp(newAchievement.title.split(' ').join('|'), 'i') },
        organizedInstitute: newAchievement.organizedInstitute,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).populate('student', 'name rollNumber');
      
      if (similarAchievements.length >= 3) {
        return {
          suspicious: true,
          type: 'CROSS_STUDENT_PATTERN',
          description: `${similarAchievements.length} students submitted similar achievements recently`,
          severity: 'HIGH',
          details: {
            count: similarAchievements.length,
            students: similarAchievements.map(ach => ({
              name: ach.student.name,
              rollNumber: ach.student.rollNumber,
              submissionDate: ach.createdAt
            }))
          }
        };
      }
      
      return { suspicious: false };
      
    } catch (error) {
      console.error('Cross-student pattern check error:', error);
      return { suspicious: false };
    }
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - matrix[len2][len1] / maxLen;
  }
  
  /**
   * Generate recommendations based on risk analysis
   */
  generateRecommendations(riskScore, suspiciousPatterns) {
    const recommendations = [];
    
    if (riskScore >= 70) {
      recommendations.push('HIGH RISK: Immediate manual review required before approval');
      recommendations.push('Contact student for additional verification documents');
      recommendations.push('Verify achievement claims through external sources if possible');
    } else if (riskScore >= 50) {
      recommendations.push('MEDIUM RISK: Thorough review recommended');
      recommendations.push('Cross-verify with similar submissions from other students');
    } else if (riskScore >= 30) {
      recommendations.push('LOW RISK: Basic verification sufficient');
      recommendations.push('Standard approval process can proceed with caution');
    }
    
    // Pattern-specific recommendations
    suspiciousPatterns.forEach(pattern => {
      switch (pattern.type) {
        case 'BULK_SUBMISSION':
          recommendations.push('Review all recent submissions together for consistency');
          break;
        case 'DUPLICATE_SUBMISSION':
          recommendations.push('Check if this is a resubmission or genuine duplicate achievement');
          break;
        case 'CROSS_STUDENT_PATTERN':
          recommendations.push('Investigate possible certificate template sharing or fraud ring');
          break;
      }
    });
    
    return recommendations;
  }
}

// Export singleton instance
export const suspiciousActivityDetector = new SuspiciousActivityDetector();