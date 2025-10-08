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

async function verifyMigration() {
  console.log('🔍 ВЕРИФИКАЦИЯ МИГРАЦИИ\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    await authenticate();
    
    // Загружаем отчет о миграции
    const report = JSON.parse(fs.readFileSync('migration-report.json', 'utf8'));
    
    // Получаем все скутеры из Directus
    console.log('📋 Получение скутеров из Directus...');
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const scooters = response.data.data;
    console.log(`✓ Получено скутеров: ${scooters.length}\n`);
    
    // Проверка 1: Количество записей
    console.log('✅ ПРОВЕРКА 1: Количество записей');
    console.log(`  Ожидалось: ${report.import.success}`);
    console.log(`  Фактически: ${scooters.length}`);
    const countMatch = scooters.length === report.import.success;
    console.log(`  Результат: ${countMatch ? '✓ СОВПАДАЕТ' : '✗ НЕ СОВПАДАЕТ'}\n`);
    
    // Проверка 2: Выборочная проверка данных
    console.log('✅ ПРОВЕРКА 2: Выборочная проверка данных\n');
    
    const samplesToCheck = Math.min(5, scooters.length);
    for (let i = 0; i < samplesToCheck; i++) {
      const scooter = scooters[i];
      console.log(`Скутер ${i + 1}/${samplesToCheck}:`);
      console.log(`  ID: ${scooter.id}`);
      console.log(`  Номер: ${scooter.scooter_number_old || 'N/A'}`);
      console.log(`  Модель: ${scooter.model || 'N/A'}`);
      console.log(`  Год: ${scooter.year || 'N/A'}`);
      console.log(`  Цвет: ${scooter.color || 'N/A'}`);
      console.log(`  Статус: ${scooter.status || 'N/A'}`);
      console.log(`  Цена (1 год): ${scooter.price_1_year_rent || 'N/A'}`);
      console.log('');
    }
    
    // Проверка 3: Обязательные поля
    console.log('✅ ПРОВЕРКА 3: Обязательные поля\n');
    
    let missingFields = 0;
    scooters.forEach((scooter, index) => {
      const errors = [];
      if (!scooter.scooter_number_old) errors.push('номер скутера');
      if (!scooter.model) errors.push('модель');
      if (!scooter.year) errors.push('год');
      
      if (errors.length > 0) {
        console.log(`  Скутер ID ${scooter.id}: отсутствуют поля: ${errors.join(', ')}`);
        missingFields++;
      }
    });
    
    if (missingFields === 0) {
      console.log('  ✓ Все обязательные поля заполнены\n');
    } else {
      console.log(`  ✗ Найдено ${missingFields} записей с отсутствующими полями\n`);
    }
    
    // Проверка 4: Уникальность номеров
    console.log('✅ ПРОВЕРКА 4: Уникальность номеров скутеров\n');
    
    const numbers = scooters.map(s => s.scooter_number_old).filter(n => n);
    const uniqueNumbers = new Set(numbers);
    const duplicates = numbers.length - uniqueNumbers.size;
    
    console.log(`  Всего номеров: ${numbers.length}`);
    console.log(`  Уникальных: ${uniqueNumbers.size}`);
    console.log(`  Дубликатов: ${duplicates}`);
    console.log(`  Результат: ${duplicates === 0 ? '✓ НЕТ ДУБЛИКАТОВ' : '✗ ЕСТЬ ДУБЛИКАТЫ'}\n`);
    
    // Проверка 5: Статистика по полям
    console.log('✅ ПРОВЕРКА 5: Статистика заполненности полей\n');
    
    const fieldStats = {
      power: 0,
      model: 0,
      year: 0,
      color: 0,
      client_name: 0,
      client_phone: 0,
      oil_change_date: 0,
      insurance_date: 0,
      main_photo: 0,
      price_1_year_rent: 0,
      price_6_month_high_season: 0,
      price_6_month_low_season: 0
    };
    
    scooters.forEach(scooter => {
      Object.keys(fieldStats).forEach(field => {
        if (scooter[field]) fieldStats[field]++;
      });
    });
    
    Object.entries(fieldStats).forEach(([field, count]) => {
      const percentage = ((count / scooters.length) * 100).toFixed(1);
      console.log(`  ${field}: ${count}/${scooters.length} (${percentage}%)`);
    });
    
    // Итоговый отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ ВЕРИФИКАЦИИ');
    console.log('='.repeat(60) + '\n');
    
    const allChecks = [
      { name: 'Количество записей', passed: countMatch },
      { name: 'Обязательные поля', passed: missingFields === 0 },
      { name: 'Уникальность номеров', passed: duplicates === 0 }
    ];
    
    const passedChecks = allChecks.filter(c => c.passed).length;
    const totalChecks = allChecks.length;
    
    console.log(`Проверок пройдено: ${passedChecks}/${totalChecks}\n`);
    
    allChecks.forEach(check => {
      console.log(`  ${check.passed ? '✓' : '✗'} ${check.name}`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    if (passedChecks === totalChecks) {
      console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!\n');
    } else {
      console.log('⚠️  НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ\n');
    }
    
    // Сохраняем отчет о верификации
    const verificationReport = {
      timestamp: new Date().toISOString(),
      totalScooters: scooters.length,
      expectedScooters: report.import.success,
      checks: allChecks,
      fieldStats,
      samples: scooters.slice(0, 5).map(s => ({
        id: s.id,
        scooter_number_old: s.scooter_number_old,
        model: s.model,
        year: s.year,
        color: s.color,
        status: s.status
      }))
    };
    
    fs.writeFileSync('verification-report.json', JSON.stringify(verificationReport, null, 2), 'utf8');
    console.log('📄 Отчет о верификации сохранен в verification-report.json\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
  }
}

verifyMigration();

