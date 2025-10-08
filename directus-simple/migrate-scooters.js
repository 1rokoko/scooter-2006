const axios = require('axios');
const fs = require('fs');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

let authToken = '';

// Маппинг полей из Google Sheets в Directus
const FIELD_MAPPING = {
  // Базовая информация
  'Power': 'power',
  'Model': 'model',
  'Year': 'year',
  'цвет': 'color',
  'номер скутера  (старый)': 'scooter_number_old',
  'номер скутера  ': 'scooter_number_old', // альтернативное название
  'наклейка': 'sticker',
  'наклейка о аренде': 'rental_sticker',
  
  // Текущая аренда
  'имя клиента': 'client_name',
  'номер клиента': 'client_phone',
  'начало аренды': 'rental_start',
  'конец аренды': 'rental_end',
  
  // Обслуживание двигателя
  'дата замены': 'oil_change_date',
  'масло движ  км ': 'oil_change_km',
  'gear oil ': 'gear_oil_km',
  'вода радиатор': 'radiator_water_date',
  'воздушный фильрт  км ': 'air_filter_km',
  'свечи  км ': 'spark_plugs_km',
  
  // Тормоза
  'тормоза передние км ': 'front_brakes_km',
  'тормоза  задние км ': 'rear_brakes_km',
  'задний диск надо менять. чтоб задний тормоз не скрипел. но вроде не скрипит ': 'rear_disc_note',
  
  // Документы
  'тех талон дата': 'tech_passport_date',
  'страховка  дата': 'insurance_date',
  
  // Компоненты
  'прикуриватель': 'cigarette_lighter',
  'передний подшипник': 'front_bearing',
  'задний подшипник': 'rear_bearing',
  'резина передняя': 'front_tire',
  'резина задняя': 'rear_tire',
  'батарея': 'battery',
  'ремень': 'belt',
  'стартер': 'starter',
  'прокладка ': 'gasket',
  'вода ': 'water',
  'sinotrack gps ': 'sinotrack_gps',
  
  // Фото
  'главное фото': 'main_photo',
  'ссылка на фото': 'photo_link',
  
  // Цены
  'Price': 'price',
  '1 year rent': 'price_1_year_rent',
  '6 month hight season': 'price_6_month_high_season',
  '6 month low season': 'price_6_month_low_season',
  '1-3 days': 'price_1_3_days',
  '4-7 days': 'price_4_7_days',
  '7-14 days': 'price_7_14_days',
  '15-25 day': 'price_15_25_days',
  'December': 'price_december',
  'January': 'price_january',
  'February': 'price_february',
  'March ': 'price_march',
  'April': 'price_april',
  'May': 'price_may',
  'Summer ': 'price_summer',
  'September ': 'price_september',
  'October ': 'price_october',
  'November ': 'price_november'
};

// Аутентификация
async function authenticate() {
  console.log('🔐 Аутентификация в Directus...');
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: EMAIL,
    password: PASSWORD
  });
  authToken = response.data.data.access_token;
  console.log('✓ Аутентификация успешна\n');
  return authToken;
}

// Функция для парсинга даты
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;

  // Убираем лишние пробелы
  dateStr = dateStr.trim();

  // Пропускаем явно невалидные значения (просто числа без точек)
  if (/^\d+$/.test(dateStr) && dateStr.length < 4) {
    return null; // Это просто число, не дата
  }

  // Формат DD.MM.YYYY
  const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Формат DD.MM.YY
  const ddmmyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Если не удалось распарсить, возвращаем null
  return null;
}

// Функция для парсинга числа
function parseNumber(numStr) {
  if (!numStr || numStr.trim() === '') return null;
  const num = parseFloat(numStr.replace(',', '.'));
  return isNaN(num) ? null : num;
}

// Функция для парсинга булевого значения
function parseBoolean(boolStr) {
  if (!boolStr || boolStr.trim() === '') return false;
  const str = boolStr.toLowerCase().trim();
  return str === 'да' || str === 'yes' || str === 'true' || str === '1';
}

// Функция для определения статуса скутера
function determineStatus(scooter) {
  // Если есть имя клиента и начало аренды - скутер в аренде
  if (scooter.client_name && scooter.client_name.trim() && 
      scooter.rental_start && scooter.rental_start.trim()) {
    return 'В аренде';
  }
  // По умолчанию - доступен
  return 'Доступен';
}

// Трансформация данных из Google Sheets в формат Directus
function transformScooter(googleScooter) {
  const directusScooter = {};
  
  // Маппинг полей
  for (const [googleField, directusField] of Object.entries(FIELD_MAPPING)) {
    const value = googleScooter[googleField];

    if (value && value.trim()) {
      // Специальная обработка для разных типов полей
      // Поля с датами (включая rental_start и rental_end)
      if (directusField.includes('date') || directusField === 'rental_start' || directusField === 'rental_end') {
        const parsedDate = parseDate(value);
        if (parsedDate) {
          directusScooter[directusField] = parsedDate;
        }
        // Если дата не распарсилась, просто пропускаем это поле
      } else if (directusField.includes('km') || directusField.includes('price') || directusField === 'year') {
        const parsedNumber = parseNumber(value);
        if (parsedNumber !== null) {
          directusScooter[directusField] = parsedNumber;
        }
      } else if (directusField === 'cigarette_lighter') {
        directusScooter[directusField] = parseBoolean(value);
      } else {
        directusScooter[directusField] = value.trim();
      }
    }
  }
  
  // Определяем статус
  directusScooter.status = determineStatus(directusScooter);
  
  // Убираем null значения
  Object.keys(directusScooter).forEach(key => {
    if (directusScooter[key] === null || directusScooter[key] === undefined) {
      delete directusScooter[key];
    }
  });
  
  return directusScooter;
}

