const fs = require('fs');

// Загружаем данные
const scootersData = JSON.parse(fs.readFileSync('scooters-data.json', 'utf8'));

// Берем первый скутер (индекс 1, так как 0 - заголовки)
const firstScooter = scootersData[1];

console.log('ПЕРВЫЙ СКУТЕР ИЗ JSON:\n');
console.log(JSON.stringify(firstScooter, null, 2));

console.log('\n\nПОЛЕ rental_start:');
console.log('Значение:', firstScooter['начало аренды']);
console.log('Тип:', typeof firstScooter['начало аренды']);
console.log('Длина:', firstScooter['начало аренды']?.length);

// Проверяем парсинг даты
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  dateStr = dateStr.trim();
  
  // Пропускаем явно невалидные значения (просто числа без точек)
  if (/^\d+$/.test(dateStr) && dateStr.length < 4) {
    console.log(`  -> Пропущено (просто число): "${dateStr}"`);
    return null;
  }
  
  // Формат DD.MM.YYYY
  const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log(`  -> Распарсено DD.MM.YYYY: "${result}"`);
    return result;
  }
  
  // Формат DD.MM.YY
  const ddmmyyMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    const result = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log(`  -> Распарсено DD.MM.YY: "${result}"`);
    return result;
  }
  
  console.log(`  -> Не удалось распарсить: "${dateStr}"`);
  return null;
}

console.log('\n\nТЕСТ ПАРСИНГА:');
const testDate = parseDate(firstScooter['начало аренды']);
console.log('Результат parseDate:', testDate);

// Теперь протестируем полную трансформацию
const FIELD_MAPPING = {
  'Power': 'power',
  'Model': 'model',
  'Year': 'year',
  'цвет': 'color',
  'номер скутера  (старый)': 'scooter_number_old',
  'наклейка': 'sticker',
  'наклейка о аренде': 'rental_sticker',
  'имя клиента': 'client_name',
  'номер клиента': 'client_phone',
  'начало аренды': 'rental_start',
  'конец аренды': 'rental_end',
  'дата замены': 'oil_change_date',
  'масло движ  км ': 'oil_change_km',
  'gear oil ': 'gear_oil_km',
  'вода радиатор': 'radiator_water_date',
  'воздушный фильрт  км ': 'air_filter_km',
  'свечи  км ': 'spark_plugs_km',
  'тормоза передние км ': 'front_brakes_km',
  'тормоза  задние км ': 'rear_brakes_km',
  'тех талон дата': 'tech_passport_date',
  'страховка  дата': 'insurance_date',
  'прикуриватель': 'cigarette_lighter',
  'батарея': 'battery',
  'главное фото': 'main_photo',
  'ссылка на фото': 'photo_link',
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

function parseNumber(numStr) {
  if (!numStr || numStr.trim() === '') return null;
  const num = parseFloat(numStr.replace(',', '.'));
  return isNaN(num) ? null : num;
}

function parseBoolean(boolStr) {
  if (!boolStr || boolStr.trim() === '') return false;
  const str = boolStr.toLowerCase().trim();
  return str === 'да' || str === 'yes' || str === 'true' || str === '1';
}

function transformScooter(googleScooter) {
  const directusScooter = {};

  for (const [googleField, directusField] of Object.entries(FIELD_MAPPING)) {
    const value = googleScooter[googleField];

    if (value && value.trim()) {
      if (directusField.includes('date')) {
        const parsedDate = parseDate(value);
        if (parsedDate) {
          directusScooter[directusField] = parsedDate;
        }
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

  directusScooter.status = 'Доступен';

  Object.keys(directusScooter).forEach(key => {
    if (directusScooter[key] === null || directusScooter[key] === undefined) {
      delete directusScooter[key];
    }
  });

  return directusScooter;
}

console.log('\n\nТРАНСФОРМИРОВАННЫЙ СКУТЕР:');
const transformed = transformScooter(firstScooter);
console.log(JSON.stringify(transformed, null, 2));

console.log('\n\nЕСТЬ ЛИ rental_start В ТРАНСФОРМИРОВАННОМ?');
console.log('rental_start' in transformed);
console.log('Значение:', transformed.rental_start);

