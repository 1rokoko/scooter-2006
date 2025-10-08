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
}

async function checkCollection(collection) {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/fields/${collection}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`\n📦 Collection: ${collection}`);
    console.log(`   Fields (${response.data.data.length}):`);
    response.data.data.forEach(field => {
      console.log(`   - ${field.field} (${field.type})`);
    });
  } catch (error) {
    console.error(`✗ Error checking ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function main() {
  await authenticate();
  await checkCollection('scooters');
  await checkCollection('leads');
  await checkCollection('clients');
}

main().catch(console.error);

