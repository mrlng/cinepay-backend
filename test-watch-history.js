const axios = require('axios');

const BASE_URL = 'https://cinepay-backend-production.up.railway.app';

async function testWatchHistoryAPI() {
    try {
        console.log('🔐 Step 1: Login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'test@cinepay.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log('✅ Login successful!');
        console.log('Token:', token.substring(0, 20) + '...');
        console.log('User ID:', userId);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const movieId = '660e8400-e29b-41d4-a716-446655440001'; // Inception

        // Step 2: Get current progress
        console.log('\n📊 Step 2: Get current watch progress...');
        const getResponse = await axios.get(
            `${BASE_URL}/api/purchases/watch-history/${movieId}`,
            config
        );
        console.log('Current progress:', getResponse.data);

        // Step 3: Save progress
        console.log('\n💾 Step 3: Save watch progress (30 seconds)...');
        const saveResponse = await axios.post(
            `${BASE_URL}/api/purchases/watch-history`,
            {
                movie_id: movieId,
                progress_seconds: 30,
                total_duration: 8880
            },
            config
        );
        console.log('Save response:', saveResponse.data);

        // Step 4: Get progress again
        console.log('\n📊 Step 4: Get progress again (should show 30 seconds)...');
        const getResponse2 = await axios.get(
            `${BASE_URL}/api/purchases/watch-history/${movieId}`,
            config
        );
        console.log('Updated progress:', getResponse2.data);

        if (getResponse2.data.has_progress && getResponse2.data.progress_seconds === 30) {
            console.log('\n✅ ✅ ✅ BACKEND WORKS PERFECTLY! ✅ ✅ ✅');
            console.log('Problem is in Flutter app, not backend!');
        } else {
            console.log('\n❌ Backend issue detected!');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testWatchHistoryAPI();
