import axios from 'axios';
const BASE = 'https://8adc1d77b55f.ngrok-free.app';

async function generateQuiz() {
  try {
    const res = await axios.post(`${BASE}/`, { id: 'v6_5i1yfr' }, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      timeout: 15000,
    });
    console.log('✅', res.data);
  } catch (e) {
    console.error('❌', e.response?.status, e.response?.data || e.message);
  }
}
generateQuiz();
