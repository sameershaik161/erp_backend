# SkillFlux Backend API

Backend server for SkillFlux - Student Achievement Management System

## Features

- 🎓 Student & Admin Authentication
- 🏆 Achievement Management with AI Analysis
- 📊 ERP (Educational Resource Planning) System
- 📢 Announcements & Notifications
- 🤖 Google Gemini AI Integration for Certificate Analysis
- 📁 File Upload Handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini AI
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then update the `.env` file with your actual values:

   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/skillflux

   # JWT Secrets (Change these to your own secure values)
   JWT_SECRET=your-student-jwt-secret-key-here
   ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here

   # Server Port
   PORT=5000

   # Google Gemini AI API Key (REQUIRED for AI Certificate Analysis)
   GEMINI_API_KEY=your-gemini-api-key-here

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173

   # Environment
   NODE_ENV=development
   ```

3. **Database Setup**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For Windows (if installed as service)
   net start MongoDB

   # For macOS/Linux
   sudo systemctl start mongod
   ```

4. **Run the Server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Student registration
- `POST /auth/login` - Student login
- `POST /auth/admin/login` - Admin login

### Achievements
- `POST /achievements/add` - Submit achievement (Student)
- `GET /achievements/my-achievements` - Get student's achievements
- `GET /admin/achievements` - Get all achievements (Admin)
- `PUT /admin/achievements/:id/verify` - Approve/Reject achievement (Admin)
- `POST /admin/analyze-certificate` - AI-powered certificate analysis (Admin)

### ERP
- `POST /erp/submit` - Submit/Update ERP (Student)
- `GET /erp/my-erp` - Get student's ERP
- `GET /erp/admin/all` - Get all ERPs (Admin)
- `PUT /erp/admin/:id/verify` - Verify/Reject ERP (Admin)

### Students
- `GET /admin/students` - Get all students (Admin)
- `GET /admin/students/:id` - Get student details (Admin)

### Analytics
- `GET /admin/analytics` - Get dashboard statistics (Admin)
- `GET /admin/dashboard-stats` - Get detailed dashboard stats (Admin)

## AI Certificate Analysis

The backend uses **Google Gemini AI** to analyze student achievement certificates and provide:

- Credibility score (0-100)
- Recommended points to award
- Key highlights and skills identified
- Red flags or concerns
- Confidence level assessment

### Setting up Gemini AI

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSyCieBnCDbFqeGJvv5Ub5j0gTRFegrNM4yI
   ```
3. The AI analysis will automatically work when admins click "AI Analyze Certificate" button

## File Uploads

Uploaded files (certificates, profile pictures, resumes) are stored in the `uploads/` directory:
- `uploads/achievements/` - Achievement certificates
- `uploads/profiles/` - Profile pictures
- `uploads/resumes/` - Student resumes
- `uploads/erps/` - ERP related documents

**Note:** The `uploads/` folder is gitignored and should not be committed to version control.

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- CORS protection
- Input validation with Joi

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed-admin` - Create default admin account (if available)

## Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
├── uploads/             # File uploads (gitignored)
├── config/              # Configuration files
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment template
├── server.js            # Entry point
└── package.json         # Dependencies
```

## Deployment to Vercel

This backend is configured for deployment on Vercel's serverless platform.

### Prerequisites
1. Create a [Vercel account](https://vercel.com)
2. Install Vercel CLI (optional): `npm i -g vercel`
3. Have your MongoDB Atlas connection string ready

### Deploy Steps

#### Option 1: Deploy via Vercel Dashboard
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your backend repository
5. Configure environment variables:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret for students
   - `ADMIN_JWT_SECRET` - Your JWT secret for admins
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `FRONTEND_URL` - Your frontend URL (e.g., https://yourapp.vercel.app)
   - `NODE_ENV` - Set to `production`
6. Click "Deploy"

#### Option 2: Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add ADMIN_JWT_SECRET
vercel env add GEMINI_API_KEY
vercel env add FRONTEND_URL

# Deploy to production
vercel --prod
```

### Important Notes for Vercel Deployment

⚠️ **File Uploads**: 
- Uploaded files in Vercel are stored in `/tmp` directory (temporary)
- Files are NOT persistent across serverless function invocations
- **Recommendation**: Use cloud storage (Cloudinary, AWS S3, etc.) for production
- Current setup works for testing but files will be lost after function timeout

⚠️ **MongoDB Connection**:
- Use MongoDB Atlas (cloud database) - local MongoDB won't work on Vercel
- Whitelist Vercel's IP addresses or use `0.0.0.0/0` (allow all)

⚠️ **Environment Variables**:
- Set all required environment variables in Vercel dashboard
- Never commit `.env` file to Git

### After Deployment

1. Get your deployment URL (e.g., `https://your-backend.vercel.app`)
2. Update your frontend's API base URL to point to this URL
3. Test all API endpoints
4. Monitor function logs in Vercel dashboard

### Local Development

The code automatically detects the environment:
- **Local**: Uses `./uploads` directory
- **Vercel**: Uses `/tmp/uploads` directory

To run locally:
```bash
npm run dev
```

## Upgrading to Cloud Storage (Recommended for Production)

For production use, replace local file storage with cloud storage:

1. **Cloudinary** (Recommended):
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

2. **AWS S3**:
   ```bash
   npm install aws-sdk multer-s3
   ```

See `src/middlewares/multerS3Upload.js` for implementation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
