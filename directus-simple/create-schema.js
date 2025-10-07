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
    console.log('✓ Authenticated successfully');
    return authToken;
  } catch (error) {
    console.error('✗ Authentication failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Create collection
async function createCollection(collectionData) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/collections`,
      collectionData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`✓ Collection "${collectionData.collection}" created`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`⚠ Collection "${collectionData.collection}" already exists, skipping...`);
    } else {
      console.error(`✗ Failed to create collection "${collectionData.collection}":`, error.response?.data || error.message);
    }
  }
}

// Create field
async function createField(collection, fieldData) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/fields/${collection}`,
      fieldData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Field "${fieldData.field}" created in "${collection}"`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠ Field "${fieldData.field}" already exists in "${collection}", skipping...`);
    } else {
      console.error(`  ✗ Failed to create field "${fieldData.field}" in "${collection}":`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

// Main setup function
async function setupSchema() {
  console.log('Starting Directus schema setup...\n');
  
  await authenticate();
  
  // Step 1: Create Collections
  console.log('\n=== Creating Collections ===');
  
  await createCollection({
    collection: 'clients',
    meta: {
      icon: 'people_alt',
      note: 'База данных клиентов',
      display_template: '{{first_name}} {{last_name}}',
      archive_field: 'status',
      archive_value: 'archived',
      unarchive_value: 'active',
      sort_field: 'last_name'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'scooters',
    meta: {
      icon: 'two_wheeler',
      note: 'Инвентарь скутеров и мотоциклов',
      display_template: '{{model}} {{year}} ({{scooter_number_old}})',
      archive_field: 'status',
      archive_value: 'retired',
      unarchive_value: 'available',
      sort_field: 'scooter_number_old'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'communications',
    meta: {
      icon: 'chat',
      note: 'История коммуникаций с клиентами',
      display_template: '{{communication_type}} - {{subject}}',
      sort_field: 'communication_date'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'rentals',
    meta: {
      icon: 'receipt_long',
      note: 'Аренды скутеров',
      display_template: '#{{rental_number}} - {{client_name}}',
      archive_field: 'status',
      archive_value: 'completed',
      unarchive_value: 'active',
      sort_field: 'start_date'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'maintenance_records',
    meta: {
      icon: 'build',
      note: 'История обслуживания',
      display_template: '{{maintenance_type}} - {{scooter.model}} ({{maintenance_date}})',
      sort_field: 'maintenance_date'
    },
    schema: {}
  });
  
  // Wait a bit for collections to be created
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n=== Creating Fields for Clients ===');
  
  // Clients fields
  await createField('clients', {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Активный', value: 'active' },
          { text: 'Неактивный', value: 'inactive' },
          { text: 'Архив', value: 'archived' }
        ]
      },
      display: 'labels',
      display_options: {
        choices: [
          { text: 'Активный', value: 'active', foreground: '#FFFFFF', background: '#00C897' },
          { text: 'Неактивный', value: 'inactive', foreground: '#FFFFFF', background: '#A2B5CD' },
          { text: 'Архив', value: 'archived', foreground: '#FFFFFF', background: '#E35169' }
        ]
      },
      required: true,
      width: 'half'
    },
    schema: {
      default_value: 'active'
    }
  });
  
  await createField('clients', {
    field: 'first_name',
    type: 'string',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Имя клиента'
    },
    schema: {}
  });
  
  await createField('clients', {
    field: 'last_name',
    type: 'string',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Фамилия клиента'
    },
    schema: {}
  });
  
  console.log('\nSchema setup completed!');
}

setupSchema().catch(console.error);

