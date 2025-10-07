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
  console.log('✓ Authenticated');
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
    console.log(`  ⚠ Could not delete ${collection}.${field}`);
  }
}

async function createRelation(data) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/relations`,
      data,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Created relation: ${data.collection}.${data.field} -> ${data.related_collection}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠ Relation already exists`);
    } else {
      console.error(`  ✗ Error:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function createField(collection, fieldData) {
  try {
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, fieldData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`  ✓ ${collection}.${fieldData.field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠ ${collection}.${fieldData.field} exists`);
    } else {
      console.error(`  ✗ ${collection}.${fieldData.field}:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
}

async function fixRelationships() {
  console.log('🔧 Fixing relationships...\n');
  await authenticate();
  
  console.log('\n🗑️ Removing problematic alias fields...');
  
  await deleteField('clients', 'communications');
  await deleteField('clients', 'rental_history');
  await deleteField('scooters', 'rental_history');
  await deleteField('scooters', 'maintenance_history');
  
  console.log('\n🔗 Creating proper M2O relationships...');
  
  // Communications -> Client
  await createRelation({
    collection: 'communications',
    field: 'client',
    related_collection: 'clients',
    meta: {
      one_field: 'communications',
      sort_field: null,
      one_deselect_action: 'nullify'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Rentals -> Client
  await createRelation({
    collection: 'rentals',
    field: 'client',
    related_collection: 'clients',
    meta: {
      one_field: 'rental_history',
      sort_field: null,
      one_deselect_action: 'nullify'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Rentals -> Scooter
  await createRelation({
    collection: 'rentals',
    field: 'scooter',
    related_collection: 'scooters',
    meta: {
      one_field: 'rental_history',
      sort_field: null,
      one_deselect_action: 'nullify'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Maintenance Records -> Scooter
  await createRelation({
    collection: 'maintenance_records',
    field: 'scooter',
    related_collection: 'scooters',
    meta: {
      one_field: 'maintenance_history',
      sort_field: null,
      one_deselect_action: 'nullify'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  console.log('\n✅ Relationships fixed!');
  console.log('\n🌐 Access Directus at: http://localhost:8055');
}

fixRelationships().catch(console.error);

