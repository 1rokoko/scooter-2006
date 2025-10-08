const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scooters-data.json', 'utf8'));

console.log('\n' + '='.repeat(70));
console.log('🔍 ПРОВЕРКА ДУБЛИКАТОВ В ИСХОДНЫХ ДАННЫХ');
console.log('='.repeat(70) + '\n');

console.log(`Всего записей: ${data.length}\n`);

// Подсчет номеров
const numberCounts = {};
data.forEach((s, index) => {
  const number = s['номер скутера  (старый)'] || s['номер скутера  '];
  if (number && number.trim()) {
    if (!numberCounts[number]) {
      numberCounts[number] = [];
    }
    numberCounts[number].push(index + 1);
  }
});

// Находим дубликаты
const duplicates = Object.entries(numberCounts).filter(([num, indices]) => indices.length > 1);

if (duplicates.length > 0) {
  console.log(`⚠️  НАЙДЕНЫ ДУБЛИКАТЫ (${duplicates.length}):\n`);
  duplicates.forEach(([number, indices]) => {
    console.log(`  "${number}": встречается ${indices.length} раз(а)`);
    console.log(`    Индексы: ${indices.join(', ')}`);
  });
} else {
  console.log('✅ Дубликатов не найдено!\n');
}

// Показываем все уникальные номера
const uniqueNumbers = Object.keys(numberCounts);
console.log(`\nУникальных номеров: ${uniqueNumbers.length}\n`);

console.log('='.repeat(70) + '\n');

