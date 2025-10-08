const { execSync } = require('child_process');
const fs = require('fs');

const log = [];

function logMessage(msg) {
  console.log(msg);
  log.push(msg);
}

try {
  logMessage('\n' + '='.repeat(70));
  logMessage('🚀 ПОЛНАЯ МИГРАЦИЯ С ВЕРИФИКАЦИЕЙ');
  logMessage('='.repeat(70) + '\n');
  
  // Шаг 1: Очистка
  logMessage('Шаг 1: Очистка таблицы...');
  execSync('node clear-scooters.js', { stdio: 'inherit' });
  logMessage('✓ Очистка завершена\n');
  
  // Шаг 2: Миграция
  logMessage('Шаг 2: Миграция данных...');
  execSync('node migrate-scooters.js', { stdio: 'inherit' });
  logMessage('✓ Миграция завершена\n');
  
  // Шаг 3: Верификация
  logMessage('Шаг 3: Верификация...');
  execSync('node verify-migration.js', { stdio: 'inherit' });
  logMessage('✓ Верификация завершена\n');
  
  logMessage('='.repeat(70));
  logMessage('✅ ВСЕ ЭТАПЫ ЗАВЕРШЕНЫ УСПЕШНО!');
  logMessage('='.repeat(70) + '\n');
  
} catch (error) {
  logMessage(`\n❌ Ошибка: ${error.message}\n`);
}

// Сохраняем лог
fs.writeFileSync('migration-log.txt', log.join('\n'), 'utf8');
logMessage('📄 Лог сохранен в migration-log.txt');

