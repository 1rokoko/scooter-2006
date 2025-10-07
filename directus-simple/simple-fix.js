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
    console.log(`  ✓ Deleted ${field}`);
    return true;
  } catch (error) {
    console.log(`  ⚠ ${field}: ${error.response?.status || error.message}`);
    return false;
  }
}

async function simpleFix() {
  console.log('🔧 Simple fix - removing group fields...\n');
  await authenticate();
  
  const groupFields = [
    'basic_info', 'current_rental', 'maintenance_engine', 'maintenance_brakes',
    'documents', 'components', 'photos', 'pricing_basic', 'pricing_daily', 'pricing_monthly'
  ];
  
  for (const field of groupFields) {
    await deleteField('scooters', field);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Done! Refresh browser: http://localhost:8055');
}

simpleFix().catch(console.error);

