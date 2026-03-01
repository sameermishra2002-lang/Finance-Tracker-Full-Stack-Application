import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Login to get a token
const loginResponse = await api.post('/auth/login', {
  email: 'admin@example.com',
  password: 'password123'
});

console.log('Login Response:', loginResponse.data);

if (loginResponse.data.token) {
  const token = loginResponse.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Test monthly trend endpoint
  console.log('\nFetching monthly trend data...');
  const trendResponse = await api.get('/transactions/analytics/monthly-trend?year=2026');
  console.log('Monthly Trend Response:');
  console.log(JSON.stringify(trendResponse.data, null, 2));
}
