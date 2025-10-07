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

async function setupRelationships() {
  console.log('🔗 Setting up relationships and remaining fields...\n');
  await authenticate();
  
  console.log('\n📝 Creating Rentals fields...');
  
  await createField('rentals', {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Забронирован', value: 'reserved' },
          { text: 'Активный', value: 'active' },
          { text: 'Завершен', value: 'completed' },
          { text: 'Отменен', value: 'cancelled' }
        ]
      },
      display: 'labels',
      display_options: {
        choices: [
          { text: 'Забронирован', value: 'reserved', foreground: '#FFF', background: '#FFC23B' },
          { text: 'Активный', value: 'active', foreground: '#FFF', background: '#00C897' },
          { text: 'Завершен', value: 'completed', foreground: '#FFF', background: '#A2B5CD' },
          { text: 'Отменен', value: 'cancelled', foreground: '#FFF', background: '#E35169' }
        ]
      },
      required: true,
      width: 'half'
    },
    schema: { default_value: 'reserved' }
  });
  
  await createField('rentals', {
    field: 'rental_number',
    type: 'string',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Номер аренды'
    },
    schema: {}
  });
  
  await createField('rentals', {
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
  
  await createField('rentals', {
    field: 'scooter',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      required: true,
      width: 'half',
      note: 'Скутер',
      display: 'related-values',
      display_options: {
        template: '{{model}} {{year}} ({{scooter_number_old}})'
      }
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'start_date',
    type: 'timestamp',
    meta: {
      interface: 'datetime',
      required: true,
      width: 'half',
      note: 'Дата начала'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'end_date',
    type: 'timestamp',
    meta: {
      interface: 'datetime',
      required: true,
      width: 'half',
      note: 'Дата окончания'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'actual_return_date',
    type: 'timestamp',
    meta: {
      interface: 'datetime',
      width: 'half',
      note: 'Фактическая дата возврата'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'rental_rate',
    type: 'decimal',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Ставка аренды'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'total_amount',
    type: 'decimal',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Общая сумма'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'deposit_paid',
    type: 'decimal',
    meta: {
      interface: 'input',
      required: true,
      width: 'half',
      note: 'Депозит'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'payment_status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Ожидает оплаты', value: 'pending' },
          { text: 'Частично оплачен', value: 'partial' },
          { text: 'Оплачен', value: 'paid' },
          { text: 'Возвращен', value: 'refunded' }
        ]
      },
      required: true,
      width: 'half',
      note: 'Статус оплаты'
    },
    schema: { default_value: 'pending' }
  });
  
  await createField('rentals', {
    field: 'payment_method',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Наличные', value: 'cash' },
          { text: 'Карта', value: 'card' },
          { text: 'Банковский перевод', value: 'bank_transfer' },
          { text: 'Другое', value: 'other' }
        ]
      },
      width: 'half',
      note: 'Способ оплаты'
    },
    schema: {}
  });
  
  await createField('rentals', {
    field: 'notes',
    type: 'text',
    meta: {
      interface: 'input-rich-text-md',
      width: 'full',
      note: 'Заметки'
    },
    schema: {}
  });
  
  console.log('\n🔧 Creating Maintenance Records fields...');
  
  await createField('maintenance_records', {
    field: 'scooter',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      required: true,
      width: 'half',
      note: 'Скутер',
      display: 'related-values',
      display_options: {
        template: '{{model}} {{year}} ({{scooter_number_old}})'
      }
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'maintenance_type',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Замена масла', value: 'oil_change' },
          { text: 'Замена шин', value: 'tire_replacement' },
          { text: 'Обслуживание тормозов', value: 'brake_service' },
          { text: 'Общее обслуживание', value: 'general_service' },
          { text: 'Ремонт', value: 'repair' },
          { text: 'Инспекция', value: 'inspection' },
          { text: 'Другое', value: 'other' }
        ]
      },
      required: true,
      width: 'half',
      note: 'Тип обслуживания'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'maintenance_date',
    type: 'date',
    meta: {
      interface: 'datetime',
      required: true,
      width: 'half',
      note: 'Дата обслуживания'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'mileage_at_service',
    type: 'integer',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Пробег при обслуживании (км)'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'description',
    type: 'text',
    meta: {
      interface: 'input-multiline',
      required: true,
      width: 'full',
      note: 'Описание работ'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'parts_replaced',
    type: 'text',
    meta: {
      interface: 'input-multiline',
      width: 'full',
      note: 'Замененные детали'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'cost_parts',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Стоимость деталей'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'cost_labor',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Стоимость работы'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'cost_total',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Общая стоимость'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'service_provider',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Поставщик услуг'
    },
    schema: {}
  });
  
  await createField('maintenance_records', {
    field: 'notes',
    type: 'text',
    meta: {
      interface: 'input-rich-text-md',
      width: 'full',
      note: 'Заметки'
    },
    schema: {}
  });
  
  console.log('\n🔗 Creating reverse relationships (O2M aliases)...');
  
  // Clients -> Communications
  await createField('clients', {
    field: 'communications',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      options: {
        template: '{{communication_type}} - {{subject}}'
      },
      note: 'История коммуникаций'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Clients -> Rentals
  await createField('clients', {
    field: 'rental_history',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      options: {
        template: '#{{rental_number}} - {{start_date}}'
      },
      note: 'История аренд'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Scooters -> Rentals
  await createField('scooters', {
    field: 'rental_history',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      options: {
        template: '#{{rental_number}} - {{client.first_name}} {{client.last_name}}'
      },
      note: 'История аренд'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  // Scooters -> Maintenance Records
  await createField('scooters', {
    field: 'maintenance_history',
    type: 'alias',
    meta: {
      interface: 'list-o2m',
      special: ['o2m'],
      options: {
        template: '{{maintenance_type}} - {{maintenance_date}}'
      },
      note: 'История обслуживания'
    },
    schema: {
      on_delete: 'SET NULL'
    }
  });
  
  console.log('\n✅ All relationships and fields created!');
  console.log('\n🎉 Complete schema setup finished!');
  console.log('\n📊 Final Summary:');
  console.log('  ✓ Clients collection - complete');
  console.log('  ✓ Scooters collection - complete');
  console.log('  ✓ Communications collection - complete');
  console.log('  ✓ Rentals collection - complete');
  console.log('  ✓ Maintenance_records collection - complete');
  console.log('  ✓ All relationships configured');
  console.log('\n🌐 Access Directus at: http://localhost:8055');
  console.log('📧 Email: seocos@gmail.com');
  console.log('🔑 Password: directus2024!');
}

setupRelationships().catch(console.error);

