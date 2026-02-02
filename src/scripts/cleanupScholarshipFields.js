// Migration script to clean up old scholarshipType fields
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ERP from '../models/ERP.js';

dotenv.config();

async function cleanupScholarshipFields() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // Remove scholarshipType field from all existing documents
    const result = await ERP.updateMany(
      {}, 
      { 
        $unset: { scholarshipType: "" } // Remove the field entirely
      }
    );
    
    console.log(`Updated ${result.modifiedCount} documents`);
    
    // Also fix any uppercase scholarshipBasis values
    const scholarshipBasisMap = {
      'VSAT': 'vsat',
      'EMECT': 'emect', 
      'EAMCET': 'emect',
      'IPE': 'ipe',
      'JEE Mains': 'jee_mains',
      'JEE Advance': 'jee_advance'
    };
    
    for (const [oldValue, newValue] of Object.entries(scholarshipBasisMap)) {
      const basisResult = await ERP.updateMany(
        { scholarshipBasis: oldValue },
        { scholarshipBasis: newValue }
      );
      if (basisResult.modifiedCount > 0) {
        console.log(`Fixed ${basisResult.modifiedCount} documents with scholarshipBasis: ${oldValue} -> ${newValue}`);
      }
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

cleanupScholarshipFields();