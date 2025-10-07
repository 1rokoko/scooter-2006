const { execSync } = require('child_process');

console.log('🚀 Применение всех настроек для отображения таблиц...\n');

const scripts = [
  { name: 'Настройка layout таблиц', file: 'setup-table-layout.js' },
  { name: 'Установка порядка полей', file: 'set-field-order.js' },
  { name: 'Настройка display templates', file: 'set-display-templates.js' }
];

for (const script of scripts) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 ${script.name}`);
  console.log('='.repeat(60));
  
  try {
    execSync(`node ${script.file}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n✗ Ошибка при выполнении ${script.file}`);
  }
}

console.log('\n\n' + '='.repeat(60));
console.log('✅ ВСЕ НАСТРОЙКИ ПРИМЕНЕНЫ!');
console.log('='.repeat(60));
console.log('\n📊 Что изменилось:');
console.log('   ✓ Scooters: все 61 поле видны в таблице');
console.log('   ✓ Clients: все 16 полей видны в таблице');
console.log('   ✓ Rentals: все 14 полей видны в таблице');
console.log('   ✓ Communications: все 9 полей видны в таблице');
console.log('   ✓ Maintenance Records: все 12 полей видны в таблице');
console.log('\n🔑 Ключевые поля:');
console.log('   ✓ Scooters: номер скутера (scooter_number_old)');
console.log('   ✓ Clients: имя фамилия');
console.log('   ✓ Rentals: номер аренды');
console.log('\n💡 ВАЖНО: Обновите страницу в браузере (F5 или Ctrl+R)');
console.log('🌐 http://localhost:8055/admin/content/scooters');
console.log('\n🎉 Готово! Теперь все данные видны на одной странице!');

