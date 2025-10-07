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
    console.log(`✓ Updated ${collection} collection settings`);
  } catch (error) {
    console.error(`✗ Error updating ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function updateField(collection, field, meta) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/fields/${collection}/${field}`,
      { meta },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Updated ${collection}.${field}`);
  } catch (error) {
    console.error(`  ✗ Error updating ${collection}.${field}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function fixDisplay() {
  console.log('🔧 Fixing display settings...\n');
  await authenticate();
  
  console.log('📦 Updating Scooters collection display...');
  
  // Update scooters collection meta
  await updateCollection('scooters', {
    display_template: '{{scooter_number_old}} - {{model}} {{year}}',
    sort_field: 'scooter_number_old'
  });
  
  console.log('\n📋 Setting up table view columns for Scooters...');
  
  // Update field display settings for table view
  await updateField('scooters', 'scooter_number_old', {
    interface: 'input',
    required: true,
    width: 'half',
    note: 'Номер скутера (старый)',
    group: 'basic_info',
    display: 'raw',
    readonly: false,
    hidden: false
  });
  
  await updateField('scooters', 'model', {
    interface: 'input',
    required: true,
    width: 'half',
    note: 'Модель',
    group: 'basic_info',
    display: 'raw',
    readonly: false,
    hidden: false
  });
  
  await updateField('scooters', 'year', {
    interface: 'input',
    required: true,
    width: 'half',
    note: 'Год выпуска',
    group: 'basic_info',
    display: 'raw',
    readonly: false,
    hidden: false
  });
  
  await updateField('scooters', 'status', {
    interface: 'select-dropdown',
    options: {
      choices: [
        { text: 'Доступен', value: 'available' },
        { text: 'В аренде', value: 'rented' },
        { text: 'На обслуживании', value: 'maintenance' },
        { text: 'Списан', value: 'retired' }
      ]
    },
    display: 'labels',
    display_options: {
      choices: [
        { text: 'Доступен', value: 'available', foreground: '#FFF', background: '#00C897' },
        { text: 'В аренде', value: 'rented', foreground: '#FFF', background: '#2ECDA7' },
        { text: 'На обслуживании', value: 'maintenance', foreground: '#FFF', background: '#FFA439' },
        { text: 'Списан', value: 'retired', foreground: '#FFF', background: '#E35169' }
      ]
    },
    required: true,
    width: 'half',
    group: 'basic_info',
    readonly: false,
    hidden: false
  });
  
  console.log('\n📦 Updating Clients collection display...');
  
  await updateCollection('clients', {
    display_template: '{{first_name}} {{last_name}} ({{phone_primary}})',
    sort_field: 'last_name'
  });
  
  console.log('\n📦 Updating Rentals collection display...');
  
  await updateCollection('rentals', {
    display_template: '{{rental_number}} - {{start_date}}',
    sort_field: 'start_date'
  });
  
  console.log('\n📦 Updating Communications collection display...');
  
  await updateCollection('communications', {
    display_template: '{{communication_type}} - {{communication_date}}',
    sort_field: 'communication_date'
  });
  
  console.log('\n📦 Updating Maintenance Records collection display...');
  
  await updateCollection('maintenance_records', {
    display_template: '{{maintenance_type}} - {{maintenance_date}}',
    sort_field: 'maintenance_date'
  });
  
  console.log('\n✅ Display settings updated!');
  console.log('\n💡 Refresh your browser to see the changes');
  console.log('🌐 http://localhost:8055');
}

fixDisplay().catch(console.error);

