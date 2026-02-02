# 🚀 Deploy Backend to Vercel - Quick Guide

Your frontend is live at: **https://erp-frontend-fje5.vercel.app/**

Now let's deploy your backend so your project works end-to-end!

---

## ✅ Prerequisites Checklist

Before deploying, ensure you have:

- [x] MongoDB Atlas account (free tier is fine)
- [x] GitHub account
- [x] Vercel account (same one you used for frontend)
- [ ] All environment variables ready (see below)

---

## 📋 Step 1: Set Up MongoDB Atlas (if not done)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a **FREE cluster** (M0 Sandbox)
3. Create a database user:
   - Username: `erpuser` (or any name)
   - Password: Create a strong password & **SAVE IT**
4. **CRITICAL**: Network Access
   - Click **"Network Access"** in left sidebar
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Vercel's dynamic IPs
5. Get your connection string:
   - Click **"Database"** → **"Connect"** → **"Connect your application"**
   - Copy the connection string (looks like):
   ```
   mongodb+srv://erpuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **Replace `<password>`** with your actual password
   - Add your database name before `?`: 
   ```
   mongodb+srv://erpuser:yourpassword@cluster0.xxxxx.mongodb.net/erpdb?retryWrites=true&w=majority
   ```

---

## 📋 Step 2: Prepare Environment Variables

You'll need these environment variables for Vercel. **Prepare them now:**

```env
# Required
NODE_ENV=production
MONGO_URI=mongodb+srv://erpuser:yourpassword@cluster0.xxxxx.mongodb.net/erpdb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_must_be_at_least_32_characters_long
ADMIN_JWT_SECRET=admin_super_secret_key_must_be_at_least_32_characters_long
FRONTEND_URL=https://erp-frontend-fje5.vercel.app

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123

# Email (if using email features)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# AWS S3 (if using file uploads - optional for now)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name

# AI (if using - optional)
GEMINI_API_KEY=your_gemini_key
```

**Tips for generating secrets:**
- For JWT_SECRET: Use a password generator or run in PowerShell:
  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
  ```

---

## 📋 Step 3: Push Backend to GitHub

Open PowerShell in your backend folder:

```powershell
cd "C:\Users\samee\OneDrive\Desktop\New folder\erp_portal\backend"

# Check git status
git status

# Add all files (your .gitignore will protect .env)
git add .

# Commit
git commit -m "Prepare backend for Vercel deployment"

# Push to GitHub
git push origin main
```

**If this is a new repository:**
```powershell
# Create a new repo on GitHub first, then:
git init
git add .
git commit -m "Initial commit - backend ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/erp-backend.git
git push -u origin main
```

---

## 📋 Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (RECOMMENDED)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Click "Add New" → "Project"**

3. **Import your backend repository**:
   - Find your `erp-backend` repository (or whatever you named it)
   - Click **"Import"**

4. **Configure Project**:
   - **Framework Preset**: Select **"Other"** (Express is auto-detected)
   - **Root Directory**: Leave as `./` (or select backend folder if it's in a monorepo)
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   Click **"Environment Variables"** and add ALL variables from Step 2:
   
   | Name | Value |
   |------|-------|
   | NODE_ENV | production |
   | MONGO_URI | mongodb+srv://... |
   | JWT_SECRET | your_secret... |
   | ADMIN_JWT_SECRET | admin_secret... |
   | FRONTEND_URL | https://erp-frontend-fje5.vercel.app |
   | ADMIN_USERNAME | admin |
   | ADMIN_PASSWORD | Admin@123 |
   | EMAIL_USER | your-email@gmail.com |
   | EMAIL_PASSWORD | your-password |
   
   *(Add AWS and GEMINI keys if you have them)*

6. **Deploy**:
   - Click **"Deploy"**
   - Wait 1-2 minutes for deployment
   - You'll get a URL like: `https://erp-backend-xyz123.vercel.app`

---

## 📋 Step 5: Test Your Backend

Once deployed, test your backend:

1. **Visit your backend URL**: `https://erp-backend-xyz123.vercel.app`
   - You should see: `{"message": "API is running"}`

2. **Test health endpoint**: `https://erp-backend-xyz123.vercel.app/api/health`

3. **Test login**: 
   ```powershell
   curl -X POST https://erp-backend-xyz123.vercel.app/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{"email": "admin@skillflux.com", "password": "Admin@123"}'
   ```

---

## 📋 Step 6: Update Frontend to Use New Backend

Now update your frontend to point to the deployed backend:

1. **Go to Vercel Dashboard → Your Frontend Project**
   - Navigate to: https://vercel.com/dashboard
   - Click on `erp-frontend-fje5` project

2. **Go to Settings → Environment Variables**

3. **Add/Update this variable**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://erp-backend-xyz123.vercel.app/api`
   - Click **"Save"**

4. **Redeploy Frontend**:
   - Go to **"Deployments"** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**
   - Wait for redeployment to complete

---

## 📋 Step 7: Verify Everything Works

1. **Visit your frontend**: https://erp-frontend-fje5.vercel.app

2. **Try to login**:
   - Email: `admin@skillflux.com`
   - Password: `Admin@123`

3. **Check browser console** (F12):
   - Should see API calls going to your backend URL
   - No CORS errors
   - Successful login

---

## 🎉 Success!

Your full-stack application is now live:
- **Frontend**: https://erp-frontend-fje5.vercel.app
- **Backend**: https://erp-backend-xyz123.vercel.app

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
- **Fix**: Check MongoDB Atlas Network Access allows 0.0.0.0/0
- **Fix**: Verify MONGO_URI in Vercel environment variables

### Issue: "CORS error"
- **Fix**: Ensure FRONTEND_URL in backend matches your frontend URL exactly
- **Fix**: Redeploy backend after changing environment variables

### Issue: "JWT error" or "Authentication failed"
- **Fix**: Make sure JWT_SECRET is at least 32 characters
- **Fix**: Check ADMIN_JWT_SECRET is set correctly

### Issue: "Cannot POST /api/..."
- **Fix**: Ensure routes are exported correctly in server.js
- **Fix**: Check vercel.json configuration

### How to view backend logs:
1. Go to Vercel Dashboard → Your backend project
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"Functions"** tab to see logs

---

## 📝 Quick Commands Reference

### View backend logs in Vercel CLI (optional):
```powershell
npm i -g vercel
vercel login
cd backend
vercel logs
```

### Update environment variable:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Edit the variable
3. Go to Deployments → Redeploy latest

### Force redeploy:
```powershell
cd backend
git commit --allow-empty -m "Force redeploy"
git push origin main
```

---

## 🎯 Next Steps

After successful deployment:

1. **Test all features**: Login, CRUD operations, file uploads, etc.
2. **Set up custom domain** (optional): Vercel Settings → Domains
3. **Monitor usage**: Vercel Dashboard shows bandwidth, function invocations
4. **Set up CI/CD**: Auto-deploy on git push (already configured!)

---

**Need help?** 
- Vercel Discord: https://vercel.com/discord
- Vercel Docs: https://vercel.com/docs

**Created**: February 3, 2026
