# ⚡ Quick Start: Deploy to Vercel in 5 Minutes

## 🎯 What You'll Need (2 minutes prep)

1. **MongoDB Atlas Connection String**
   - Get it from: [cloud.mongodb.com](https://cloud.mongodb.com)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

2. **JWT Secret**
   - Generate one: Run this in terminal
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Vercel Account** (free)
   - Sign up: [vercel.com/signup](https://vercel.com/signup)

## 🚀 Deploy Now (3 minutes)

### Method 1: Via Vercel CLI (Fastest)

```bash
# 1. Install Vercel CLI (if not already)
npm install -g vercel

# 2. Go to server directory
cd server

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel

# Follow prompts:
# - Setup and deploy? Y
# - Which scope? [your account]
# - Link to existing project? N
# - Project name? urbansprout-backend
# - Directory? ./
# - Override settings? N

# 5. Add environment variables
vercel env add MONGODB_URI
# Paste your MongoDB connection string

vercel env add JWT_SECRET
# Paste your JWT secret

vercel env add CORS_ORIGIN
# Enter: http://localhost:5173
# (Update this later with your frontend URL)

# 6. Deploy to production
vercel --prod
```

### Method 2: Via Vercel Dashboard

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - **Root Directory**: Select `server`
   - **Framework Preset**: Other
   - Click **Deploy**

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add these three required variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your generated secret
     - `CORS_ORIGIN`: Your frontend URL
   - Click **Redeploy** after adding variables

## ✅ Test Your Deployment

Open these URLs in your browser (replace with your actual Vercel URL):

1. **Test Endpoint**:
   ```
   https://your-project-name.vercel.app/api/test
   ```
   ✅ Should show: Success message with timestamp

2. **Health Check**:
   ```
   https://your-project-name.vercel.app/api/health
   ```
   ✅ Should show: "status": "healthy", "database": "connected"

## 🔧 Update Your Frontend

In your frontend code, update the API URL:

```javascript
// client/src/config/api.js (or wherever you define your API URL)
const API_URL = 'https://your-project-name.vercel.app/api';
```

## 🐛 Troubleshooting

### ❌ "Database connection failed"
- Check if MongoDB Atlas allows connections from `0.0.0.0/0`
- Verify `MONGODB_URI` is correctly set in Vercel
- Format should be: `mongodb+srv://...`

### ❌ CORS errors
- Add your frontend URL to `CORS_ORIGIN` in Vercel environment variables
- Format: `https://your-frontend.vercel.app`
- For multiple origins: `https://domain1.com,https://domain2.com`

### ❌ 500 Internal Server Error
- Check logs: Run `vercel logs` or view in Vercel dashboard
- Ensure all environment variables are set
- Redeploy: `vercel --prod`

## 📝 Next Steps

1. ✅ Deploy your frontend (React app) to Vercel
2. ✅ Update `CORS_ORIGIN` with your frontend URL
3. ✅ Set up custom domain (optional)
4. ✅ Configure additional services (email, payments, etc.)

## ⚡ Pro Tips

- **Auto-deploy**: Vercel automatically deploys on every git push
- **Preview URLs**: Every branch gets a preview URL
- **Logs**: View logs with `vercel logs` or in dashboard
- **Rollback**: Easy rollback to previous deployments in dashboard

## 🎉 You're Done!

Your backend is now live on Vercel! 

**Your API URL**: `https://[your-project-name].vercel.app/api`

---

Need help? Check out:
- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Vercel Documentation](https://vercel.com/docs)

