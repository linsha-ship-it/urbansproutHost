#!/bin/bash

echo "🔔 UrbanSprout Notification System Test"
echo "======================================"
echo ""

# Check if servers are running
echo "1. Checking if servers are running..."

# Check backend server
if curl -s http://localhost:5001/api/test > /dev/null; then
    echo "✅ Backend server is running on port 5001"
else
    echo "❌ Backend server is not running on port 5001"
    echo "   Please start it with: cd server && npm run dev"
    exit 1
fi

# Check frontend server
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend server is running on port 5173"
else
    echo "❌ Frontend server is not running on port 5173"
    echo "   Please start it with: cd client && npm run dev"
    exit 1
fi

echo ""
echo "2. Testing notification API..."

# Test notification API with a valid token
cd server
TOKEN=$(node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function getTestToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbansprout');
    const user = await User.findOne({ role: { \$ne: 'admin' } });
    if (!user) {
      console.log('NO_USER');
      return;
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    console.log(token);
    await mongoose.connection.close();
  } catch (error) {
    console.log('ERROR');
  }
}
getTestToken();
" 2>/dev/null)

if [ "$TOKEN" = "NO_USER" ]; then
    echo "❌ No test user found in database"
    echo "   Please create a user account first"
    exit 1
elif [ "$TOKEN" = "ERROR" ]; then
    echo "❌ Error connecting to database"
    exit 1
else
    echo "✅ Generated test token"
fi

# Test unread count API
echo "Testing unread count API..."
UNREAD_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/notifications/unread-count)
if echo "$UNREAD_RESPONSE" | grep -q '"success":true'; then
    UNREAD_COUNT=$(echo "$UNREAD_RESPONSE" | grep -o '"unreadCount":[0-9]*' | grep -o '[0-9]*')
    echo "✅ Unread count API working: $UNREAD_COUNT unread notifications"
else
    echo "❌ Unread count API failed: $UNREAD_RESPONSE"
fi

# Test notifications list API
echo "Testing notifications list API..."
NOTIFICATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:5001/api/notifications?limit=3")
if echo "$NOTIFICATIONS_RESPONSE" | grep -q '"success":true'; then
    NOTIFICATIONS_COUNT=$(echo "$NOTIFICATIONS_RESPONSE" | grep -o '"notifications":\[.*\]' | grep -o '"_id"' | wc -l)
    echo "✅ Notifications list API working: $NOTIFICATIONS_COUNT notifications returned"
else
    echo "❌ Notifications list API failed: $NOTIFICATIONS_RESPONSE"
fi

cd ..

echo ""
echo "3. Frontend Testing Instructions:"
echo "================================"
echo ""
echo "1. Open your browser and go to: http://localhost:5173"
echo "2. Login with your account (or create one if needed)"
echo "3. Look for the notification bell icon in the top navigation bar"
echo "4. Click the bell to see notifications"
echo "5. If notifications don't show, go to: http://localhost:5173/notification-debug"
echo "   This will show detailed debug information"
echo ""
echo "4. Manual Testing Steps:"
echo "========================"
echo ""
echo "To trigger notifications:"
echo "1. Create a blog post (as a regular user)"
echo "2. Login as admin and approve/reject the blog post"
echo "3. Like or comment on a blog post"
echo "4. Place an order in the store"
echo ""
echo "5. Troubleshooting:"
echo "==================="
echo ""
echo "If notifications still don't show:"
echo "1. Open browser developer tools (F12)"
echo "2. Check the Console tab for error messages"
echo "3. Look for messages starting with 🔔 (notification debug logs)"
echo "4. Check the Network tab for failed API calls"
echo "5. Verify you're logged in by checking localStorage for 'urbansprout_token'"
echo ""
echo "6. Database Check:"
echo "=================="
echo ""
echo "To check notifications in database:"
echo "cd server && node scripts/testNotifications.js"
echo ""
echo "✅ Test completed! Check the instructions above to verify the notification system."




