# 🚀 Deploying UrbanSprout Backend to Vercel

This guide will walk you through deploying your UrbanSprout backend to Vercel.

## ⚠️ Important Notes

### Socket.IO Limitation
Vercel uses serverless functions, which **do not support WebSocket connections** (Socket.IO). If your application heavily relies on real-time features via Socket.IO, consider these alternatives:
- Use **Vercel's Edge Functions** with polling instead
- Deploy Socket.IO separately on a platform like **Railway**, **Render**, or **Heroku**
- Use **Pusher** or **Ably** for real-time features

### Discount Lifecycle Service
The `discountLifecycleService` that runs on intervals will not work on Vercel. Consider:
- Using **Vercel Cron Jobs** (Pro plan required)
- Setting up external cron job services like **EasyCron** or **cron-job.org**
- Running this service separately on a long-running server

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```
3. **MongoDB Atlas** or any cloud MongoDB (required)
4. **Git Repository** (GitHub, GitLab, or Bitbucket)

## 🔧 Step 1: Prepare Your Environment Variables

You'll need to set up the following environment variables in Vercel:

### Required Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

### Optional Variables (based on your features):
- `CORS_ORIGIN` - Your frontend URL(s), comma-separated
- `PORT` - Not needed for Vercel (auto-assigned)
- Email service variables (if using email features):
  - `SENDGRID_API_KEY` or email service credentials
  - `EMAIL_FROM`
- Payment gateway (Razorpay):
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- Mistral AI (for chatbot):
  - `MISTRAL_API_KEY`
- Firebase Admin (if using):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_CLIENT_EMAIL`

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - Project name? `urbansprout-backend` (or your choice)
   - Directory? `./` (current directory)
   - Override settings? **N**

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add CORS_ORIGIN
   # Add other variables as needed
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. **Push your code to Git** (GitHub/GitLab/Bitbucket)

2. **Import Project in Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New"** → **"Project"**
   - Import your Git repository
   - Select the **server** directory as the root directory

3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **server**
   - Build Command: Leave empty (no build needed)
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Add Environment Variables**:
   - In Project Settings → Environment Variables
   - Add all required variables mentioned above
   - Set them for **Production**, **Preview**, and **Development**

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for deployment to complete

## ✅ Step 3: Verify Deployment

1. **Test the API**:
   Your backend will be available at: `https://your-project.vercel.app`
   
   Test endpoints:
   - `https://your-project.vercel.app/api/test`
   - `https://your-project.vercel.app/api/health`

2. **Check Logs**:
   ```bash
   vercel logs
   ```
   Or view them in the Vercel Dashboard

## 🔄 Step 4: Update Frontend Configuration

Update your frontend's API base URL to point to your Vercel deployment:

```javascript
// In your client/src/config or environment file
const API_BASE_URL = 'https://your-project.vercel.app/api';
```

## 🎯 Step 5: Configure CORS

Make sure to add your frontend URL to the `CORS_ORIGIN` environment variable in Vercel:

```
CORS_ORIGIN=https://your-frontend.vercel.app,https://www.yourdomain.com
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or Vercel's IP ranges
- Check that `MONGODB_URI` is correctly set in Vercel environment variables
- Verify MongoDB Atlas cluster is running

### CORS Errors
- Add your frontend domain to `CORS_ORIGIN` environment variable
- Ensure credentials are properly configured

### 500 Internal Server Error
- Check Vercel logs: `vercel logs` or in dashboard
- Verify all required environment variables are set
- Check MongoDB connection string format

### File Upload Issues
Vercel has a **4.5MB** limit for serverless function payloads. For file uploads:
- Consider using **Vercel Blob Storage**
- Or use cloud storage services like **AWS S3**, **Cloudinary**, or **Firebase Storage**

## 📝 Additional Recommendations

### 1. Set up Custom Domain (Optional)
- In Vercel Dashboard → Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

### 2. Enable Automatic Deployments
- Vercel automatically deploys on Git push
- Main branch → Production
- Other branches → Preview deployments

### 3. Monitor Performance
- Use Vercel Analytics
- Monitor function execution time
- Check serverless function logs regularly

### 4. Handle Long-Running Tasks
If you have tasks that take longer than 10 seconds (Vercel's timeout):
- Move them to background job services
- Use Vercel Cron Jobs (Pro plan)
- Consider Railway/Render for background workers

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

## 📧 Need Help?

If you encounter issues:
1. Check Vercel logs
2. Review MongoDB Atlas network access
3. Verify all environment variables
4. Test API endpoints individually

---

**Note**: Remember that Socket.IO and scheduled services won't work on Vercel's serverless architecture. Consider hybrid deployment if you need these features.

