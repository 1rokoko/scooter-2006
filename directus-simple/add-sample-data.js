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

async function createItem(collection, data) {
  try {
    const response = await axios.post(
      `${DIRECTUS_URL}/items/${collection}`,
      data,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log(`  ✓ Created ${collection} item`);
    return response.data.data;
  } catch (error) {
    console.error(`  ✗ Failed to create ${collection}:`, error.response?.data?.errors?.[0]?.message || error.message);
    return null;
  }
}

async function addSampleData() {
  console.log('📝 Adding sample data...\n');
  await authenticate();
  
  console.log('\n👤 Creating sample clients...');
  
  const client1 = await createItem('clients', {
    status: 'active',
    first_name: 'Иван',
    last_name: 'Петров',
    email: 'ivan.petrov@example.com',
    phone_primary: '+66 81 234 5678',
    phone_secondary: '+66 91 234 5678',
    date_of_birth: '1990-05-15',
    address_street: '123 Beach Road',
    address_city: 'Phuket',
    address_postal_code: '83000',
    drivers_license_number: 'DL123456',
    drivers_license_expiry: '2026-12-31',
    emergency_contact_name: 'Мария Петрова',
    emergency_contact_phone: '+66 82 345 6789',
    notes: 'Постоянный клиент, предпочитает скутеры Honda'
  });
  
  const client2 = await createItem('clients', {
    status: 'active',
    first_name: 'Anna',
    last_name: 'Schmidt',
    email: 'anna.schmidt@example.com',
    phone_primary: '+66 89 876 5432',
    date_of_birth: '1985-08-22',
    address_city: 'Patong',
    drivers_license_number: 'DL789012',
    drivers_license_expiry: '2025-06-30',
    notes: 'Турист, долгосрочная аренда'
  });
  
  console.log('\n🛵 Creating sample scooters...');
  
  const scooter1 = await createItem('scooters', {
    status: 'available',
    power: '125cc',
    model: 'Honda PCX',
    year: 2022,
    color: 'Черный',
    scooter_number_old: 'PCX-001',
    sticker: 'Наклейка 001',
    rental_sticker: 'Rent sticker A',
    oil_change_km: 5000,
    gear_oil_km: 8000,
    front_brakes_km: 10000,
    rear_brakes_km: 10000,
    air_filter_km: 6000,
    spark_plugs_km: 8000,
    tech_passport_date: '2025-12-31',
    insurance_date: '2025-06-30',
    cigarette_lighter: true,
    front_tire: 'Michelin City Grip',
    rear_tire: 'Michelin City Grip',
    battery: 'Yuasa YTX7A-BS',
    sinotrack_gps: 'ST-901',
    price: 3500,
    price_1_year_rent: 35000,
    price_6_month_high_season: 20000,
    price_6_month_low_season: 15000,
    price_1_3_days: 300,
    price_4_7_days: 280,
    price_7_14_days: 250,
    price_15_25_days: 230,
    price_december: 350,
    price_january: 350,
    price_february: 320,
    price_march: 300,
    price_april: 280,
    price_may: 250,
    price_summer: 200,
    price_september: 250,
    price_october: 280,
    price_november: 320
  });
  
  const scooter2 = await createItem('scooters', {
    status: 'available',
    power: '150cc',
    model: 'Yamaha Aerox',
    year: 2023,
    color: 'Синий',
    scooter_number_old: 'AER-002',
    sticker: 'Наклейка 002',
    rental_sticker: 'Rent sticker B',
    oil_change_km: 3000,
    gear_oil_km: 5000,
    front_brakes_km: 8000,
    rear_brakes_km: 8000,
    air_filter_km: 4000,
    spark_plugs_km: 6000,
    tech_passport_date: '2026-03-31',
    insurance_date: '2025-09-30',
    cigarette_lighter: true,
    front_tire: 'Pirelli Angel Scooter',
    rear_tire: 'Pirelli Angel Scooter',
    battery: 'Yuasa YTX9-BS',
    sinotrack_gps: 'ST-902',
    price: 4000,
    price_1_year_rent: 40000,
    price_6_month_high_season: 23000,
    price_6_month_low_season: 18000,
    price_1_3_days: 350,
    price_4_7_days: 330,
    price_7_14_days: 300,
    price_15_25_days: 280,
    price_december: 400,
    price_january: 400,
    price_february: 370,
    price_march: 350,
    price_april: 330,
    price_may: 300,
    price_summer: 250,
    price_september: 300,
    price_october: 330,
    price_november: 370
  });
  
  console.log('\n💬 Creating sample communications...');
  
  if (client1) {
    await createItem('communications', {
      client: client1.id,
      communication_type: 'phone_call',
      direction: 'inbound',
      subject: 'Запрос на аренду',
      content: 'Клиент интересуется долгосрочной арендой скутера на 3 месяца',
      communication_date: new Date().toISOString(),
      follow_up_required: true,
      follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  console.log('\n📋 Creating sample rental...');
  
  if (client1 && scooter1) {
    const rental = await createItem('rentals', {
      status: 'active',
      rental_number: 'R-2025-001',
      client: client1.id,
      scooter: scooter1.id,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      rental_rate: 280,
      total_amount: 1960,
      deposit_paid: 3000,
      payment_status: 'paid',
      payment_method: 'cash',
      notes: 'Клиент взял скутер на неделю, оплата наличными'
    });
    
    // Update scooter status
    if (rental) {
      await axios.patch(
        `${DIRECTUS_URL}/items/scooters/${scooter1.id}`,
        {
          status: 'rented',
          client_name: 'Иван Петров',
          client_phone: '+66 81 234 5678',
          rental_start: new Date().toISOString().split('T')[0],
          rental_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log('  ✓ Updated scooter status to rented');
    }
  }
  
  console.log('\n🔧 Creating sample maintenance record...');
  
  if (scooter2) {
    await createItem('maintenance_records', {
      scooter: scooter2.id,
      maintenance_type: 'oil_change',
      maintenance_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mileage_at_service: 3000,
      description: 'Замена масла двигателя и масляного фильтра',
      parts_replaced: 'Масло Motul 5100 10W-40, масляный фильтр',
      cost_parts: 800,
      cost_labor: 200,
      cost_total: 1000,
      service_provider: 'Phuket Scooter Service',
      notes: 'Плановое обслуживание'
    });
  }
  
  console.log('\n✅ Sample data added successfully!');
  console.log('\n📊 Summary:');
  console.log('  ✓ 2 clients created');
  console.log('  ✓ 2 scooters created');
  console.log('  ✓ 1 communication logged');
  console.log('  ✓ 1 active rental created');
  console.log('  ✓ 1 maintenance record added');
  console.log('\n🌐 Access Directus at: http://localhost:8055');
  console.log('📧 Email: seocos@gmail.com');
  console.log('🔑 Password: directus2024!');
}

addSampleData().catch(console.error);

