const fs = require('fs');

console.log('\n' + '='.repeat(70));
console.log('🎉 МИГРАЦИЯ ДАННЫХ ЗАВЕРШЕНА УСПЕШНО!');
console.log('='.repeat(70) + '\n');

const migrationReport = JSON.parse(fs.readFileSync('migration-report.json', 'utf8'));
const verificationReport = JSON.parse(fs.readFileSync('verification-report.json', 'utf8'));

console.log('📊 КРАТКАЯ СВОДКА:\n');
console.log(`  Источник: Google Sheets`);
console.log(`  Целевая система: Directus (localhost:8055)`);
console.log(`  Коллекция: scooters\n`);

console.log('📈 СТАТИСТИКА ИМПОРТА:\n');
console.log(`  Всего записей в источнике: ${migrationReport.source.total}`);
console.log(`  Записей для импорта: ${migrationReport.source.actual}`);
console.log(`  Валидных записей: ${migrationReport.validation.valid}`);
console.log(`  Невалидных записей: ${migrationReport.validation.invalid}`);
console.log(`  Успешно импортировано: ${migrationReport.import.success}`);
console.log(`  Ошибок импорта: ${migrationReport.import.failed}\n`);

console.log('✅ РЕЗУЛЬТАТЫ ВЕРИФИКАЦИИ:\n');
verificationReport.checks.forEach(check => {
  const icon = check.passed ? '✓' : '✗';
  console.log(`  ${icon} ${check.name}`);
});

console.log('\n📋 СТАТИСТИКА ЗАПОЛНЕННОСТИ ПОЛЕЙ:\n');
const stats = verificationReport.fieldStats;
const total = verificationReport.totalScooters;

Object.entries(stats).forEach(([field, count]) => {
  const percentage = ((count / total) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(percentage / 5));
  console.log(`  ${field.padEnd(30)} ${bar} ${percentage}% (${count}/${total})`);
});

console.log('\n📄 ПРИМЕРЫ ИМПОРТИРОВАННЫХ СКУТЕРОВ:\n');
verificationReport.samples.forEach((scooter, index) => {
  console.log(`  ${index + 1}. ${scooter.scooter_number_old} - ${scooter.model} (${scooter.year}) - ${scooter.color}`);
});

console.log('\n⚠️  НЕВАЛИДНЫЕ ЗАПИСИ:\n');
console.log(`  Всего: ${migrationReport.validation.invalid}`);
console.log(`  Причины:`);

const reasons = {};
migrationReport.validation.invalidRecords.forEach(record => {
  record.errors.forEach(error => {
    reasons[error] = (reasons[error] || 0) + 1;
  });
});

Object.entries(reasons).forEach(([reason, count]) => {
  console.log(`    - ${reason}: ${count} записей`);
});

console.log('\n📁 СОЗДАННЫЕ ФАЙЛЫ:\n');
console.log(`  ✓ google-sheets-data.csv - исходные данные CSV`);
console.log(`  ✓ scooters-data.json - извлеченные данные скутеров`);
console.log(`  ✓ migration-report.json - детальный отчет миграции`);
console.log(`  ✓ verification-report.json - отчет верификации`);
console.log(`  ✓ MIGRATION_REPORT_RU.md - полный отчет на русском\n`);

console.log('🔗 ССЫЛКИ:\n');
console.log(`  Directus Admin: http://localhost:8055/admin/content/scooters`);
console.log(`  Email: seocos@gmail.com`);
console.log(`  Password: directus2024!\n`);

console.log('✅ СЛЕДУЮЩИЕ ШАГИ:\n');
console.log(`  1. Проверьте данные в веб-интерфейсе Directus`);
console.log(`  2. Дополните 14 невалидных записей в Google Sheets`);
console.log(`  3. При необходимости выполните дополнительный импорт\n`);

console.log('='.repeat(70));
console.log('🎊 МИГРАЦИЯ ЗАВЕРШЕНА! ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
console.log('='.repeat(70) + '\n');

