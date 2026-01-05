/**
 * Simple email test using the actual email service
 */

require('dotenv').config();
const emailService = require('../services/emailService');

const testEmail = async () => {
    const recipientEmail = process.argv[2] || 'lakshmankaja2558@gmail.com';

    console.log('\n📧 Testing Email Service...\n');
    console.log(`Sending test email to: ${recipientEmail}\n`);

    const subject = 'Test Email from Schedulo - Brevo API';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px; border-radius: 12px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Success!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Brevo API is working perfectly</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin-top: 20px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin-top: 0;">🎉 Email Service Test</h2>
        <p style="color: #374151; line-height: 1.6;">
          Congratulations! If you're reading this email, it means your Brevo API integration is configured correctly 
          and working as expected.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">✅ What's Working:</h3>
          <ul style="color: #374151; line-height: 1.8; margin: 10px 0;">
            <li>Brevo API authentication</li>
            <li>Email sending functionality</li>
            <li>HTML email templates</li>
            <li>Email service integration</li>
          </ul>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #bfdbfe;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 16px;">💡 Next Steps:</h3>
          <p style="color: #1e3a8a; margin: 0; line-height: 1.6;">
            Your email service is ready to send invigilation duty notifications to faculty members. 
            You can now use the "Notify All" feature in the admin dashboard.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">This is an automated test email from Schedulo</p>
          <p style="margin: 10px 0 0 0;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
      </div>
    </div>
  `;

    try {
        const result = await emailService.sendEmail(recipientEmail, subject, html);

        if (result.success) {
            console.log('✅ SUCCESS! Email sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
            console.log('\n📬 Check your inbox (and spam folder)');
            console.log('💡 View delivery logs: https://app.brevo.com/statistics/logs\n');
        } else {
            console.log('❌ FAILED to send email');
            console.log(`   Error: ${result.message}\n`);
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('\n📚 See BREVO_SETUP_GUIDE.md for troubleshooting\n');
    }
};

testEmail();
