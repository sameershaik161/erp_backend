// Vercel Serverless Function Entry Point
import dotenv from "dotenv";
dotenv.config();

import app from "../server.js";

// Export the Express app as a serverless function
export default app;
