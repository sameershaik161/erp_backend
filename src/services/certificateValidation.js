import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI-Powered Certificate Validation Service
 * Analyzes certificates for authenticity and fraud detection
 */
export class CertificateValidator {
  
  /**
   * Analyze certificate image/document for authenticity
   * @param {string} fileUrl - S3 URL or local path to certificate
   * @param {Object} achievementData - Achievement details for context
   * @returns {Object} Validation results
   */
  async validateCertificate(fileUrl, achievementData) {
    try {
      console.log('🔍 Starting certificate validation for:', achievementData.title);
      
      // Download and prepare image for AI analysis
      const imageData = await this.prepareImageForAnalysis(fileUrl);
      
      // AI-powered certificate analysis
      const aiAnalysis = await this.performAIAnalysis(imageData, achievementData);
      
      // Perform additional verification checks
      const verificationChecks = await this.performVerificationChecks(achievementData);
      
      // Calculate overall trust score
      const trustScore = this.calculateTrustScore(aiAnalysis, verificationChecks);
      
      return {
        isValid: trustScore >= 70,
        trustScore: trustScore,
        aiAnalysis: aiAnalysis,
        verificationChecks: verificationChecks,
        recommendations: this.generateRecommendations(trustScore, aiAnalysis),
        flags: this.identifyRedFlags(aiAnalysis, verificationChecks),
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Certificate validation error:', error);
      return {
        isValid: false,
        error: error.message,
        trustScore: 0,
        flags: ['VALIDATION_ERROR'],
        timestamp: new Date()
      };
    }
  }
  
  /**
   * AI Analysis using Gemini Vision
   */
  async performAIAnalysis(imageData, achievementData) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Analyze this certificate/achievement document for authenticity and validity. Please evaluate:

    CONTEXT:
    - Achievement Title: ${achievementData.title}
    - Category: ${achievementData.category}
    - Level: ${achievementData.level}
    - Institution/Issuer: ${achievementData.issuer || 'Not specified'}
    - Student Name: ${achievementData.studentName}

    ANALYSIS CRITERIA:
    1. AUTHENTICITY INDICATORS:
       - Official logos, seals, signatures
       - Professional design and formatting
       - Consistent typography and layout
       - Quality of printing/digital creation
    
    2. ISSUER VERIFICATION:
       - Is this from a legitimate organization?
       - Does the issuer match the claimed achievement?
       - Are contact details/websites visible and realistic?
    
    3. CONTENT VALIDATION:
       - Does achievement title match certificate content?
       - Are dates realistic and properly formatted?
       - Is the level of achievement appropriate for the issuer?
       - Any spelling errors or inconsistencies?
    
    4. FRAUD INDICATORS:
       - Poor image quality or obvious editing
       - Mismatched fonts or formatting
       - Generic/template appearance
       - Unrealistic achievement claims
       - Missing standard certificate elements
    
    5. TECHNICAL ANALYSIS:
       - Image resolution and compression artifacts
       - Signs of digital manipulation
       - Consistent lighting and shadows
    
    Please provide a JSON response with:
    {
      "authenticity_score": (0-100),
      "issuer_legitimacy": (0-100),
      "content_accuracy": (0-100),
      "technical_quality": (0-100),
      "fraud_indicators": ["list", "of", "concerns"],
      "positive_indicators": ["list", "of", "good", "signs"],
      "issuer_analysis": "detailed analysis of issuing organization",
      "content_analysis": "analysis of certificate content and claims",
      "recommendation": "APPROVE/REVIEW/REJECT",
      "confidence_level": (0-100),
      "detailed_notes": "comprehensive analysis summary"
    }
    `;
    
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response JSON');
      }
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        authenticity_score: 50,
        issuer_legitimacy: 50,
        content_accuracy: 50,
        technical_quality: 50,
        fraud_indicators: ['AI_ANALYSIS_FAILED'],
        positive_indicators: [],
        recommendation: 'MANUAL_REVIEW',
        confidence_level: 0,
        detailed_notes: `AI analysis failed: ${error.message}`
      };
    }
  }
  
  /**
   * Additional verification checks
   */
  async performVerificationChecks(achievementData) {
    const checks = {
      dateValidation: this.validateDates(achievementData),
      issuerVerification: await this.verifyIssuer(achievementData),
      categoryConsistency: this.checkCategoryConsistency(achievementData),
      levelAppropriate: this.checkLevelAppropriateness(achievementData)
    };
    
    return checks;
  }
  
  /**
   * Validate achievement dates
   */
  validateDates(achievementData) {
    const result = { passed: true, issues: [] };
    
    if (achievementData.dateOfAchievement) {
      const achievementDate = new Date(achievementData.dateOfAchievement);
      const now = new Date();
      
      // Check if date is in the future
      if (achievementDate > now) {
        result.passed = false;
        result.issues.push('Achievement date is in the future');
      }
      
      // Check if date is too old (more than 10 years)
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(now.getFullYear() - 10);
      if (achievementDate < tenYearsAgo) {
        result.issues.push('Achievement is quite old (>10 years)');
      }
      
      // Check if date format is realistic
      const dateStr = achievementData.dateOfAchievement.toString();
      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}/) && !dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        result.issues.push('Unusual date format');
      }
    }
    
    return result;
  }
  
  /**
   * Verify issuer legitimacy
   */
  async verifyIssuer(achievementData) {
    const result = { 
      passed: true, 
      issues: [],
      verifiedIssuer: false,
      issuerDetails: null
    };
    
    if (!achievementData.issuer) {
      result.issues.push('No issuer specified');
      result.passed = false;
      return result;
    }
    
    // Check against known legitimate issuers
    const legitimateIssuers = [
      'NPTEL', 'Coursera', 'edX', 'Udemy', 'AWS', 'Google', 'Microsoft', 
      'IBM', 'Oracle', 'Cisco', 'CompTIA', 'IEEE', 'ACM', 'HackerRank',
      'CodeChef', 'LeetCode', 'HackerEarth', 'GeeksforGeeks'
    ];
    
    const issuerLower = achievementData.issuer.toLowerCase();
    const isKnownIssuer = legitimateIssuers.some(issuer => 
      issuerLower.includes(issuer.toLowerCase())
    );
    
    if (isKnownIssuer) {
      result.verifiedIssuer = true;
      result.issuerDetails = 'Recognized legitimate issuer';
    } else {
      result.issues.push('Issuer not in known legitimate organizations list');
    }
    
    return result;
  }
  
  /**
   * Check category consistency
   */
  checkCategoryConsistency(achievementData) {
    const result = { passed: true, issues: [] };
    
    const categoryKeywords = {
      'Certification': ['certificate', 'certified', 'certification', 'course completion'],
      'Competition': ['competition', 'contest', 'hackathon', 'challenge', 'winner', 'rank'],
      'Course': ['course', 'training', 'workshop', 'bootcamp', 'program'],
      'Project': ['project', 'development', 'built', 'created', 'implemented']
    };
    
    const titleLower = achievementData.title.toLowerCase();
    const category = achievementData.category;
    
    if (categoryKeywords[category]) {
      const hasRelevantKeywords = categoryKeywords[category].some(keyword => 
        titleLower.includes(keyword)
      );
      
      if (!hasRelevantKeywords) {
        result.passed = false;
        result.issues.push(`Title "${achievementData.title}" doesn't match category "${category}"`);
      }
    }
    
    return result;
  }
  
  /**
   * Check if level is appropriate for the type of achievement
   */
  checkLevelAppropriateness(achievementData) {
    const result = { passed: true, issues: [] };
    
    // Basic checks for level appropriateness
    if (achievementData.level === 'International' && 
        achievementData.category === 'Certification' &&
        achievementData.issuer && 
        !['AWS', 'Google', 'Microsoft', 'Oracle', 'IBM'].some(issuer => 
          achievementData.issuer.toLowerCase().includes(issuer.toLowerCase())
        )) {
      result.issues.push('International level claimed for non-global certification provider');
    }
    
    return result;
  }
  
  /**
   * Calculate overall trust score
   */
  calculateTrustScore(aiAnalysis, verificationChecks) {
    let score = 0;
    let totalWeight = 0;
    
    // AI analysis weights
    if (aiAnalysis.authenticity_score !== undefined) {
      score += aiAnalysis.authenticity_score * 0.3;
      totalWeight += 0.3;
    }
    
    if (aiAnalysis.issuer_legitimacy !== undefined) {
      score += aiAnalysis.issuer_legitimacy * 0.25;
      totalWeight += 0.25;
    }
    
    if (aiAnalysis.content_accuracy !== undefined) {
      score += aiAnalysis.content_accuracy * 0.2;
      totalWeight += 0.2;
    }
    
    if (aiAnalysis.technical_quality !== undefined) {
      score += aiAnalysis.technical_quality * 0.15;
      totalWeight += 0.15;
    }
    
    // Verification checks weights
    const verificationScore = Object.values(verificationChecks).reduce((acc, check) => {
      return acc + (check.passed ? 100 : 0);
    }, 0) / Object.keys(verificationChecks).length;
    
    score += verificationScore * 0.1;
    totalWeight += 0.1;
    
    return totalWeight > 0 ? Math.round(score / totalWeight) : 50;
  }
  
  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(trustScore, aiAnalysis) {
    const recommendations = [];
    
    if (trustScore >= 80) {
      recommendations.push('Certificate appears highly authentic - Safe to approve');
    } else if (trustScore >= 60) {
      recommendations.push('Certificate shows good authenticity - Review details before approval');
      recommendations.push('Check issuer details and achievement claims manually');
    } else if (trustScore >= 40) {
      recommendations.push('Certificate has authenticity concerns - Requires thorough manual review');
      recommendations.push('Contact student for additional verification');
    } else {
      recommendations.push('Certificate shows significant red flags - Consider rejection');
      recommendations.push('Request student to provide additional proof or documentation');
    }
    
    if (aiAnalysis.fraud_indicators && aiAnalysis.fraud_indicators.length > 0) {
      recommendations.push(`Address fraud indicators: ${aiAnalysis.fraud_indicators.join(', ')}`);
    }
    
    return recommendations;
  }
  
  /**
   * Identify red flags requiring immediate attention
   */
  identifyRedFlags(aiAnalysis, verificationChecks) {
    const flags = [];
    
    // AI-identified fraud indicators
    if (aiAnalysis.fraud_indicators) {
      flags.push(...aiAnalysis.fraud_indicators.map(flag => `AI_FRAUD: ${flag}`));
    }
    
    // Low AI scores
    if (aiAnalysis.authenticity_score < 40) {
      flags.push('LOW_AUTHENTICITY_SCORE');
    }
    
    if (aiAnalysis.issuer_legitimacy < 40) {
      flags.push('UNVERIFIED_ISSUER');
    }
    
    // Verification check failures
    Object.entries(verificationChecks).forEach(([checkName, check]) => {
      if (!check.passed && check.issues.length > 0) {
        flags.push(`${checkName.toUpperCase()}_FAILED: ${check.issues[0]}`);
      }
    });
    
    return flags;
  }
  
  /**
   * Prepare image for AI analysis
   */
  async prepareImageForAnalysis(fileUrl) {
    try {
      let imageBuffer;
      let mimeType = 'image/jpeg';
      
      if (fileUrl.startsWith('http')) {
        // Download from URL (S3)
        const response = await axios.get(fileUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        imageBuffer = Buffer.from(response.data);
        mimeType = response.headers['content-type'] || 'image/jpeg';
      } else {
        // Read from local file system
        imageBuffer = fs.readFileSync(fileUrl);
        const ext = path.extname(fileUrl).toLowerCase();
        mimeType = ext === '.png' ? 'image/png' : 
                   ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                   ext === '.gif' ? 'image/gif' : 'image/jpeg';
      }
      
      return {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType
      };
      
    } catch (error) {
      throw new Error(`Failed to prepare image for analysis: ${error.message}`);
    }
  }
}

// Export singleton instance
export const certificateValidator = new CertificateValidator();