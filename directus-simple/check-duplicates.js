const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

async function checkDuplicates() {
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
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 ПРОВЕРКА ДУБЛИКАТОВ НОМЕРОВ');
    console.log('='.repeat(70) + '\n');
    
    console.log(`Всего скутеров в Directus: ${scooters.length}\n`);
    
    // Подсчет номеров
    const numberCounts = {};
    scooters.forEach(s => {
      const number = s.scooter_number_old;
      if (number) {
        numberCounts[number] = (numberCounts[number] || 0) + 1;
      }
    });
    
    // Находим дубликаты
    const duplicates = Object.entries(numberCounts).filter(([num, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  НАЙДЕНЫ ДУБЛИКАТЫ (${duplicates.length}):\n`);
      duplicates.forEach(([number, count]) => {
        console.log(`  ${number}: ${count} раз(а)`);
        
        // Показываем ID скутеров с этим номером
        const scootersWithNumber = scooters.filter(s => s.scooter_number_old === number);
        scootersWithNumber.forEach(s => {
          console.log(`    - ID: ${s.id}, Model: ${s.model || 'N/A'}, Year: ${s.year || 'N/A'}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ Дубликатов не найдено!\n');
    }
    
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkDuplicates();

