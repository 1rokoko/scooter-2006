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

async function createCollection(collectionData) {
  try {
    await axios.post(`${DIRECTUS_URL}/collections`, collectionData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✓ Collection "${collectionData.collection}" created`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`⚠ Collection "${collectionData.collection}" exists`);
    } else {
      console.error(`✗ Error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

async function createField(collection, fieldData) {
  try {
    await axios.post(`${DIRECTUS_URL}/fields/${collection}`, fieldData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`  ✓ ${fieldData.field}`);
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠ ${fieldData.field} exists`);
    } else {
      console.error(`  ✗ ${fieldData.field}: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

async function setupSchema() {
  console.log('🚀 Starting schema setup...\n');
  await authenticate();
  
  // ========== COLLECTIONS ==========
  console.log('\n📦 Creating Collections...');
  
  await createCollection({
    collection: 'clients',
    meta: {
      icon: 'people_alt',
      note: 'База клиентов',
      display_template: '{{first_name}} {{last_name}}',
      archive_field: 'status',
      archive_value: 'archived',
      sort_field: 'last_name'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'scooters',
    meta: {
      icon: 'two_wheeler',
      note: 'Скутеры и мотоциклы',
      display_template: '{{model}} {{year}} ({{scooter_number_old}})',
      archive_field: 'status',
      archive_value: 'retired',
      sort_field: 'scooter_number_old'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'communications',
    meta: {
      icon: 'chat',
      note: 'Коммуникации с клиентами',
      display_template: '{{communication_type}} - {{subject}}',
      sort_field: 'communication_date'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'rentals',
    meta: {
      icon: 'receipt_long',
      note: 'Аренды',
      display_template: '#{{rental_number}} - {{client_name}}',
      archive_field: 'status',
      archive_value: 'completed',
      sort_field: 'start_date'
    },
    schema: {}
  });
  
  await createCollection({
    collection: 'maintenance_records',
    meta: {
      icon: 'build',
      note: 'История обслуживания',
      display_template: '{{maintenance_type}} ({{maintenance_date}})',
      sort_field: 'maintenance_date'
    },
    schema: {}
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // ========== CLIENTS FIELDS ==========
  console.log('\n👤 Creating Clients fields...');
  
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
          { text: 'Активный', value: 'active', foreground: '#FFF', background: '#00C897' },
          { text: 'Неактивный', value: 'inactive', foreground: '#FFF', background: '#A2B5CD' },
          { text: 'Архив', value: 'archived', foreground: '#FFF', background: '#E35169' }
        ]
      },
      required: true,
      width: 'half'
    },
    schema: { default_value: 'active' }
  });
  
  await createField('clients', {
    field: 'first_name',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', note: 'Имя' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'last_name',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', note: 'Фамилия' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'email',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Email' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'phone_primary',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', note: 'Основной телефон' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'phone_secondary',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Дополнительный телефон' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'date_of_birth',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Дата рождения' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'address_street',
    type: 'string',
    meta: { interface: 'input', width: 'full', note: 'Адрес' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'address_city',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Город' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'address_postal_code',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Индекс' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'drivers_license_number',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Номер водительских прав' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'drivers_license_expiry',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Срок действия прав' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'emergency_contact_name',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Контакт для экстренной связи' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'emergency_contact_phone',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Телефон экстренного контакта' },
    schema: {}
  });
  
  await createField('clients', {
    field: 'notes',
    type: 'text',
    meta: { interface: 'input-rich-text-md', width: 'full', note: 'Заметки' },
    schema: {}
  });
  
  console.log('\n✅ Clients fields created!');
  console.log('\n🛵 Creating Scooters fields (this will take a while)...');

  // Load scooter fields
  const scooterFields = require('./scooter-fields.js');
  const scooterPricingFields = require('./scooter-pricing-fields.js');

  // Create field groups first
  await createField('scooters', {
    field: 'basic_info',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'info'
      },
      note: 'Основная информация'
    }
  });

  await createField('scooters', {
    field: 'current_rental',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'event'
      },
      note: 'Текущая аренда'
    }
  });

  await createField('scooters', {
    field: 'maintenance_engine',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'settings'
      },
      note: 'Обслуживание - Двигатель'
    }
  });

  await createField('scooters', {
    field: 'maintenance_brakes',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'build'
      },
      note: 'Обслуживание - Тормоза'
    }
  });

  await createField('scooters', {
    field: 'documents',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'description'
      },
      note: 'Документы'
    }
  });

  await createField('scooters', {
    field: 'components',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'inventory'
      },
      note: 'Компоненты'
    }
  });

  await createField('scooters', {
    field: 'photos',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'photo_library'
      },
      note: 'Фотографии'
    }
  });

  await createField('scooters', {
    field: 'pricing_basic',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'attach_money'
      },
      note: 'Цены - Базовые'
    }
  });

  await createField('scooters', {
    field: 'pricing_daily',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'today'
      },
      note: 'Цены - По дням'
    }
  });

  await createField('scooters', {
    field: 'pricing_monthly',
    type: 'alias',
    meta: {
      interface: 'group-detail',
      special: ['group'],
      options: {
        headerIcon: 'calendar_month'
      },
      note: 'Цены - По месяцам'
    }
  });

  // Create all scooter fields
  for (const field of scooterFields) {
    await createField('scooters', field);
  }

  // Create all pricing fields
  for (const field of scooterPricingFields) {
    await createField('scooters', field);
  }

  console.log('\n✅ Scooters fields created!');
  console.log('\n💬 Creating Communications fields...');

  // Communications fields
  await createField('communications', {
    field: 'client',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      required: true,
      width: 'half',
      note: 'Клиент',
      display: 'related-values',
      display_options: {
        template: '{{first_name}} {{last_name}}'
      }
    },
    schema: {}
  });

  await createField('communications', {
    field: 'communication_type',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Телефон', value: 'phone_call' },
          { text: 'Email', value: 'email' },
          { text: 'SMS', value: 'sms' },
          { text: 'Лично', value: 'in_person' },
          { text: 'WhatsApp', value: 'whatsapp' },
          { text: 'Другое', value: 'other' }
        ]
      },
      required: true,
      width: 'half',
      note: 'Тип коммуникации'
    },
    schema: {}
  });

  await createField('communications', {
    field: 'direction',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Входящий', value: 'inbound' },
          { text: 'Исходящий', value: 'outbound' }
        ]
      },
      required: true,
      width: 'half',
      note: 'Направление'
    },
    schema: {}
  });

  await createField('communications', {
    field: 'subject',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Тема'
    },
    schema: {}
  });

  await createField('communications', {
    field: 'content',
    type: 'text',
    meta: {
      interface: 'input-rich-text-md',
      required: true,
      width: 'full',
      note: 'Содержание'
    },
    schema: {}
  });

  await createField('communications', {
    field: 'communication_date',
    type: 'timestamp',
    meta: {
      interface: 'datetime',
      required: true,
      width: 'half',
      note: 'Дата коммуникации'
    },
    schema: {}
  });

  await createField('communications', {
    field: 'follow_up_required',
    type: 'boolean',
    meta: {
      interface: 'boolean',
      width: 'half',
      note: 'Требуется последующий контакт'
    },
    schema: { default_value: false }
  });

  await createField('communications', {
    field: 'follow_up_date',
    type: 'date',
    meta: {
      interface: 'datetime',
      width: 'half',
      note: 'Дата последующего контакта'
    },
    schema: {}
  });

  console.log('\n✅ All collections and fields created successfully!');
  console.log('\n🎉 Schema setup complete!');
  console.log('\n📊 Summary:');
  console.log('  - Clients collection with 14 fields');
  console.log('  - Scooters collection with 60+ fields');
  console.log('  - Communications collection with 8 fields');
  console.log('  - Rentals collection (ready for fields)');
  console.log('  - Maintenance_records collection (ready for fields)');
  console.log('\n🌐 Access Directus at: http://localhost:8055');
  console.log('📧 Email: seocos@gmail.com');
  console.log('🔑 Password: directus2024!');
}

setupSchema().catch(console.error);

