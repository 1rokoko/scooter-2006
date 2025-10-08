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
    console.log('✓ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('✗ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create or update field
async function createOrUpdateField(collection, fieldData) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/fields/${collection}`,
      fieldData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Created field: ${fieldData.field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      try {
        await axios.patch(
          `${DIRECTUS_URL}/fields/${collection}/${fieldData.field}`,
          fieldData,
          { headers: { Authorization: `Bearer ${authToken}` } }
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

// Update collection metadata
async function updateCollection(collection, meta) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/collections/${collection}`,
      { meta },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Updated collection: ${collection}`);
  } catch (error) {
    console.error(`  ✗ Error updating collection ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Rename collection
async function renameCollection(oldName, newName) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/collections/${oldName}`,
      { collection: newName },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Renamed collection: ${oldName} → ${newName}`);
  } catch (error) {
    console.error(`  ✗ Error renaming collection:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Main implementation
async function implementCRMEnhancements() {
  console.log('🚀 Starting CRM Enhancements Implementation...\n');
  
  await authenticate();
  
  // Step 1: Add new fields to scooters collection
  console.log('📝 Step 1: Adding new fields to scooters collection...');
  
  await createOrUpdateField('scooters', {
    field: 'owner_scooter',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Владелец скутера',
      required: false
    },
    schema: {}
  });
  
  await createOrUpdateField('scooters', {
    field: 'telegram_account',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Telegram аккаунт клиента (например, @username)',
      required: false,
      options: {
        placeholder: '@username'
      }
    },
    schema: {}
  });
  
  console.log('✅ Step 1 completed\n');
  
  // Step 2: Rename communications to leads
  console.log('📝 Step 2: Renaming communications collection to leads...');
  
  await renameCollection('communications', 'leads');
  
  await updateCollection('leads', {
    icon: 'person_add',
    note: 'Потенциальные клиенты (лиды)',
    display_template: '{{name}} ({{telegram_account}} / {{client_phone}})',
    sort_field: 'created_at'
  });
  
  console.log('✅ Step 2 completed\n');
  
  // Step 3: Synchronize fields between leads and clients
  console.log('📝 Step 3: Synchronizing fields between leads and clients...');
  
  const commonFields = [
    {
      field: 'name',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Имя клиента/лида',
        required: true
      },
      schema: {}
    },
    {
      field: 'client_phone',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Номер телефона (уникальный идентификатор)',
        required: false,
        options: {
          placeholder: '+66...'
        }
      },
      schema: {}
    },
    {
      field: 'telegram_account',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Telegram аккаунт (уникальный идентификатор)',
        required: false,
        options: {
          placeholder: '@username'
        }
      },
      schema: {}
    },
    {
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
    },
    {
      field: 'all_conversation',
      type: 'text',
      meta: {
        interface: 'input-rich-text-md',
        width: 'full',
        note: 'История всех коммуникаций с клиентом/лидом',
        required: false
      },
      schema: {}
    },
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        width: 'half',
        note: 'Статус',
        required: true,
        options: {
          choices: []
        }
      },
      schema: {}
    },
    {
      field: 'notes',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        width: 'full',
        note: 'Дополнительные заметки',
        required: false
      },
      schema: {}
    }
  ];
  
  // Add fields to leads
  console.log('  Adding fields to leads collection...');
  for (const fieldData of commonFields) {
    if (fieldData.field === 'status') {
      fieldData.meta.options.choices = [
        { text: 'Новый', value: 'new' },
        { text: 'В работе', value: 'in_progress' },
        { text: 'Конвертирован', value: 'converted' }
      ];
    }
    await createOrUpdateField('leads', fieldData);
  }
  
  // Add fields to clients
  console.log('  Adding fields to clients collection...');
  for (const fieldData of commonFields) {
    if (fieldData.field === 'status') {
      fieldData.meta.options.choices = [
        { text: 'Активный', value: 'active' },
        { text: 'Неактивный', value: 'inactive' }
      ];
    }
    await createOrUpdateField('clients', fieldData);
  }
  
  // Add scooter_number field to clients
  await createOrUpdateField('clients', {
    field: 'scooter_number',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Номер скутера клиента',
      required: false
    },
    schema: {}
  });
  
  console.log('✅ Step 3 completed\n');
  
  console.log('🎉 CRM Enhancements Implementation Completed!\n');
  console.log('📋 Summary:');
  console.log('  ✓ Added owner_scooter and telegram_account to scooters');
  console.log('  ✓ Renamed communications → leads');
  console.log('  ✓ Synchronized fields between leads and clients');
  console.log('\n🌐 Access Directus at: http://localhost:8055');
}

// Run the implementation
implementCRMEnhancements().catch(console.error);

