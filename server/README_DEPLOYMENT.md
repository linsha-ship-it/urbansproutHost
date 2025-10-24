# 🚀 UrbanSprout Backend - Vercel Deployment

Your UrbanSprout backend is now configured for Vercel deployment!

## 📁 What's Been Set Up

### New Files Created:
1. **`vercel.json`** - Vercel configuration
2. **`api/index.js`** - Serverless function entry point
3. **`.vercelignore`** - Files to exclude from deployment
4. **`QUICK_START_VERCEL.md`** - 5-minute quick start guide
5. **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide
6. **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist

## ⚡ Quick Deploy (3 Steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd server
vercel login
vercel
```

### Step 3: Add Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN
```

Then redeploy:
```bash
vercel --prod
```

## 🎯 Start Here

👉 **First Time Deploying?** Read: [`QUICK_START_VERCEL.md`](./QUICK_START_VERCEL.md)

👉 **Need Detailed Instructions?** Read: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)

👉 **Want a Checklist?** Use: [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)

## 📋 Required Environment Variables

You **must** set these in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-32-char-secret-key-here` |
| `CORS_ORIGIN` | Allowed frontend origins | `https://your-app.vercel.app` |

### Optional (Based on Features):
- `SENDGRID_API_KEY` - For email service
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - For payments
- `MISTRAL_API_KEY` - For AI chatbot

## ⚠️ Important Limitations

### Features That Won't Work on Vercel:

1. **Socket.IO** (Real-time WebSocket)
   - Vercel doesn't support persistent connections
   - **Solution**: Deploy Socket.IO separately on Railway/Render

2. **Scheduled Tasks** (`discountLifecycleService`)
   - Serverless functions don't run continuously
   - **Solution**: Use Vercel Cron Jobs (Pro) or external cron service

3. **File Uploads > 4.5MB**
   - Vercel has payload size limits
   - **Solution**: Use Vercel Blob Storage or AWS S3

4. **Long Operations > 30 seconds**
   - Serverless timeout limit
   - **Solution**: Break into smaller operations

## 🔍 Test Your Deployment

After deploying, test these endpoints:

```bash
# Replace with your actual Vercel URL

# Test endpoint
curl https://your-project.vercel.app/api/test

# Health check
curl https://your-project.vercel.app/api/health

# Auth test (should return 401 or method-specific error)
curl https://your-project.vercel.app/api/auth/me
```

## 📊 Monitoring

View logs:
```bash
vercel logs
```

Or in Vercel Dashboard:
- Go to your project
- Click on "Deployments"
- Click on a deployment → "Logs"

## 🔄 Redeployment

Vercel automatically redeploys on git push. Manual redeploy:
```bash
vercel --prod
```

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check if MongoDB Atlas allows connections from 0.0.0.0/0
# Verify MONGODB_URI in Vercel environment variables
vercel env ls
```

### CORS Errors
```bash
# Update CORS_ORIGIN with your frontend URL
vercel env add CORS_ORIGIN
# Enter: https://your-frontend.vercel.app
vercel --prod
```

### Function Timeout
- Optimize database queries
- Add indexes to MongoDB collections
- Reduce response payload size
- Consider pagination for large datasets

## 🎓 Architecture Changes

### Original (server.js):
- HTTP server with Socket.IO
- Persistent connections
- Scheduled tasks
- File system uploads

### Vercel Adaptation (api/index.js):
- Serverless function
- Stateless requests
- Database connection caching
- No persistent connections

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)

## 💡 Pro Tips

1. **Test Locally First**: Use `vercel dev` to test serverless environment locally
2. **Environment Management**: Use different environments for dev/staging/prod
3. **Custom Domain**: Add custom domain in Vercel dashboard
4. **Optimize Cold Starts**: Keep dependencies minimal
5. **Monitor Usage**: Check Vercel analytics for performance insights

## 🎉 Success!

Once deployed, your backend will be available at:
```
https://your-project-name.vercel.app/api
```

Update your frontend to use this URL and you're good to go!

## 📞 Need Help?

- Check the detailed guides in this folder
- Review Vercel logs for errors
- Verify environment variables are set
- Test MongoDB connection separately

---

**Happy Deploying! 🚀**

