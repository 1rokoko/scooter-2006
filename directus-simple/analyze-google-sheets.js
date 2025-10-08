const fs = require('fs');
const axios = require('axios');

// Функция для скачивания CSV из Google Sheets
async function downloadCSV() {
  const url = 'https://docs.google.com/spreadsheets/d/1HyF7QIqmHNGFl8IFnhTgV7QLAhBO03pv2zLGTjQJzzk/export?format=csv&gid=214317830';
  
  console.log('📥 Скачивание данных из Google Sheets...\n');
  
  const response = await axios.get(url);
  const csvData = response.data;
  
  // Сохраняем CSV для анализа
  fs.writeFileSync('google-sheets-data.csv', csvData, 'utf8');
  console.log('✓ CSV данные сохранены в google-sheets-data.csv\n');
  
  return csvData;
}

// Функция для анализа структуры CSV
function analyzeCSV(csvData) {
  const lines = csvData.split('\n');
  
  console.log('📊 АНАЛИЗ СТРУКТУРЫ GOOGLE SHEETS:\n');
  console.log(`Всего строк в CSV: ${lines.length}\n`);
  
  // Анализируем первые несколько строк для понимания структуры
  console.log('Первые 10 строк CSV:\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const cells = lines[i].split(',');
    console.log(`Строка ${i + 1}: ${cells.length} колонок`);
    if (i < 3) {
      console.log(`  Первые 5 значений: ${cells.slice(0, 5).join(' | ')}`);
    }
  }
  
  // Парсим CSV построчно
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) {
      rows.push(lines[i].split(','));
    }
  }
  
  console.log(`\n📋 Обработано строк: ${rows.length}\n`);
  
  // Определяем структуру данных
  // В этом CSV особая структура - данные идут вертикально по парам колонок
  console.log('🔍 АНАЛИЗ СТРУКТУРЫ ДАННЫХ:\n');
  
  // Находим строку с "Power" - это начало данных
  let powerRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'Power') {
      powerRowIndex = i;
      break;
    }
  }
  
  if (powerRowIndex === -1) {
    console.log('❌ Не найдена строка с "Power"');
    return;
  }
  
  console.log(`✓ Строка с "Power" найдена на позиции ${powerRowIndex + 1}\n`);
  
  // Подсчитываем количество скутеров (пар колонок)
  const powerRow = rows[powerRowIndex];
  let scooterCount = 0;
  for (let i = 0; i < powerRow.length; i++) {
    if (powerRow[i] && powerRow[i].trim()) {
      scooterCount++;
    }
  }
  
  console.log(`🛵 Количество скутеров в таблице: ${scooterCount}\n`);
  
  // Анализируем поля
  console.log('📝 ПОЛЯ В GOOGLE SHEETS:\n');
  const fieldNames = [];
  for (let i = powerRowIndex; i < Math.min(powerRowIndex + 50, rows.length); i++) {
    const fieldName = rows[i][0];
    if (fieldName && fieldName.trim() && !fieldName.startsWith('b')) {
      fieldNames.push(fieldName);
      console.log(`  - ${fieldName}`);
    }
  }
  
  console.log(`\nВсего полей: ${fieldNames.length}\n`);
  
  return {
    totalRows: rows.length,
    scooterCount,
    fieldNames,
    powerRowIndex,
    rows
  };
}

// Функция для извлечения данных скутеров
function extractScooters(analysisResult) {
  const { rows, powerRowIndex, scooterCount } = analysisResult;

  console.log('\n🔄 ИЗВЛЕЧЕНИЕ ДАННЫХ СКУТЕРОВ:\n');

  const scooters = [];
  const powerRow = rows[powerRowIndex];

  // Ищем строку с номерами скутеров
  let scooterNumberRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0];
    if (firstCell && (firstCell.includes('номер скутера') || firstCell === 'номер скутера  (старый)' || firstCell === 'номер скутера  ')) {
      scooterNumberRowIndex = i;
      break;
    }
  }

  console.log(`Строка с номерами скутеров: ${scooterNumberRowIndex}\n`);

  // Определяем индексы колонок для каждого скутера
  // Ищем ВСЕ колонки где есть номер скутера (не пустые значения)
  const scooterColumns = [];
  const scooterNumberRow = rows[scooterNumberRowIndex];

  for (let i = 1; i < scooterNumberRow.length; i++) {
    const value = scooterNumberRow[i];
    // Если в этой колонке есть номер скутера (не пустое значение и не название поля)
    if (value && value.trim() &&
        value !== 'номер скутера  (старый)' &&
        value !== 'номер скутера  ' &&
        value !== 'номер скутера') {
      scooterColumns.push(i);
    }
  }

  console.log(`Найдено колонок со скутерами: ${scooterColumns.length}\n`);
  console.log('Первые 10 номеров:', scooterColumns.slice(0, 10).map(i => scooterNumberRow[i]).join(', '));

  // Извлекаем данные для каждого скутера
  for (let colIndex of scooterColumns) {
    const scooter = {};

    // Проходим по всем строкам и собираем данные
    for (let rowIndex = powerRowIndex; rowIndex < rows.length; rowIndex++) {
      const fieldName = rows[rowIndex][0];
      const value = rows[rowIndex][colIndex];

      if (fieldName && fieldName.trim() && !fieldName.startsWith('b')) {
        scooter[fieldName] = value || '';
      }
    }

    // Пропускаем записи где номер скутера = "номер скутера" (это заголовки)
    const scooterNumber = scooter['номер скутера  (старый)'] || scooter['номер скутера  '];
    if (scooterNumber &&
        scooterNumber.trim() &&
        scooterNumber !== 'номер скутера  (старый)' &&
        scooterNumber !== 'номер скутера  ' &&
        scooterNumber !== 'номер скутера') {
      scooters.push(scooter);
    }
  }

  console.log(`✓ Извлечено скутеров: ${scooters.length}\n`);

  // Показываем пример первого скутера
  if (scooters.length > 0) {
    console.log('📄 ПРИМЕР ПЕРВОГО СКУТЕРА:\n');
    const firstScooter = scooters[0];
    for (let key in firstScooter) {
      if (firstScooter[key]) {
        console.log(`  ${key}: ${firstScooter[key]}`);
      }
    }
  }

  // Выводим все номера скутеров
  console.log('\n📋 ВСЕ НОМЕРА СКУТЕРОВ:\n');
  scooters.forEach((s, i) => {
    const number = s['номер скутера  (старый)'] || s['номер скутера  '];
    console.log(`${i + 1}. ${number}`);
  });

  // Сохраняем данные в JSON
  fs.writeFileSync('scooters-data.json', JSON.stringify(scooters, null, 2), 'utf8');
  console.log('\n✓ Данные скутеров сохранены в scooters-data.json\n');

  // Сохраняем лог в файл
  const logData = {
    totalScooters: scooters.length,
    numbers: scooters.map(s => s['номер скутера  (старый)'] || s['номер скутера  '])
  };
  fs.writeFileSync('analysis-log.json', JSON.stringify(logData, null, 2), 'utf8');

  return scooters;
}

// Главная функция
async function main() {
  try {
    const csvData = await downloadCSV();
    const analysisResult = analyzeCSV(csvData);
    const scooters = extractScooters(analysisResult);
    
    console.log('\n✅ АНАЛИЗ ЗАВЕРШЕН!\n');
    console.log(`📊 Итого найдено скутеров: ${scooters.length}\n`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('Детали:', error.response.data);
    }
  }
}

main();

