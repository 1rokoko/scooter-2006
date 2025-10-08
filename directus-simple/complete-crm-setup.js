const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'seocos@gmail.com';
const PASSWORD = 'directus2024!';

let authToken = '';

// Authenticate
async function authenticate() {
  try {
    const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    authToken = response.data.data.access_token;
    console.log('✅ Authenticated successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Create or update field
async function createOrUpdateField(collection, fieldData) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/fields/${collection}/${fieldData.field}`,
      fieldData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`✅ Updated field: ${collection}.${fieldData.field}`);
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        await axios.post(
          `${DIRECTUS_URL}/fields/${collection}`,
          fieldData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log(`✅ Created field: ${collection}.${fieldData.field}`);
      } catch (createError) {
        console.error(`❌ Error creating field ${collection}.${fieldData.field}:`, createError.response?.data || createError.message);
      }
    } else {
      console.error(`❌ Error updating field ${collection}.${fieldData.field}:`, error.response?.data || error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Completing CRM setup...\n');

  if (!await authenticate()) {
    return;
  }

  // Add CRM fields to leads collection
  console.log('📝 Adding CRM fields to leads collection...\n');

  await createOrUpdateField('leads', {
    field: 'name',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Имя лида',
      required: false
    },
    schema: {}
  });

  await createOrUpdateField('leads', {
    field: 'client_phone',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Телефон клиента (уникальный идентификатор)',
      required: false,
      options: {
        placeholder: '+66 XX XXX XXXX'
      }
    },
    schema: {}
  });

  await createOrUpdateField('leads', {
    field: 'telegram_account',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Telegram аккаунт (например, @username)',
      required: false,
      options: {
        placeholder: '@username'
      }
    },
    schema: {}
  });

  await createOrUpdateField('leads', {
    field: 'email',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Email адрес',
      required: false,
      options: {
        placeholder: 'email@example.com'
      }
    },
    schema: {}
  });

  await createOrUpdateField('leads', {
    field: 'all_conversation',
    type: 'text',
    meta: {
      interface: 'input-rich-text-md',
      width: 'full',
      note: 'Вся история общения с лидом',
      required: false
    },
    schema: {}
  });

  await createOrUpdateField('leads', {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      note: 'Статус лида',
      required: false,
      options: {
        choices: [
          { text: 'Новый', value: 'новый' },
          { text: 'В работе', value: 'в_работе' },
          { text: 'Конвертирован', value: 'конвертирован' },
          { text: 'Отклонен', value: 'отклонен' }
        ]
      }
    },
    schema: {
      default_value: 'новый'
    }
  });

  await createOrUpdateField('leads', {
    field: 'notes',
    type: 'text',
    meta: {
      interface: 'input-rich-text-md',
      width: 'full',
      note: 'Дополнительные заметки о лиде',
      required: false
    },
    schema: {}
  });

  // Update status field in clients collection
  console.log('\n📝 Updating status field in clients collection...\n');

  await createOrUpdateField('clients', {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      note: 'Статус клиента',
      required: false,
      options: {
        choices: [
          { text: 'Активный', value: 'активный' },
          { text: 'Неактивный', value: 'неактивный' },
          { text: 'VIP', value: 'vip' }
        ]
      }
    },
    schema: {
      default_value: 'активный'
    }
  });

  // Add converted_from_lead_id field to clients
  console.log('\n📝 Adding conversion tracking field to clients...\n');

  await createOrUpdateField('clients', {
    field: 'converted_from_lead_id',
    type: 'integer',
    meta: {
      interface: 'select-dropdown-m2o',
      width: 'half',
      note: 'Лид, из которого был конвертирован этот клиент',
      required: false,
      display: 'related-values',
      display_options: {
        template: '{{name}} ({{telegram_account}} / {{client_phone}})'
      }
    },
    schema: {
      foreign_key_table: 'leads',
      foreign_key_column: 'id'
    }
  });

  // Add client_id field to scooters
  console.log('\n📝 Adding client relationship to scooters...\n');

  await createOrUpdateField('scooters', {
    field: 'client_id',
    type: 'integer',
    meta: {
      interface: 'select-dropdown-m2o',
      width: 'half',
      note: 'Клиент, связанный с этим скутером',
      required: false,
      display: 'related-values',
      display_options: {
        template: '{{name}} ({{client_phone}})'
      }
    },
    schema: {
      foreign_key_table: 'clients',
      foreign_key_column: 'id'
    }
  });

  console.log('\n✅ CRM setup completed successfully!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Added CRM fields to leads collection');
  console.log('  ✅ Updated status fields with proper choices');
  console.log('  ✅ Added conversion tracking (clients.converted_from_lead_id)');
  console.log('  ✅ Added client relationship to scooters (scooters.client_id)');
  console.log('\nPlease restart Directus to see all changes.');
}

main().catch(console.error);

