# 🎯 Backend Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (allow 0.0.0.0/0 for Vercel)
- [ ] Connection string obtained (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 2. Environment Variables Prepared
- [ ] `MONGODB_URI` - MongoDB connection string ready
- [ ] `JWT_SECRET` - Generate a strong secret (min 32 characters)
- [ ] `CORS_ORIGIN` - Your frontend URL(s) ready
- [ ] Email service credentials (if applicable)
- [ ] Payment gateway credentials (if applicable)
- [ ] AI service API keys (if applicable)

### 3. Code Review
- [ ] All sensitive data removed from code
- [ ] No hardcoded URLs or credentials
- [ ] `.env` file not committed to Git
- [ ] `.vercelignore` includes sensitive files
- [ ] Dependencies up to date (`npm outdated`)

### 4. Git Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible
- [ ] Server folder structure is correct

## 🚀 Deployment Steps

### Step 1: Vercel Account Setup
- [ ] Signed up at vercel.com
- [ ] Email verified
- [ ] Connected Git provider (GitHub/GitLab/Bitbucket)

### Step 2: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```
- [ ] Vercel CLI installed
- [ ] Logged in: `vercel login`

### Step 3: Deploy Backend
- [ ] Navigated to server directory
- [ ] Ran `vercel` command OR imported via dashboard
- [ ] Project created successfully
- [ ] Initial deployment completed

### Step 4: Configure Environment Variables
Add each variable in Vercel Dashboard or via CLI:

```bash
# Via CLI
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
# ... add others as needed
```

Or via Dashboard:
- [ ] Opened project in Vercel dashboard
- [ ] Navigated to Settings → Environment Variables
- [ ] Added all required variables
- [ ] Set for Production, Preview, and Development environments

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```
- [ ] Redeployed to production
- [ ] Deployment successful

## 🧪 Testing Steps

### Test API Endpoints
- [ ] Test endpoint: `https://your-project.vercel.app/api/test`
  - Expected: Success message with timestamp
  
- [ ] Health endpoint: `https://your-project.vercel.app/api/health`
  - Expected: Status "healthy" with database "connected"

- [ ] Auth endpoints: `https://your-project.vercel.app/api/auth/...`
  - Test login/signup functionality

### Test Database Connection
- [ ] API can connect to MongoDB
- [ ] Can create/read/update/delete data
- [ ] Check Vercel logs for any DB errors

### Test CORS
- [ ] Frontend can make requests to backend
- [ ] No CORS errors in browser console
- [ ] Credentials (cookies) work properly

## 📝 Post-Deployment

### Update Frontend Configuration
- [ ] Updated API base URL in frontend code
- [ ] Tested frontend with production backend
- [ ] Deployed frontend changes

### Monitor and Debug
- [ ] Checked Vercel deployment logs
- [ ] No errors in function logs
- [ ] Response times acceptable (<10 seconds)
- [ ] All features working as expected

### Documentation
- [ ] Documented backend URL
- [ ] Updated README with deployment info
- [ ] Shared API documentation with team

## ⚠️ Known Limitations on Vercel

### Features That Won't Work:
- [ ] **Socket.IO** - Real-time WebSocket connections
  - Solution: Use polling or deploy Socket.IO separately
  
- [ ] **Scheduled Tasks** - `discountLifecycleService`
  - Solution: Use Vercel Cron Jobs (Pro) or external cron service
  
- [ ] **File Uploads > 4.5MB** - Vercel payload limit
  - Solution: Use Vercel Blob Storage or cloud storage (S3, Cloudinary)
  
- [ ] **Long-running processes > 10s** - Serverless timeout
  - Solution: Break into smaller functions or use background workers

### Alternative Solutions Considered:
- [ ] Socket.IO on separate platform (Railway/Render)
- [ ] Cron jobs via external service
- [ ] Cloud storage for file uploads
- [ ] Background job queue for long tasks

## 🔒 Security Checklist

- [ ] Environment variables properly secured
- [ ] No secrets in code or logs
- [ ] MongoDB credentials not exposed
- [ ] API rate limiting configured (if needed)
- [ ] CORS properly configured (not too permissive)
- [ ] JWT secrets strong and unique
- [ ] HTTPS enforced (automatic on Vercel)

## 📊 Performance Optimization

- [ ] Database queries optimized
- [ ] Indexes created on frequently queried fields
- [ ] Connection pooling configured in MongoDB
- [ ] Response payload sizes reasonable
- [ ] Unnecessary middleware removed

## 🎉 Deployment Complete!

Once all items are checked:
- [ ] Backend is live and working
- [ ] Frontend is connected
- [ ] All features tested
- [ ] Team notified of new deployment
- [ ] Monitoring/alerts set up (optional)

## 📱 Quick Reference

### Your Deployment URLs:
- Backend: `https://[your-project-name].vercel.app`
- Frontend: `https://[your-frontend-name].vercel.app` (to be deployed)

### Useful Commands:
```bash
# Deploy to development
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

### Support Resources:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Vercel Support: https://vercel.com/support

---

**Good luck with your deployment! 🚀**

