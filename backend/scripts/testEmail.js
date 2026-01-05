/**
 * Test email sending functionality using Brevo API
 * Usage: node scripts/testEmail.js <email_address>
 */

const brevo = require('@getbrevo/brevo');
require('dotenv').config();

const testEmail = async (testEmailAddress) => {
  try {
    // Check if Brevo is configured
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
      console.error('❌ Brevo email service not configured!');
      console.error('Missing environment variables:');
      if (!process.env.BREVO_API_KEY) console.error('  - BREVO_API_KEY');
      if (!process.env.BREVO_SENDER_EMAIL) console.error('  - BREVO_SENDER_EMAIL');
      console.error('\nPlease configure Brevo settings in .env file');
      console.error('\nHow to get Brevo credentials:');
      console.error('1. Sign up at https://www.brevo.com');
      console.error('2. Go to Settings → SMTP & API → API Keys');
      console.error('3. Generate a new API key');
      console.error('4. Add and verify your sender email');
      process.exit(1);
    }

    console.log('\n📧 Brevo Email Configuration:');
    console.log(`   API Key: ${process.env.BREVO_API_KEY.substring(0, 20)}...`);
    console.log(`   Sender: ${process.env.BREVO_SENDER_EMAIL}`);
    console.log(`   Sender Name: ${process.env.BREVO_SENDER_NAME || 'Schedulo'}`);
    console.log(`   To: ${testEmailAddress}\n`);

    // Initialize Brevo API
    console.log('🔍 Initializing Brevo API...');
    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    console.log('✅ Brevo API initialized!\n');

    // Prepare test email
    console.log(`📤 Sending test email to ${testEmailAddress}...`);

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Schedulo',
      email: process.env.BREVO_SENDER_EMAIL
    };

    sendSmtpEmail.to = [{ email: testEmailAddress }];
    sendSmtpEmail.subject = 'Test Email from Schedulo - Brevo API';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0;">✅ Test Email Successful!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Schedulo Email Service - Brevo API</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Email Configuration Test</h2>
          <p style="color: #374151;">This is a test email to verify that your Brevo API integration is configured correctly.</p>
          
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46;"><strong>✅ Brevo API is working correctly!</strong></p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
              You can now send allocation notifications to faculty members.
            </p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px;">
            <p style="margin: 0; color: #92400e;"><strong>📋 Configuration Details:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #78350f;">
              <li>Service: Brevo API (v3)</li>
              <li>Sender: ${process.env.BREVO_SENDER_EMAIL}</li>
              <li>Sender Name: ${process.env.BREVO_SENDER_NAME || 'Schedulo'}</li>
              <li>API Key: ${process.env.BREVO_API_KEY.substring(0, 20)}...</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>💡 Next Steps:</strong> If you received this email, your Brevo API integration is configured correctly. 
            You can now use the "Notify All" feature to send allocation notifications to faculty members.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 6px; border: 1px solid #bbf7d0;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            <strong>🎉 Benefits of Brevo API:</strong>
          </p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #15803d; font-size: 14px;">
            <li>300 emails/day on free tier</li>
            <li>Better deliverability (less spam)</li>
            <li>Email analytics and tracking</li>
            <li>Faster than SMTP</li>
            <li>Production-ready</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>This is an automated test email from Schedulo using Brevo API.</p>
          <p style="margin-top: 10px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    // Send email via Brevo API
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${response.messageId}`);
    console.log('\n📬 Please check the inbox (and spam folder) of the recipient email address.');
    console.log('\n💡 You can also check the Brevo dashboard for delivery logs:');
    console.log('   https://app.brevo.com/statistics/logs\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error sending test email:');
    console.error(`   ${error.message}\n`);

    if (error.response && error.response.body) {
      console.error('⚠️  Brevo API Error Details:');
      console.error(`   ${JSON.stringify(error.response.body, null, 2)}\n`);
    }

    if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
      console.error('⚠️  Authentication failed!');
      console.error('   - Check BREVO_API_KEY in .env');
      console.error('   - Make sure the API key is correct and active');
      console.error('   - Generate a new key at: https://app.brevo.com/settings/keys/api\n');
    } else if (error.message.includes('sender')) {
      console.error('⚠️  Sender email issue!');
      console.error('   - Check BREVO_SENDER_EMAIL in .env');
      console.error('   - Make sure the sender email is verified in Brevo');
      console.error('   - Verify sender at: https://app.brevo.com/settings/senders\n');
    } else if (error.message.includes('recipient') || error.message.includes('invalid email')) {
      console.error('⚠️  Invalid recipient email address!');
      console.error(`   - Check the email address: ${testEmailAddress}\n`);
    }

    console.error('📚 For more help, see: BREVO_SETUP_GUIDE.md\n');

    process.exit(1);
  }
};

// Get email address from command line argument
const emailAddress = process.argv[2];

if (!emailAddress) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node scripts/testEmail.js <email_address>');
  console.error('Example: node scripts/testEmail.js test@example.com\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailAddress)) {
  console.error(`❌ Invalid email address: ${emailAddress}`);
  console.error('Please provide a valid email address\n');
  process.exit(1);
}

testEmail(emailAddress);
