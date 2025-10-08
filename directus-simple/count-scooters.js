const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

async function countScooters() {
  try {
    // Аутентификация
    const authResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    const authToken = authResponse.data.data.access_token;
    
    // Получение скутеров
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const scooters = response.data.data;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 КОЛИЧЕСТВО СКУТЕРОВ В DIRECTUS');
    console.log('='.repeat(60));
    console.log(`\nВсего скутеров: ${scooters.length}\n`);
    
    // Показываем первые 5 номеров
    console.log('Первые 5 номеров:');
    scooters.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i+1}. ${s.scooter_number_old || 'NO NUMBER'} (ID: ${s.id})`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

countScooters();

