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

async function setupSimplifiedView() {
  console.log('🔧 Настройка упрощенного view для менеджера...\n');
  await authenticate();
  
  console.log('📊 Создание упрощенного preset для Scooters...\n');
  
  // Удаляем существующие presets
  try {
    const presetsResponse = await axios.get(
      `${DIRECTUS_URL}/presets?filter[collection][_eq]=scooters`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    for (const preset of presetsResponse.data.data) {
      await axios.delete(
        `${DIRECTUS_URL}/presets/${preset.id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    }
    console.log('  ✓ Удалены старые presets');
  } catch (error) {
    console.log('  ⚠ Ошибка при удалении presets:', error.response?.data?.errors?.[0]?.message);
  }
  
  // Создаем упрощенный preset - только важные поля
  const simplifiedFields = [
    'id',
    'scooter_number_old',
    'current_status',
    'model',
    'year',
    'current_owner_name',
    'current_owner_telegram',
    'current_owner_phone',
    'rental_start',
    'rental_end'
  ];
  
  const widths = {};
  simplifiedFields.forEach(field => {
    if (field === 'scooter_number_old') {
      widths[field] = 150;
    } else if (field === 'current_status') {
      widths[field] = 120;
    } else if (field === 'model') {
      widths[field] = 150;
    } else if (field === 'current_owner_name') {
      widths[field] = 180;
    } else if (field === 'current_owner_telegram' || field === 'current_owner_phone') {
      widths[field] = 150;
    } else {
      widths[field] = 120;
    }
  });
  
  try {
    await axios.post(
      `${DIRECTUS_URL}/presets`,
      {
        collection: 'scooters',
        layout: 'tabular',
        layout_query: {
          tabular: {
            fields: simplifiedFields,
            spacing: 'comfortable',
            widths: widths
          }
        },
        layout_options: {
          tabular: {
            fields: simplifiedFields,
            spacing: 'comfortable',
            widths: widths
          }
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('  ✓ Создан упрощенный preset для Scooters');
    console.log(`  ✓ Показываются только ${simplifiedFields.length} важных полей`);
  } catch (error) {
    console.error('  ✗ Ошибка при создании preset:', error.response?.data?.errors?.[0]?.message);
  }
  
  // Настраиваем collection metadata для drawer mode
  try {
    await axios.patch(
      `${DIRECTUS_URL}/collections/scooters`,
      {
        meta: {
          display_template: '{{scooter_number_old}} - {{model}}',
          sort_field: 'scooter_number_old',
          archive_field: 'status',
          archive_value: 'archived',
          unarchive_value: 'draft',
          item_duplication_fields: ['model', 'year', 'power', 'color'],
          note: 'Упрощенный view: только важные поля. Остальное - при клике на скутер.'
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('  ✓ Настроен drawer mode для быстрого редактирования');
  } catch (error) {
    console.error('  ✗ Ошибка при настройке collection:', error.response?.data?.errors?.[0]?.message);
  }
  
  console.log('\n📊 Настройка Clients...\n');
  
  // Упрощенный preset для Clients
  const clientFields = [
    'id',
    'first_name',
    'last_name',
    'phone_primary',
    'telegram_id',
    'telegram_username',
    'email',
    'status'
  ];
  
  try {
    const clientPresetsResponse = await axios.get(
      `${DIRECTUS_URL}/presets?filter[collection][_eq]=clients`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    for (const preset of clientPresetsResponse.data.data) {
      await axios.delete(
        `${DIRECTUS_URL}/presets/${preset.id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    }
    
    await axios.post(
      `${DIRECTUS_URL}/presets`,
      {
        collection: 'clients',
        layout: 'tabular',
        layout_query: {
          tabular: {
            fields: clientFields,
            spacing: 'comfortable'
          }
        },
        layout_options: {
          tabular: {
            fields: clientFields,
            spacing: 'comfortable'
          }
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('  ✓ Создан упрощенный preset для Clients');
    console.log(`  ✓ Показываются только ${clientFields.length} важных полей`);
  } catch (error) {
    console.error('  ✗ Ошибка:', error.response?.data?.errors?.[0]?.message);
  }
  
  console.log('\n✅ Упрощенный view настроен!');
  console.log('\n📋 Что изменилось:');
  console.log('   Scooters:');
  console.log('   ✓ Показываются только 10 важных полей');
  console.log('   ✓ Остальные поля доступны при клике на скутер');
  console.log('   ✓ Быстрое редактирование через drawer');
  console.log('   Clients:');
  console.log('   ✓ Показываются только 8 важных полей');
  console.log('   ✓ Telegram ID и username видны сразу');
  console.log('\n💡 Обновите страницу в браузере (F5)');
  console.log('🌐 http://localhost:8055/admin/content/scooters');
}

setupSimplifiedView().catch(console.error);

