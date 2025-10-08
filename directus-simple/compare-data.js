const axios = require('axios');
const fs = require('fs');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

let authToken = '';

async function authenticate() {
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: EMAIL,
    password: PASSWORD
  });
  authToken = response.data.data.access_token;
  return authToken;
}

async function compareData() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 СРАВНЕНИЕ ДАННЫХ: Google Sheets vs Directus');
  console.log('='.repeat(70) + '\n');
  
  try {
    await authenticate();
    
    // Загружаем исходные данные
    const sourceData = JSON.parse(fs.readFileSync('scooters-data.json', 'utf8'));
    
    // Получаем данные из Directus
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const directusScooters = response.data.data;
    
    console.log(`📊 ОБЩАЯ СТАТИСТИКА:\n`);
    console.log(`  Google Sheets: ${sourceData.length} записей`);
    console.log(`  Directus: ${directusScooters.length} записей`);
    console.log(`  Разница: ${sourceData.length - directusScooters.length}\n`);
    
    // Создаем детальное сравнение
    console.log('📋 ДЕТАЛЬНОЕ СРАВНЕНИЕ ПО СКУТЕРАМ:\n');
    
    const comparison = [];
    
    for (let i = 0; i < Math.min(10, directusScooters.length); i++) {
      const directusScooter = directusScooters[i];
      const sourceScooter = sourceData[i];
      
      console.log(`Скутер ${i + 1}:`);
      console.log(`  Directus ID: ${directusScooter.id}`);
      console.log(`  Номер (Directus): ${directusScooter.scooter_number_old || 'N/A'}`);
      console.log(`  Номер (Google): ${sourceScooter['номер скутера  (старый)'] || sourceScooter['номер скутера  '] || 'N/A'}`);
      console.log(`  Модель (Directus): ${directusScooter.model || 'N/A'}`);
      console.log(`  Модель (Google): ${sourceScooter['Model'] || 'N/A'}`);
      console.log(`  Год (Directus): ${directusScooter.year || 'N/A'}`);
      console.log(`  Год (Google): ${sourceScooter['Year'] || 'N/A'}`);
      console.log(`  Цвет (Directus): ${directusScooter.color || 'N/A'}`);
      console.log(`  Цвет (Google): ${sourceScooter['цвет'] || 'N/A'}`);
      console.log('');
      
      comparison.push({
        index: i,
        directus: {
          id: directusScooter.id,
          number: directusScooter.scooter_number_old,
          model: directusScooter.model,
          year: directusScooter.year,
          color: directusScooter.color
        },
        google: {
          number: sourceScooter['номер скутера  (старый)'] || sourceScooter['номер скутера  '],
          model: sourceScooter['Model'],
          year: sourceScooter['Year'],
          color: sourceScooter['цвет']
        }
      });
    }
    
    // Проверка полноты данных
    console.log('✅ ПРОВЕРКА ПОЛНОТЫ ИМПОРТА:\n');
    
    const googleNumbers = sourceData
      .map(s => s['номер скутера  (старый)'] || s['номер скутера  '])
      .filter(n => n && n.trim());
    
    const directusNumbers = directusScooters
      .map(s => s.scooter_number_old)
      .filter(n => n);
    
    console.log(`  Номеров в Google Sheets: ${googleNumbers.length}`);
    console.log(`  Номеров в Directus: ${directusNumbers.length}\n`);
    
    // Проверяем, какие номера отсутствуют
    const missingInDirectus = googleNumbers.filter(gn => 
      !directusNumbers.some(dn => dn.includes(gn) || gn.includes(dn))
    );
    
    if (missingInDirectus.length > 0) {
      console.log(`  ⚠️  Отсутствуют в Directus (${missingInDirectus.length}):`);
      missingInDirectus.forEach(num => console.log(`    - ${num}`));
    } else {
      console.log(`  ✓ Все номера из Google Sheets присутствуют в Directus`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ СРАВНЕНИЕ ЗАВЕРШЕНО');
    console.log('='.repeat(70) + '\n');
    
    // Сохраняем отчет
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        googleSheets: sourceData.length,
        directus: directusScooters.length,
        difference: sourceData.length - directusScooters.length
      },
      comparison: comparison,
      missingInDirectus: missingInDirectus
    };
    
    fs.writeFileSync('comparison-report.json', JSON.stringify(report, null, 2), 'utf8');
    console.log('📄 Отчет сохранен в comparison-report.json\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
  }
}

compareData();

