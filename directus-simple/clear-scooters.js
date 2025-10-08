const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

let authToken = '';

async function authenticate() {
  console.log('🔐 Аутентификация...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: EMAIL,
    password: PASSWORD
  });
  authToken = response.data.data.access_token;
  console.log('✓ Аутентификация успешна\n');
}

async function clearScooters() {
  try {
    await authenticate();
    
    // Получаем все скутеры
    console.log('📋 Получение списка скутеров...');
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const scooters = response.data.data;
    console.log(`✓ Найдено скутеров: ${scooters.length}\n`);
    
    if (scooters.length === 0) {
      console.log('✓ Таблица уже пуста\n');
      return;
    }
    
    // Удаляем каждый скутер
    console.log('🗑️  Удаление скутеров...\n');
    for (let i = 0; i < scooters.length; i++) {
      const scooter = scooters[i];
      console.log(`[${i + 1}/${scooters.length}] Удаление скутера ID: ${scooter.id}`);
      
      try {
        await axios.delete(
          `${DIRECTUS_URL}/items/scooters/${scooter.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        console.log(`  ✓ Удален`);
      } catch (error) {
        console.log(`  ✗ Ошибка: ${error.message}`);
      }
    }
    
    console.log('\n✅ Очистка завершена!\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
  }
}

clearScooters();

