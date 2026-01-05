/**
 * Diagnose Brevo API configuration
 */

require('dotenv').config();
const brevo = require('@getbrevo/brevo');

console.log('\n🔍 Brevo API Diagnostic Tool\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n1️⃣ Environment Variables:');
console.log(`   BREVO_API_KEY: ${process.env.BREVO_API_KEY ? '✅ Set (length: ' + process.env.BREVO_API_KEY.length + ')' : '❌ Not set'}`);
console.log(`   BREVO_SENDER_EMAIL: ${process.env.BREVO_SENDER_EMAIL ? '✅ ' + process.env.BREVO_SENDER_EMAIL : '❌ Not set'}`);
console.log(`   BREVO_SENDER_NAME: ${process.env.BREVO_SENDER_NAME || '⚠️  Not set (will use default)'}`);

if (!process.env.BREVO_API_KEY) {
    console.log('\n❌ BREVO_API_KEY is not set!');
    console.log('\nPlease add to your .env file:');
    console.log('BREVO_API_KEY=xkeysib-your-api-key-here');
    process.exit(1);
}

// Check API key format
console.log('\n2️⃣ API Key Format:');
if (process.env.BREVO_API_KEY.startsWith('xkeysib-')) {
    console.log('   ✅ API key has correct prefix (xkeysib-)');
} else {
    console.log('   ⚠️  API key does not start with "xkeysib-"');
    console.log('   This might not be a valid Brevo API key');
}

// Test API connection
console.log('\n3️⃣ Testing API Connection:');

const testAPI = async () => {
    try {
        const apiInstance = new brevo.AccountApi();
        const apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        console.log('   Attempting to fetch account info...');
        const accountInfo = await apiInstance.getAccount();

        console.log('   ✅ API connection successful!');
        console.log('\n4️⃣ Account Information:');
        console.log(`   Email: ${accountInfo.email}`);
        console.log(`   First Name: ${accountInfo.firstName || 'N/A'}`);
        console.log(`   Last Name: ${accountInfo.lastName || 'N/A'}`);
        console.log(`   Company: ${accountInfo.companyName || 'N/A'}`);

        if (accountInfo.plan && accountInfo.plan.length > 0) {
            console.log(`   Plan: ${accountInfo.plan[0].type || 'Free'}`);
            if (accountInfo.plan[0].credits) {
                console.log(`   Email Credits: ${accountInfo.plan[0].credits}`);
            }
        }

        // Check senders
        console.log('\n5️⃣ Checking Sender Configuration:');
        const sendersApi = new brevo.SendersApi();
        const sendersApiKey = sendersApi.authentications['apiKey'];
        sendersApiKey.apiKey = process.env.BREVO_API_KEY;

        try {
            const senders = await sendersApi.getSenders();

            if (senders.senders && senders.senders.length > 0) {
                console.log(`   Found ${senders.senders.length} sender(s):`);
                senders.senders.forEach((sender, index) => {
                    const isConfigured = sender.email === process.env.BREVO_SENDER_EMAIL;
                    const status = sender.active ? '✅ Active' : '❌ Inactive';
                    console.log(`   ${index + 1}. ${sender.email} - ${status}${isConfigured ? ' (CONFIGURED)' : ''}`);
                });

                // Check if configured sender exists
                const configuredSender = senders.senders.find(s => s.email === process.env.BREVO_SENDER_EMAIL);
                if (configuredSender) {
                    if (configuredSender.active) {
                        console.log(`\n   ✅ Your configured sender (${process.env.BREVO_SENDER_EMAIL}) is active!`);
                    } else {
                        console.log(`\n   ⚠️  Your configured sender (${process.env.BREVO_SENDER_EMAIL}) is INACTIVE!`);
                        console.log('   Please verify it in Brevo dashboard');
                    }
                } else {
                    console.log(`\n   ⚠️  Your configured sender (${process.env.BREVO_SENDER_EMAIL}) is NOT in the list!`);
                    console.log('   Please add and verify it at: https://app.brevo.com/settings/senders');
                }
            } else {
                console.log('   ⚠️  No senders configured in your Brevo account');
                console.log('   Please add a sender at: https://app.brevo.com/settings/senders');
            }
        } catch (error) {
            console.log('   ⚠️  Could not fetch senders:', error.message);
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Diagnostic Complete!\n');
        console.log('📝 Summary:');
        console.log('   - API key is valid and working');
        console.log('   - Account is accessible');
        console.log('   - Check sender configuration above\n');

    } catch (error) {
        console.log('   ❌ API connection FAILED!');
        console.log(`\n   Error: ${error.message}`);

        if (error.response && error.response.body) {
            console.log('\n   Error Details:');
            console.log(JSON.stringify(error.response.body, null, 2));
        }

        console.log('\n' + '='.repeat(50));
        console.log('❌ Diagnostic Failed!\n');
        console.log('🔧 Possible Issues:');
        console.log('   1. Invalid API key - check BREVO_API_KEY in .env');
        console.log('   2. API key has been revoked or expired');
        console.log('   3. Network connectivity issues');
        console.log('\n💡 Solutions:');
        console.log('   1. Generate a new API key at: https://app.brevo.com/settings/keys/api');
        console.log('   2. Make sure you copied the entire key (starts with xkeysib-)');
        console.log('   3. Check your internet connection\n');
    }
};

testAPI();
