require('dotenv').config();
const axios = require('axios');

async function testCompleteLoginFlow() {
    try {
        console.log('🧪 Testing Complete Login Flow\n');

        // Step 1: Login
        console.log('Step 1: Attempting login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            employeeId: 'FAC001',
            password: 'password123'
        });

        console.log('✅ Login successful!');
        console.log('   Token:', loginResponse.data.token ? 'Received' : 'Missing');
        console.log('   User:', loginResponse.data.data.name);
        console.log('   Role:', loginResponse.data.data.role);

        const token = loginResponse.data.token;

        if (!token) {
            console.log('❌ No token received from login!');
            return;
        }

        // Step 2: Test /api/auth/me
        console.log('\nStep 2: Testing /api/auth/me...');
        const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ /api/auth/me successful!');
        console.log('   User:', meResponse.data.data.name);
        console.log('   Role:', meResponse.data.data.role);

        // Step 3: Test /api/faculty/dashboard
        console.log('\nStep 3: Testing /api/faculty/dashboard...');
        const dashboardResponse = await axios.get('http://localhost:5000/api/faculty/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ /api/faculty/dashboard successful!');
        console.log('   Total Duties:', dashboardResponse.data.data.statistics.totalDuties);
        console.log('   Total Hours:', dashboardResponse.data.data.statistics.totalHours);

        console.log('\n🎉 All tests passed! The backend is working correctly.');
        console.log('\n📝 Summary:');
        console.log('   ✅ Login works');
        console.log('   ✅ Token is valid');
        console.log('   ✅ Auth middleware works');
        console.log('   ✅ Faculty routes work');

    } catch (error) {
        console.error('\n❌ Test failed!');
        console.error('   Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        console.error('\n   Full error:', error);
    }
}

testCompleteLoginFlow();
