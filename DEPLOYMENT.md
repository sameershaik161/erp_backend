# Vercel Deployment Guide - SkillFlux Backend

## 🚀 Quick Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string ready
- [ ] All environment variables prepared
- [ ] Code pushed to GitHub
- [ ] Vercel account created

## Step-by-Step Deployment

### 1. Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/skillflux`)
5. **Important**: In Network Access, add `0.0.0.0/0` to whitelist all IPs (Vercel uses dynamic IPs)

### 2. Push Code to GitHub

```bash
cd d:/stackhack/backend

# Initialize git if not already done
git init

# Add all files (gitignore will exclude sensitive files)
git add .

# Commit
git commit -m "Prepare backend for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/skillflux-backend.git

# Push
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easier)

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose your `skillflux-backend` repository
5. Vercel will auto-detect it's a Node.js project

#### Configure Project Settings:

**Framework Preset:** Other
**Root Directory:** `./` (leave as is)
**Build Command:** (leave empty)
**Output Directory:** (leave empty)

#### Add Environment Variables:

Click **"Environment Variables"** and add:

```
MONGO_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/skillflux
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-different-from-above
GEMINI_API_KEY=AIzaSyCieBnCDbFqeGJvv5Ub5j0gTRFegrNM4yI
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=5000
```

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy (this will ask for project settings)
vercel

# Add environment variables one by one
vercel env add MONGO_URI production
# (Paste your MongoDB connection string when prompted)

vercel env add JWT_SECRET production
# (Enter your JWT secret)

vercel env add ADMIN_JWT_SECRET production
# (Enter your admin JWT secret)

vercel env add GEMINI_API_KEY production
# (Enter: AIzaSyCieBnCDbFqeGJvv5Ub5j0gTRFegrNM4yI)

vercel env add FRONTEND_URL production
# (Enter your frontend URL)

vercel env add NODE_ENV production
# (Enter: production)

# Deploy to production
vercel --prod
```

### 4. Verify Deployment

After deployment, you'll get a URL like: `https://skillflux-backend.vercel.app`

**Test the API:**

```bash
# Test root endpoint
curl https://your-backend-url.vercel.app/

# Should return: {"ok":true}
```

**Test in browser:**
Go to: `https://your-backend-url.vercel.app/`

### 5. Update Frontend

Update your frontend's API configuration to use the new Vercel URL:

**File:** `frontend/skillflux/src/api/axiosInstance.js`

```javascript
const API_URL = "https://your-backend-url.vercel.app/api";
```

## 📋 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/skillflux` |
| `JWT_SECRET` | Secret key for student JWT tokens | `my-super-secret-key-12345-random` |
| `ADMIN_JWT_SECRET` | Secret key for admin JWT tokens | `different-admin-secret-67890` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSyCieBnCDbFqeGJvv5Ub5j0gTRFegrNM4yI` |
| `FRONTEND_URL` | Your frontend URL for CORS | `https://skillflux.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |

## ⚠️ Important Notes

### File Uploads Limitation

**Current Setup:**
- Files are uploaded to `/tmp` directory on Vercel
- `/tmp` directory is **temporary** and cleared after function execution
- Files **will be lost** after ~5-15 minutes of inactivity

**Solutions for Production:**

1. **Use Cloudinary (Recommended):**
   - Free tier: 25 GB storage, 25 GB bandwidth
   - Easy to integrate
   - Automatic image optimization
   - [Sign up here](https://cloudinary.com/)

2. **Use AWS S3:**
   - More control over storage
   - Pay-as-you-go pricing
   - Requires AWS account

3. **Use Vercel Blob Storage:**
   - Vercel's official solution
   - Integrated with Vercel dashboard
   - Simple pricing

### MongoDB Atlas Setup

**Network Access:**
- Add `0.0.0.0/0` to allow connections from anywhere
- Vercel uses dynamic IPs, so you can't whitelist specific IPs

**Connection String Format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🐛 Troubleshooting

### Error: "unable to load legacy provider"
**Fix:** Already fixed in the code. Multer now uses `/tmp` directory on Vercel.

### Error: "ENOENT: no such file or directory, mkdir"
**Fix:** Make sure `NODE_ENV=production` is set in Vercel environment variables.

### Error: "MongoServerError: bad auth"
**Fix:** Check your MongoDB connection string - username and password might be incorrect.

### Error: "CORS policy blocked"
**Fix:** Make sure `FRONTEND_URL` in Vercel environment variables matches your actual frontend URL.

### API returns 404
**Fix:** Make sure your routes include `/api` prefix:
- Correct: `https://backend.vercel.app/api/auth/login`
- Wrong: `https://backend.vercel.app/auth/login`

## 📊 Monitoring

### View Logs
1. Go to Vercel dashboard
2. Select your project
3. Click on "Deployments"
4. Click on a deployment
5. View "Function Logs"

### Check Function Performance
- Vercel dashboard shows execution time
- Free tier: 100 GB-hours/month
- Each API call uses compute time

## 🔄 Redeployment

### Automatic (Recommended)
Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

### Manual via CLI
```bash
vercel --prod
```

## 📱 Connect Frontend

After deployment, update your frontend:

**File:** `frontend/skillflux/src/api/axiosInstance.js`

```javascript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://your-backend-url.vercel.app/api", // Update this
  timeout: 10000,
});

// ... rest of the code
```

## ✅ Post-Deployment Checklist

- [ ] API root endpoint returns `{ok: true}`
- [ ] Student login works
- [ ] Admin login works
- [ ] File uploads work (temporary)
- [ ] AI certificate analysis works
- [ ] Frontend can connect to backend
- [ ] CORS is properly configured
- [ ] All API endpoints respond correctly

## 🎉 Success!

Your backend is now live on Vercel! 

**Next steps:**
1. Test all API endpoints
2. Connect frontend to backend
3. Consider upgrading to cloud storage for file uploads
4. Monitor usage in Vercel dashboard

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
