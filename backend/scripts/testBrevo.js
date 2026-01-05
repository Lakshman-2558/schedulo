/**
 * Quick Brevo API test
 */

require('dotenv').config();

console.log('\n🔍 Checking Brevo Configuration...\n');

console.log('Environment Variables:');
console.log(`  BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set (' + process.env.BREVO_API_KEY.substring(0, 20) + '...)' : '❌ Not set'}`);
console.log(`  BREVO_SENDER_EMAIL: ${process.env.BREVO_SENDER_EMAIL ? '✅ ' + process.env.BREVO_SENDER_EMAIL : '❌ Not set'}`);
console.log(`  BREVO_SENDER_NAME: ${process.env.BREVO_SENDER_NAME || 'Schedulo (default)'}`);

if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.log('\n❌ Missing required Brevo credentials!');
    console.log('\nPlease add to your .env file:');
    console.log('BREVO_API_KEY=your_api_key_here');
    console.log('BREVO_SENDER_EMAIL=your_verified_email@domain.com');
    console.log('BREVO_SENDER_NAME=Schedulo');
    process.exit(1);
}

console.log('\n✅ Brevo credentials are configured!\n');

// Test Brevo API
const brevo = require('@getbrevo/brevo');

console.log('🔍 Testing Brevo API connection...\n');

const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Try to send a test email
const testEmail = async () => {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'Schedulo',
            email: process.env.BREVO_SENDER_EMAIL
        };

        sendSmtpEmail.to = [{ email: process.argv[2] || 'test@example.com' }];
        sendSmtpEmail.subject = 'Brevo API Test';
        sendSmtpEmail.htmlContent = '<h1>Test Email</h1><p>If you received this, Brevo API is working!</p>';

        console.log(`📤 Sending test email to: ${process.argv[2] || 'test@example.com'}`);
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('\n✅ SUCCESS! Email sent successfully!');
        console.log(`   Message ID: ${response.messageId}`);
        console.log('\n📬 Check your inbox (and spam folder)');
        console.log('💡 View logs at: https://app.brevo.com/statistics/logs\n');
    } catch (error) {
        console.log('\n❌ ERROR sending email:');
        console.log(`   ${error.message}`);

        if (error.response && error.response.body) {
            console.log('\n📋 Error details:');
            console.log(JSON.stringify(error.response.body, null, 2));
        }

        console.log('\n💡 Common issues:');
        console.log('   1. Invalid API key - check BREVO_API_KEY');
        console.log('   2. Sender email not verified - verify at https://app.brevo.com/settings/senders');
        console.log('   3. Daily limit exceeded (300 emails/day on free tier)');
        console.log('\n📚 See BREVO_SETUP_GUIDE.md for help\n');
    }
};

testEmail();
