# 🔔 UrbanSprout Notification System

## Overview

The UrbanSprout notification system provides real-time notifications for various user activities including blog approvals, order placements, likes, and comments. The system includes both email notifications (existing) and in-app notification bar functionality.

## Features Implemented

### ✅ Blog Notifications
- **Blog Approval**: When a blog post is approved → sends notification to author: "✅ Your blog post has been approved and is now live!"
- **Blog Rejection**: When a blog post is rejected → sends notification to author: "❌ Your blog post has been rejected. Reason: [reason]"
- **Blog Likes**: When someone likes a blog post → sends notification to author: "❤️ Someone liked your blog post"
- **Blog Comments**: When someone comments on a blog post → sends notification to author: "💬 Someone commented on your blog post"

### ✅ Order Notifications
- **Order Placement**: When a user places an order → sends notification: "🛒 Your order has been placed successfully!"
- **Order Status Updates**: Framework ready for shipping/delivery notifications

### ✅ Notification Bar UI
- **Badge Counter**: Red badge showing unread notification count (like Instagram)
- **Dropdown Menu**: Click bell to see notifications with proper icons and timestamps
- **Real-time Updates**: WebSocket integration for instant notifications
- **Mark as Read**: Individual and bulk mark-as-read functionality
- **Delete Notifications**: Option to delete individual notifications

## Technical Implementation

### Database Schema
The notification system uses the `Notification` model with the following structure:

```javascript
{
  userId: ObjectId,           // User who receives the notification
  userEmail: String,          // User's email for email notifications
  type: String,               // Notification type (blog_approved, order_placed, etc.)
  title: String,              // Notification title
  message: String,            // Notification message
  relatedId: ObjectId,        // ID of related entity (Blog, Order)
  relatedModel: String,       // Model name ('Blog', 'Order')
  isRead: Boolean,           // Read status
  createdAt: Date            // Creation timestamp
}
```

### Notification Types
- `blog_approved` - Blog post approved
- `blog_rejected` - Blog post rejected
- `blog_deleted` - Blog post deleted
- `blog_like` - Someone liked a blog post
- `blog_comment` - Someone commented on a blog post
- `order_placed` - Order placed successfully
- `order_status_update` - Order status changed
- `order_shipped` - Order shipped
- `order_delivered` - Order delivered
- `order_cancelled` - Order cancelled

### API Endpoints
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Real-time Features
- WebSocket integration for instant notifications
- Real-time badge counter updates
- Browser notifications (with permission)

## Usage Examples

### Sending a Notification
```javascript
const notificationService = require('../utils/notificationService');

await notificationService.sendNotification(userId, {
  userEmail: user.email,
  type: 'blog_approved',
  title: '✅ Blog Post Approved!',
  message: 'Your blog post "Plant Care Tips" has been approved and is now live!',
  relatedId: blogPost._id,
  relatedModel: 'Blog'
});
```

### Frontend Integration
The notification system is integrated into the `NotificationIcon` component in the top navigation bar. Users will see:
- A bell icon with a red badge showing unread count
- Clicking the bell opens a dropdown with notifications
- Each notification shows appropriate icons (❤️ for likes, 💬 for comments, etc.)
- Timestamps in human-readable format ("2h ago", "1d ago")

## Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Start the client: `cd client && npm run dev`
3. Login with a test user
4. Perform actions that trigger notifications:
   - Create a blog post (admin can approve/reject)
   - Like a blog post
   - Comment on a blog post
   - Place an order
5. Check the notification bell icon in the top bar

### Automated Testing
Run the test script to verify all notification types:
```bash
cd server
node scripts/testNotifications.js
```

## Integration Points

### Blog Controller
- `approvePost()` - Sends approval notification
- `rejectPost()` - Sends rejection notification
- `toggleLike()` - Sends like notification
- `addComment()` - Sends comment notification

### Store Controller
- `createOrder()` - Sends order placement notification
- `verifyPayment()` - Sends order placement notification for online payments

### Email Integration
The notification system works alongside the existing email system:
- Email notifications are sent for important events (order confirmations, blog approvals)
- In-app notifications provide immediate feedback
- Both systems can be used together or independently

## Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `CORS_ORIGIN` - Allowed CORS origins
- `VITE_API_BASE_URL` - Frontend API base URL

### WebSocket Configuration
The notification system uses Socket.IO for real-time communication. Configuration is handled in `utils/socketIO.js`.

## Future Enhancements

### Planned Features
1. **Push Notifications**: Browser push notifications for offline users
2. **Email Preferences**: User settings for notification preferences
3. **Notification Categories**: Group notifications by type
4. **Rich Notifications**: Include images and action buttons
5. **Notification History**: Archive old notifications
6. **Bulk Operations**: Select multiple notifications for actions

### Order Status Notifications
The framework is ready for order status notifications. To implement:
1. Add order status update logic in admin panel
2. Trigger notifications when status changes
3. Update frontend to handle order status notifications

## Troubleshooting

### Common Issues
1. **Notifications not showing**: Check WebSocket connection and API endpoints
2. **Badge not updating**: Verify real-time connection and notification service
3. **Email notifications failing**: Check email service configuration
4. **Database errors**: Verify MongoDB connection and schema

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check console logs for notification service activity.

## Support

For issues or questions about the notification system:
1. Check the console logs for error messages
2. Verify database connectivity
3. Test API endpoints manually
4. Check WebSocket connection status

The notification system is now fully functional and ready for production use! 🎉