// Валидация данных скутера
function validateScooter(scooter, index) {
  const errors = [];

  // Проверка обязательных полей - ТОЛЬКО номер скутера обязателен
  if (!scooter.scooter_number_old) {
    errors.push('Отсутствует номер скутера');
  }

  // Model и year делаем необязательными - импортируем все скутеры
  // if (!scooter.model) {
  //   errors.push('Отсутствует модель');
  // }

  // if (!scooter.year) {
  //   errors.push('Отсутствует год выпуска');
  // }

  return {
    valid: errors.length === 0,
    errors,
    scooter,
    index
  };
}

// Импорт скутера в Directus
async function importScooter(scooter, index) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/items/scooters`,
      scooter,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    return {
      success: true,
      index,
      scooter_number: scooter.scooter_number_old,
      id: response.data.data.id
    };
  } catch (error) {
    return {
      success: false,
      index,
      scooter_number: scooter.scooter_number_old,
      error: error.response?.data?.errors || error.message
    };
  }
}

// Получение текущих скутеров из Directus
async function getCurrentScooters() {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/items/scooters?limit=-1`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Ошибка получения текущих скутеров:', error.message);
    return [];
  }
}

// Главная функция миграции
async function migrate() {
  console.log('🚀 НАЧАЛО МИГРАЦИИ ДАННЫХ\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Аутентификация
    await authenticate();

    // Загрузка данных из JSON
    console.log('📂 Загрузка данных из scooters-data.json...');
    const scootersData = JSON.parse(fs.readFileSync('scooters-data.json', 'utf8'));
    console.log(`✓ Загружено записей: ${scootersData.length}\n`);

    // НЕ пропускаем первую запись - analyze-google-sheets.js уже отфильтровал заголовки
    const actualScooters = scootersData;
    console.log(`📊 Скутеров для импорта: ${actualScooters.length}\n`);

    // Трансформация данных
    console.log('🔄 Трансформация данных...');
    const transformedScooters = actualScooters.map(transformScooter);
    console.log(`✓ Трансформировано: ${transformedScooters.length}\n`);

    // Валидация
    console.log('✅ Валидация данных...');
    const validationResults = transformedScooters.map((s, i) => validateScooter(s, i));
    const validScooters = validationResults.filter(r => r.valid);
    const invalidScooters = validationResults.filter(r => !r.valid);

    console.log(`✓ Валидных записей: ${validScooters.length}`);
    console.log(`✗ Невалидных записей: ${invalidScooters.length}\n`);

    if (invalidScooters.length > 0) {
      console.log('⚠️  НЕВАЛИДНЫЕ ЗАПИСИ:\n');
      invalidScooters.forEach(result => {
        console.log(`  Запись ${result.index + 1}:`);
        result.errors.forEach(err => console.log(`    - ${err}`));
        console.log('');
      });
    }

    // Получаем текущие скутеры
    console.log('📋 Проверка существующих скутеров в Directus...');
    const currentScooters = await getCurrentScooters();
    console.log(`✓ Найдено существующих скутеров: ${currentScooters.length}\n`);

    // Импорт
    console.log('📥 НАЧАЛО ИМПОРТА\n');
    console.log('-'.repeat(60) + '\n');

    const importResults = {
      success: [],
      failed: [],
      skipped: []
    };

    for (let i = 0; i < validScooters.length; i++) {
      const validation = validScooters[i];
      const scooter = validation.scooter;
      const index = validation.index;

      console.log(`[${i + 1}/${validScooters.length}] Импорт скутера: ${scooter.scooter_number_old || 'N/A'}`);

      const result = await importScooter(scooter, index);

      if (result.success) {
        console.log(`  ✓ Успешно импортирован (ID: ${result.id})`);
        importResults.success.push(result);
      } else {
        console.log(`  ✗ Ошибка: ${JSON.stringify(result.error)}`);
        importResults.failed.push(result);
      }

      console.log('');
    }

    // Сохранение результатов
    const report = {
      timestamp: new Date().toISOString(),
      source: {
        total: scootersData.length,
        actual: actualScooters.length
      },
      validation: {
        valid: validScooters.length,
        invalid: invalidScooters.length,
        invalidRecords: invalidScooters
      },
      import: {
        success: importResults.success.length,
        failed: importResults.failed.length,
        successRecords: importResults.success,
        failedRecords: importResults.failed
      },
      directus: {
        beforeImport: currentScooters.length,
        afterImport: currentScooters.length + importResults.success.length
      }
    };

    fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2), 'utf8');

    // Итоговый отчет
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВЫЙ ОТЧЕТ МИГРАЦИИ');
    console.log('='.repeat(60) + '\n');
    console.log(`Источник (Google Sheets):`);
    console.log(`  Всего записей: ${scootersData.length}`);
    console.log(`  Скутеров для импорта: ${actualScooters.length}\n`);
    console.log(`Валидация:`);
    console.log(`  ✓ Валидных: ${validScooters.length}`);
    console.log(`  ✗ Невалидных: ${invalidScooters.length}\n`);
    console.log(`Импорт:`);
    console.log(`  ✓ Успешно: ${importResults.success.length}`);
    console.log(`  ✗ Ошибок: ${importResults.failed.length}\n`);
    console.log(`Directus:`);
    console.log(`  До импорта: ${currentScooters.length}`);
    console.log(`  После импорта: ${currentScooters.length + importResults.success.length}\n`);
    console.log(`📄 Детальный отчет сохранен в migration-report.json\n`);

    return report;

  } catch (error) {
    console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
    throw error;
  }
}

// Запуск миграции
migrate().catch(console.error);

