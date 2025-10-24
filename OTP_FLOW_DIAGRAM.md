# 🔄 Email OTP Verification Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER SIGNUP WITH OTP                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  1. User opens  │
│  Signup Page    │
│  /signup        │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  2. User fills form:                                                     │
│     • Name: "John Doe"                                                   │
│     • Email: "john@example.com"  ✓ Email validated real-time           │
│     • Password: "SecurePass123!" ✓ Strength checked                     │
│     • Confirm Password           ✓ Match validated                      │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  3. User clicks "Create Account"                                        │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  4. Frontend → POST /api/auth/send-otp                                  │
│     {                                                                    │
│       name: "John Doe",                                                 │
│       email: "john@example.com",                                        │
│       password: "SecurePass123!",                                       │
│       role: "beginner"                                                  │
│     }                                                                    │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  5. Backend Processing:                                                  │
│     ✓ Check if email already exists                                     │
│     ✓ Generate random 6-digit OTP (e.g., "748392")                     │
│     ✓ Delete any existing OTP for this email                           │
│     ✓ Save to MongoDB:                                                  │
│       • OTP: "748392"                                                   │
│       • Email: "john@example.com"                                       │
│       • Expires: Date.now() + 10 minutes                               │
│       • User data: {name, password, role}                              │
│     ✓ Send email with OTP                                              │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  6. Email Service:                                                       │
│                                                                          │
│     ┌──────────────────────────────────────────────┐                    │
│     │  📧 Email to: john@example.com                │                    │
│     │  From: UrbanSprout <noreply@urbansprout.com> │                    │
│     │  Subject: 🔐 Your UrbanSprout Verification   │                    │
│     │                                               │                    │
│     │  Hello John Doe!                             │                    │
│     │                                               │                    │
│     │  Your verification code:                     │                    │
│     │                                               │                    │
│     │         ┌─────────────────┐                  │                    │
│     │         │   7 4 8 3 9 2   │                  │                    │
│     │         └─────────────────┘                  │                    │
│     │                                               │                    │
│     │  Valid for 10 minutes                        │                    │
│     │  Never share this code                       │                    │
│     └──────────────────────────────────────────────┘                    │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  7. Frontend shows OTP Verification Screen:                             │
│                                                                          │
│     ┌────────────────────────────────────────────┐                      │
│     │         📧 Verify Your Email                │                      │
│     │                                             │                      │
│     │  We've sent a 6-digit code to              │                      │
│     │  john@example.com                          │                      │
│     │                                             │                      │
│     │  Enter Verification Code:                  │                      │
│     │                                             │                      │
│     │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │                      │
│     │  │ 7 │ │ 4 │ │ 8 │ │ 3 │ │ 9 │ │ 2 │     │                      │
│     │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘     │                      │
│     │                                             │                      │
│     │      [Verify Email] button                 │                      │
│     │                                             │                      │
│     │  Didn't receive the code?                  │                      │
│     │  [Resend Code] (available in 60s)          │                      │
│     └────────────────────────────────────────────┘                      │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  8. User enters OTP and clicks "Verify Email"                          │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  9. Frontend → POST /api/auth/verify-otp                                │
│     {                                                                    │
│       email: "john@example.com",                                        │
│       otp: "748392"                                                     │
│     }                                                                    │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  10. Backend Verification:                                              │
│      ✓ Find OTP record for email                                       │
│      ✓ Check if OTP exists                                             │
│      ✓ Check if OTP is expired (< 10 minutes old)                      │
│      ✓ Check if max attempts reached (< 5)                             │
│      ✓ Compare OTP: "748392" === "748392" ✓                           │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         ├─── If OTP Invalid ──────────────────────────────────────────────┐
         │                                                                  │
         │    ┌──────────────────────────────────────────────────┐        │
         │    │ ❌ Increment attempts counter                     │        │
         │    │ ❌ Return error: "Invalid OTP. 4 attempts left"  │        │
         │    │ ❌ User stays on OTP screen                      │        │
         │    └──────────────────────────────────────────────────┘        │
         │                                                                  │
         └─── If OTP Valid ────────────────────────────────────────────────┤
                                                                            v
┌─────────────────────────────────────────────────────────────────────────┐
│  11. OTP Verified Successfully:                                         │
│      ✓ Create user account in MongoDB:                                 │
│        • name: "John Doe"                                               │
│        • email: "john@example.com"                                      │
│        • password: <hashed with bcrypt>                                 │
│        • role: "beginner"                                               │
│        • emailVerified: true ← VERIFIED!                               │
│      ✓ Create empty cart for user                                      │
│      ✓ Create empty wishlist for user                                  │
│      ✓ Delete OTP record from database                                 │
│      ✓ Generate JWT token                                              │
│      ✓ Send welcome email                                              │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  12. Frontend receives success response:                                │
│      {                                                                   │
│        success: true,                                                   │
│        message: "Email verified! Account created.",                    │
│        data: {                                                          │
│          user: { id, name, email, role, emailVerified },               │
│          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."            │
│        }                                                                 │
│      }                                                                   │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  13. User is logged in automatically:                                   │
│      ✓ Save token to localStorage                                      │
│      ✓ Save user data to context                                       │
│      ✓ Redirect to /dashboard                                          │
└────────┬────────────────────────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────────────────────────┐
│  14. 🎉 SUCCESS! User is on Dashboard                                  │
│      • Verified account                                                 │
│      • Logged in                                                        │
│      • Ready to use UrbanSprout                                        │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            ALTERNATIVE FLOWS
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO A: User didn't receive OTP                                   │
└─────────────────────────────────────────────────────────────────────────┘

    User on OTP screen
           │
           v
    "Didn't receive code?" → Wait 60s → Click "Resend Code"
           │
           v
    POST /api/auth/resend-otp { email: "john@example.com" }
           │
           v
    Backend:
    ✓ Find existing OTP record
    ✓ Delete old OTP
    ✓ Generate new 6-digit OTP
    ✓ Send new email
    ✓ Reset timer to 60s
           │
           v
    User receives new OTP → Enters code → Verified!


┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO B: OTP Expired (> 10 minutes)                               │
└─────────────────────────────────────────────────────────────────────────┘

    User enters OTP after 10+ minutes
           │
           v
    Backend checks: expiresAt < Date.now()
           │
           v
    Delete OTP record
           │
           v
    Return error: "OTP has expired. Please request a new one."
           │
           v
    User clicks "Resend Code" → Gets new OTP


┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO C: Maximum Attempts Reached                                  │
└─────────────────────────────────────────────────────────────────────────┘

    User enters wrong OTP 5 times
           │
           v
    Backend: attempts >= 5
           │
           v
    Delete OTP record
           │
           v
    Return error: "Maximum attempts reached. Please request new OTP."
           │
           v
    User clicks "Resend Code" → Gets fresh OTP with reset attempts


┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO D: User wants to change email                                │
└─────────────────────────────────────────────────────────────────────────┘

    User on OTP screen
           │
           v
    Click "← Back to Signup"
           │
           v
    Return to signup form (form data preserved)
           │
           v
    Change email → Submit → New OTP sent to new email


═══════════════════════════════════════════════════════════════════════════
                          DATABASE OPERATIONS
═══════════════════════════════════════════════════════════════════════════

MongoDB Collections Involved:
────────────────────────────────────────────────────────────────────────────

1. OTPs Collection (temporary):
   Document during verification:
   {
     _id: ObjectId("..."),
     email: "john@example.com",
     otp: "748392",
     type: "registration",
     expiresAt: ISODate("2025-10-22T12:10:00Z"),
     verified: false,
     attempts: 0,
     maxAttempts: 5,
     userData: {
       name: "John Doe",
       password: "$2a$12$hashed...",
       role: "beginner"
     },
     createdAt: ISODate("2025-10-22T12:00:00Z"),
     updatedAt: ISODate("2025-10-22T12:00:00Z")
   }

   Status: DELETED after successful verification

────────────────────────────────────────────────────────────────────────────

2. Users Collection (permanent):
   Document after verification:
   {
     _id: ObjectId("..."),
     name: "John Doe",
     email: "john@example.com",
     password: "$2a$12$hashed...",
     role: "beginner",
     emailVerified: true,  ← VERIFIED!
     status: "active",
     preferences: {
       lightLevel: null,
       wateringFrequency: null,
       spaceType: null,
       experience: null,
       petFriendly: false,
       airPurifying: false
     },
     createdAt: ISODate("2025-10-22T12:05:00Z"),
     updatedAt: ISODate("2025-10-22T12:05:00Z")
   }

   Status: CREATED after OTP verification

────────────────────────────────────────────────────────────────────────────

3. Carts Collection (auto-created):
   {
     _id: ObjectId("..."),
     user: ObjectId("user_id"),
     items: [],
     createdAt: ISODate("2025-10-22T12:05:00Z"),
     updatedAt: ISODate("2025-10-22T12:05:00Z")
   }

────────────────────────────────────────────────────────────────────────────

4. Wishlists Collection (auto-created):
   {
     _id: ObjectId("..."),
     user: ObjectId("user_id"),
     items: [],
     createdAt: ISODate("2025-10-22T12:05:00Z"),
     updatedAt: ISODate("2025-10-22T12:05:00Z")
   }


═══════════════════════════════════════════════════════════════════════════
                            SECURITY FEATURES
═══════════════════════════════════════════════════════════════════════════

✅ OTP expires in 10 minutes (prevents old OTPs from working)
✅ Maximum 5 verification attempts (prevents brute force)
✅ Random 6-digit OTP (1,000,000 possible combinations)
✅ OTP deleted after successful verification (one-time use)
✅ Password hashed with bcrypt (12 rounds)
✅ Email verification status tracked (emailVerified: true)
✅ Duplicate email prevention (checked before sending OTP)
✅ JWT token for authentication
✅ Auto-cleanup of expired OTPs (MongoDB TTL index)
✅ Rate limiting on resend (60-second cooldown)


═══════════════════════════════════════════════════════════════════════════
                            TIME SEQUENCE
═══════════════════════════════════════════════════════════════════════════

T+0s    : User fills signup form
T+1s    : OTP sent to email (saved in DB)
T+2s    : User receives email
T+10s   : User enters OTP
T+11s   : OTP verified, account created
T+12s   : User logged in, redirected to dashboard

Maximum time: T+600s (10 minutes) before OTP expires


═══════════════════════════════════════════════════════════════════════════
                                DONE! 🎉
═══════════════════════════════════════════════════════════════════════════
```




