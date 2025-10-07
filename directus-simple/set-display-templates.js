const axios = require('axios');

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
  console.log('✓ Authenticated\n');
  return authToken;
}

async function updateCollection(collection, meta) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/collections/${collection}`,
      { meta },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✓ Updated ${collection}`);
  } catch (error) {
    console.error(`✗ Error updating ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function setDisplayTemplates() {
  console.log('🔧 Setting display templates...\n');
  await authenticate();
  
  console.log('📊 Updating collection display templates...\n');
  
  // Scooters - номер скутера как ключевое поле
  await updateCollection('scooters', {
    display_template: '{{scooter_number_old}}',
    sort_field: 'scooter_number_old',
    icon: 'two_wheeler',
    note: 'Скутеры и мотоциклы'
  });
  
  // Clients
  await updateCollection('clients', {
    display_template: '{{first_name}} {{last_name}}',
    sort_field: 'last_name',
    icon: 'people_alt',
    note: 'База клиентов'
  });
  
  // Rentals
  await updateCollection('rentals', {
    display_template: '{{rental_number}}',
    sort_field: 'rental_number',
    icon: 'receipt_long',
    note: 'Аренды'
  });
  
  // Communications
  await updateCollection('communications', {
    display_template: '{{communication_type}} - {{communication_date}}',
    sort_field: 'communication_date',
    icon: 'chat',
    note: 'Коммуникации'
  });
  
  // Maintenance Records
  await updateCollection('maintenance_records', {
    display_template: '{{maintenance_type}} - {{maintenance_date}}',
    sort_field: 'maintenance_date',
    icon: 'build',
    note: 'История обслуживания'
  });
  
  console.log('\n✅ Display templates configured!');
  console.log('\n💡 Обновите страницу в браузере (F5)');
  console.log('🌐 http://localhost:8055/admin/content/scooters');
  console.log('\n📋 Теперь:');
  console.log('   - Scooters: ключевое поле = номер скутера');
  console.log('   - Clients: ключевое поле = имя фамилия');
  console.log('   - Rentals: ключевое поле = номер аренды');
  console.log('   - Все поля видны в таблице!');
}

setDisplayTemplates().catch(console.error);

