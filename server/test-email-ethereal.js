#!/usr/bin/env node

/**
 * Test Email Service with Ethereal Email
 * This script tests the email service with Ethereal Email for real email sending
 */

const nodemailer = require('nodemailer');

async function testEtherealEmail() {
  console.log('🧪 Testing Ethereal Email Service...\n');

  try {
    // Create a test account with Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal Email Account Created:', {
      user: testAccount.user,
      pass: testAccount.pass
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Test email content
    const mailOptions = {
      from: `"UrbanSprout Test" <${testAccount.user}>`,
      to: 'test@example.com',
      subject: '🌱 UrbanSprout - Order Confirmation Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🌱 UrbanSprout</h1>
            <h2>Order Confirmation</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h3>Hello Test User!</h3>
            <p>Thank you for your order. Your payment has been confirmed.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h4>Order Details:</h4>
              <p><strong>Order Number:</strong> ORD_TEST_123</p>
              <p><strong>Total Amount:</strong> ₹100</p>
              <p><strong>Payment Method:</strong> Razorpay</p>
            </div>
            <p>We'll send you another email once your order ships!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 UrbanSprout. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        Hello Test User!
        
        Thank you for your order. Your payment has been confirmed.
        
        Order Details:
        - Order Number: ORD_TEST_123
        - Total Amount: ₹100
        - Payment Method: Razorpay
        
        We'll send you another email once your order ships!
        
        © 2024 UrbanSprout. All rights reserved.
      `
    };

    console.log('📧 Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // Get the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(result);
    console.log('🔗 Preview URL:', previewUrl);
    
    console.log('\n🎉 Email service is working perfectly!');
    console.log('📧 You can view the email at the preview URL above.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEtherealEmail();
