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

async function checkCollection(collectionName) {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/fields/${collectionName}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log(`\n📦 Collection: ${collectionName}`);
    console.log(`   Total fields: ${response.data.data.length}`);
    console.log(`   Fields:`);
    
    response.data.data.forEach(field => {
      const name = field.field;
      const type = field.type;
      const meta = field.meta;
      const note = meta?.note || '';
      const group = meta?.group || '';
      
      console.log(`     - ${name} (${type}) ${note ? '- ' + note : ''} ${group ? '[group: ' + group + ']' : ''}`);
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`✗ Error checking ${collectionName}:`, error.message);
    return [];
  }
}

async function checkSchema() {
  console.log('🔍 Checking Directus schema...\n');
  await authenticate();
  
  const collections = ['clients', 'scooters', 'communications', 'rentals', 'maintenance_records'];
  
  for (const collection of collections) {
    await checkCollection(collection);
  }
  
  console.log('\n\n✅ Schema check complete!');
}

checkSchema().catch(console.error);

