const axios = require('axios');
const fs = require('fs');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

async function listAllScooters() {
  try {
    // Аутентификация
    const authResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    const authToken = authResponse.data.data.access_token;
    
    // Получение скутеров
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1&sort=id`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const scooters = response.data.data;
    
    console.log('\n' + '='.repeat(70));
    console.log('📋 ВСЕ СКУТЕРЫ В DIRECTUS');
    console.log('='.repeat(70) + '\n');
    
    console.log(`Всего скутеров: ${scooters.length}\n`);
    
    scooters.forEach((s, i) => {
      console.log(`${i + 1}. ID: ${s.id}, Номер: ${s.scooter_number_old || 'N/A'}, Модель: ${s.model || 'N/A'}, Год: ${s.year || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    // Сохраняем в файл
    const report = {
      total: scooters.length,
      scooters: scooters.map(s => ({
        id: s.id,
        number: s.scooter_number_old,
        model: s.model,
        year: s.year
      }))
    };
    
    fs.writeFileSync('directus-scooters-list.json', JSON.stringify(report, null, 2), 'utf8');
    console.log('✓ Список сохранен в directus-scooters-list.json\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

listAllScooters();

