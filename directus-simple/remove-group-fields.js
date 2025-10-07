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

async function deleteField(collection, field) {
  try {
    await axios.delete(
      `${DIRECTUS_URL}/fields/${collection}/${field}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Deleted ${collection}.${field}`);
  } catch (error) {
    console.log(`  ⚠ Could not delete ${collection}.${field}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
  }
}

async function updateField(collection, field, data) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/fields/${collection}/${field}`,
      data,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Updated ${collection}.${field}`);
  } catch (error) {
    console.error(`  ✗ Error updating ${collection}.${field}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function removeGroupFields() {
  console.log('🗑️ Removing group alias fields...\n');
  await authenticate();
  
  console.log('Deleting group fields from scooters...');
  
  const groupFields = [
    'basic_info',
    'current_rental',
    'maintenance_engine',
    'maintenance_brakes',
    'documents',
    'components',
    'photos',
    'pricing_basic',
    'pricing_daily',
    'pricing_monthly'
  ];
  
  for (const field of groupFields) {
    await deleteField('scooters', field);
  }
  
  console.log('\n📝 Updating all scooter fields to remove group references...');
  
  // Get all fields
  const response = await axios.get(
    `${DIRECTUS_URL}/fields/scooters`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  
  const fields = response.data.data;
  
  for (const field of fields) {
    if (field.meta?.group) {
      const meta = { ...field.meta };
      delete meta.group;
      
      await updateField('scooters', field.field, { meta });
    }
  }
  
  console.log('\n✅ Group fields removed and references cleaned!');
  console.log('💡 Refresh your browser to see the changes');
}

removeGroupFields().catch(console.error);

