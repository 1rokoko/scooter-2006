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

async function getAdminRole() {
  try {
    const response = await axios.get(
      `${DIRECTUS_URL}/roles`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    const adminRole = response.data.data.find(role => role.admin_access === true);
    console.log(`✓ Found admin role: ${adminRole.id} (${adminRole.name})`);
    return adminRole.id;
  } catch (error) {
    console.error('✗ Error getting roles:', error.response?.data || error.message);
    return null;
  }
}

async function createPermission(roleId, collection) {
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: roleId,
        collection: collection,
        action: 'create',
        permissions: {},
        fields: ['*']
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Created CREATE permission for ${collection}`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`  ⚠ Permission already exists for ${collection}`);
    } else {
      console.error(`  ✗ Error:`, error.response?.data?.errors?.[0]?.message);
    }
  }
  
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: roleId,
        collection: collection,
        action: 'read',
        permissions: {},
        fields: ['*']
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Created READ permission for ${collection}`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`  ⚠ Permission already exists`);
    }
  }
  
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: roleId,
        collection: collection,
        action: 'update',
        permissions: {},
        fields: ['*']
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Created UPDATE permission for ${collection}`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`  ⚠ Permission already exists`);
    }
  }
  
  try {
    await axios.post(
      `${DIRECTUS_URL}/permissions`,
      {
        role: roleId,
        collection: collection,
        action: 'delete',
        permissions: {},
        fields: ['*']
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log(`  ✓ Created DELETE permission for ${collection}`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`  ⚠ Permission already exists`);
    }
  }
}

async function addFieldsToLeads() {
  const fields = [
    {
      field: 'name',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Имя лида',
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
        note: 'Номер телефона',
        required: false
      },
      schema: {}
    },
    {
      field: 'telegram_account',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Telegram аккаунт',
        required: false
      },
      schema: {}
    },
    {
      field: 'email',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
        note: 'Email',
        required: false
      },
      schema: {}
    },
    {
      field: 'all_conversation',
      type: 'text',
      meta: {
        interface: 'input-rich-text-md',
        width: 'full',
        note: 'История коммуникаций',
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
        note: 'Статус лида',
        required: true,
        options: {
          choices: [
            { text: 'Новый', value: 'new' },
            { text: 'В работе', value: 'in_progress' },
            { text: 'Конвертирован', value: 'converted' }
          ]
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
        note: 'Заметки',
        required: false
      },
      schema: {}
    }
  ];
  
  console.log('\n📝 Adding fields to leads collection...');
  for (const fieldData of fields) {
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/leads`,
        fieldData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`  ✓ Created field: ${fieldData.field}`);
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        console.log(`  ⚠ Field ${fieldData.field} already exists`);
      } else {
        console.error(`  ✗ Error creating ${fieldData.field}:`, error.response?.data?.errors?.[0]?.message);
      }
    }
  }
}

async function main() {
  console.log('🔧 Fixing leads collection permissions...\n');
  await authenticate();
  
  const adminRoleId = await getAdminRole();
  if (!adminRoleId) {
    console.error('✗ Could not find admin role');
    return;
  }
  
  console.log('\n📋 Creating permissions for leads collection...');
  await createPermission(adminRoleId, 'leads');
  
  await addFieldsToLeads();
  
  console.log('\n✅ Permissions fixed! You can now access leads collection.');
}

main().catch(console.error);

