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

async function getFields(collection) {
  const response = await axios.get(
    `${DIRECTUS_URL}/fields/${collection}`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data.data.map(f => f.field);
}

async function updateCollectionLayout(collection, fields) {
  try {
    // Create layout options with all fields visible
    const layoutOptions = {
      tabular: {
        fields: fields,
        spacing: 'comfortable',
        widths: {}
      }
    };
    
    // Set default widths for all fields
    fields.forEach(field => {
      layoutOptions.tabular.widths[field] = 200;
    });
    
    await axios.patch(
      `${DIRECTUS_URL}/collections/${collection}`,
      {
        meta: {
          display_template: null,
          archive_field: collection === 'clients' ? 'status' : 
                         collection === 'scooters' ? 'status' :
                         collection === 'rentals' ? 'status' : null,
          sort_field: collection === 'scooters' ? 'scooter_number_old' :
                     collection === 'clients' ? 'last_name' :
                     collection === 'rentals' ? 'start_date' :
                     collection === 'communications' ? 'communication_date' :
                     collection === 'maintenance_records' ? 'maintenance_date' : null
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log(`✓ Updated ${collection} layout (${fields.length} fields)`);
  } catch (error) {
    console.error(`✗ Error updating ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function createPreset(collection, fields) {
  try {
    // Delete existing presets for this collection
    const presetsResponse = await axios.get(
      `${DIRECTUS_URL}/presets`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const existingPresets = presetsResponse.data.data.filter(p => p.collection === collection);
    for (const preset of existingPresets) {
      try {
        await axios.delete(
          `${DIRECTUS_URL}/presets/${preset.id}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Create new preset with all fields
    const presetData = {
      collection: collection,
      layout: 'tabular',
      layout_query: {
        tabular: {
          fields: fields,
          spacing: 'comfortable',
          widths: {}
        }
      },
      layout_options: {
        tabular: {
          fields: fields,
          spacing: 'comfortable',
          widths: {}
        }
      }
    };
    
    // Set widths for all fields
    fields.forEach(field => {
      presetData.layout_query.tabular.widths[field] = 200;
      presetData.layout_options.tabular.widths[field] = 200;
    });
    
    await axios.post(
      `${DIRECTUS_URL}/presets`,
      presetData,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log(`  ✓ Created preset for ${collection} with ${fields.length} fields`);
  } catch (error) {
    console.error(`  ✗ Error creating preset for ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function setupTableLayouts() {
  console.log('🔧 Setting up table layouts to show ALL fields...\n');
  await authenticate();
  
  const collections = [
    'scooters',
    'clients',
    'rentals',
    'communications',
    'maintenance_records'
  ];
  
  for (const collection of collections) {
    console.log(`\n📊 Processing ${collection}...`);
    const fields = await getFields(collection);
    console.log(`   Found ${fields.length} fields`);
    
    await updateCollectionLayout(collection, fields);
    await createPreset(collection, fields);
  }
  
  console.log('\n\n✅ All table layouts configured!');
  console.log('\n💡 ВАЖНО: Обновите страницу в браузере (F5 или Ctrl+R)');
  console.log('🌐 http://localhost:8055/admin/content/scooters');
  console.log('\n📋 Теперь все поля будут видны в таблице!');
}

setupTableLayouts().catch(console.error);

