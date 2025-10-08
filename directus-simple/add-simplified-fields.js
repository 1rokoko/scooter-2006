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

async function createField(collection, fieldData) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/fields/${collection}`,
      fieldData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Created field: ${fieldData.field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`  ⚠ Field ${fieldData.field} already exists, updating...`);
      try {
        await axios.patch(
          `${DIRECTUS_URL}/fields/${collection}/${fieldData.field}`,
          fieldData,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        console.log(`  ✓ Updated field: ${fieldData.field}`);
      } catch (updateError) {
        console.error(`  ✗ Error updating ${fieldData.field}:`, updateError.response?.data?.errors?.[0]?.message);
      }
    } else {
      console.error(`  ✗ Error creating ${fieldData.field}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function addSimplifiedFields() {
  console.log('🔧 Добавление упрощенных полей для менеджера...\n');
  await authenticate();
  
  console.log('📊 Scooters - добавление полей для упрощенной работы...\n');
  
  // Статус скутера (свободен/в аренде/ремонт)
  await createField('scooters', {
    field: 'current_status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: '🟢 Свободен', value: 'available' },
          { text: '🔵 В аренде', value: 'rented' },
          { text: '🔴 Ремонт', value: 'maintenance' },
          { text: '⚫ Не активен', value: 'inactive' }
        ]
      },
      display: 'labels',
      display_options: {
        choices: [
          { text: '🟢 Свободен', value: 'available', foreground: '#FFFFFF', background: '#10B981' },
          { text: '🔵 В аренде', value: 'rented', foreground: '#FFFFFF', background: '#3B82F6' },
          { text: '🔴 Ремонт', value: 'maintenance', foreground: '#FFFFFF', background: '#EF4444' },
          { text: '⚫ Не активен', value: 'inactive', foreground: '#FFFFFF', background: '#6B7280' }
        ]
      },
      width: 'half',
      note: 'Текущий статус скутера',
      sort: 3
    },
    schema: {
      default_value: 'available'
    }
  });
  
  // Имя текущего владельца/клиента
  await createField('scooters', {
    field: 'current_owner_name',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Имя текущего клиента (заполняется автоматически или вручную)',
      sort: 10
    }
  });
  
  // Telegram ID клиента
  await createField('scooters', {
    field: 'current_owner_telegram',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Telegram ID или username клиента (например: @username или 123456789)',
      sort: 11
    }
  });
  
  // Телефон клиента
  await createField('scooters', {
    field: 'current_owner_phone',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Номер телефона текущего клиента',
      sort: 12
    }
  });
  
  console.log('\n📊 Clients - добавление telegram_id...\n');
  
  // Telegram ID в clients
  await createField('clients', {
    field: 'telegram_id',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Telegram ID или username (например: @username или 123456789)',
      sort: 7
    }
  });
  
  // Telegram username в clients
  await createField('clients', {
    field: 'telegram_username',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Telegram username без @ (например: ivanov)',
      sort: 8
    }
  });
  
  console.log('\n✅ Все поля добавлены!');
  console.log('\n📋 Добавленные поля:');
  console.log('   Scooters:');
  console.log('   ✓ current_status - Статус (свободен/в аренде/ремонт/не активен)');
  console.log('   ✓ current_owner_name - Имя текущего клиента');
  console.log('   ✓ current_owner_telegram - Telegram клиента');
  console.log('   ✓ current_owner_phone - Телефон клиента');
  console.log('   Clients:');
  console.log('   ✓ telegram_id - Telegram ID');
  console.log('   ✓ telegram_username - Telegram username');
  console.log('\n💡 Обновите страницу в браузере (F5)');
}

addSimplifiedFields().catch(console.error);

