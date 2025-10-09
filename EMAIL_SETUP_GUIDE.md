# 📧 UrbanSprout Email Setup Guide

## Current Status
The email system is currently running in **simulation mode** because it's using placeholder credentials. To enable real email sending, you need to configure proper email credentials.

## 🚀 Quick Setup (Gmail)

### Step 1: Enable Gmail App Password
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled
4. Go to **Security** → **App passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Environment Variables
Update your `.env` file with your real Gmail credentials:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Important**: 
- Use your actual Gmail address
- Use the 16-character app password (not your regular Gmail password)
- Remove spaces from the app password

### Step 3: Test Email Configuration
Run the email test script:
```bash
cd server
node scripts/testEmailSystem.js
```

### Step 4: Restart Server
After updating credentials, restart your server:
```bash
npm run dev
```

## 🔧 Alternative Email Services

### Using Other SMTP Services
You can also use other email services like:
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Amazon's email service
- **Outlook/Hotmail**: Microsoft's email service

### Custom SMTP Configuration
For custom SMTP, update your `.env`:
```env
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
```

## 🧪 Testing Email Functionality

### Test Registration Email
```bash
# Register a new user and check if email is sent
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
```

### Test Order Email
```bash
# Place an order and check if confirmation email is sent
# (Login first to get token, then place order)
```

### Test Order Status Update
```bash
# Update order status in admin panel and check if email is sent
```

## 📋 Email Types Configured

1. **Registration Email**: Sent when new users register
2. **Order Confirmation**: Sent when orders are placed
3. **Order Status Updates**: Sent when order status changes
4. **Password Reset**: Sent when users request password reset
5. **Blog Approval/Rejection**: Sent for blog post moderation

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid login" Error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Step Verification is enabled
   - Check that the app password is correct (16 characters, no spaces)

2. **"Connection refused" Error**
   - Check your internet connection
   - Verify SMTP host and port settings
   - Some networks block SMTP ports

3. **Emails not being sent**
   - Check server logs for error messages
   - Verify email credentials in `.env` file
   - Ensure server was restarted after updating credentials

### Debug Mode
To see detailed email logs, check the server console output. The system logs:
- Email configuration details
- Success/failure status
- Error messages if sending fails

## 🔒 Security Notes

- Never commit real email credentials to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific email services for production
- Regularly rotate email credentials

## 📞 Support

If you're still having issues:
1. Check the server logs for detailed error messages
2. Verify your email credentials are correct
3. Test with a simple email service first
4. Contact support with specific error messages

---

**Current Configuration**: The system is set up to use `linshanadir789@gmail.com` with an app password. Update the `EMAIL_PASS` in your `.env` file with your actual Gmail app password to enable real email sending.






