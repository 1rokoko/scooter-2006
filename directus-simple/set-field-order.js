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

async function updateFieldSort(collection, field, sort) {
  try {
    await axios.patch(
      `${DIRECTUS_URL}/fields/${collection}/${field}`,
      {
        meta: {
          sort: sort
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
  } catch (error) {
    console.error(`  ✗ Error updating ${field}:`, error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function setFieldOrder() {
  console.log('🔧 Setting field order for better display...\n');
  await authenticate();
  
  console.log('📊 Scooters - setting field order...');
  
  // Define the order for scooters fields
  const scootersOrder = [
    'id',
    'scooter_number_old', // КЛЮЧЕВОЕ ПОЛЕ - первое!
    'status',
    'model',
    'year',
    'power',
    'color',
    'sticker',
    'rental_sticker',
    // Current rental
    'client_name',
    'client_phone',
    'rental_start',
    'rental_end',
    // Maintenance - Engine
    'oil_change_km',
    'oil_change_date',
    'gear_oil_km',
    'gear_oil_date',
    'radiator_water_km',
    'radiator_water_date',
    'air_filter_km',
    'air_filter_date',
    'spark_plugs_km',
    'spark_plugs_date',
    // Maintenance - Brakes
    'front_brakes_km',
    'front_brakes_date',
    'rear_brakes_km',
    'rear_brakes_date',
    'rear_disc_note',
    // Documents
    'tech_passport_date',
    'insurance_date',
    // Components
    'cigarette_lighter',
    'front_bearing',
    'rear_bearing',
    'front_tire',
    'rear_tire',
    'battery',
    'belt',
    'starter',
    'gasket',
    'water',
    'sinotrack_gps',
    // Photos
    'main_photo',
    'photo_link',
    // Pricing - Basic
    'price',
    'price_1_year_rent',
    'price_6_month_high_season',
    'price_6_month_low_season',
    // Pricing - Daily
    'price_1_3_days',
    'price_4_7_days',
    'price_7_14_days',
    'price_15_25_days',
    // Pricing - Monthly
    'price_december',
    'price_january',
    'price_february',
    'price_march',
    'price_april',
    'price_may',
    'price_summer',
    'price_september',
    'price_october',
    'price_november'
  ];
  
  for (let i = 0; i < scootersOrder.length; i++) {
    await updateFieldSort('scooters', scootersOrder[i], i + 1);
  }
  console.log(`  ✓ Set order for ${scootersOrder.length} fields`);
  
  console.log('\n📊 Clients - setting field order...');
  const clientsOrder = [
    'id',
    'status',
    'first_name',
    'last_name',
    'phone_primary',
    'phone_secondary',
    'email',
    'date_of_birth',
    'address_street',
    'address_city',
    'address_postal_code',
    'drivers_license_number',
    'drivers_license_expiry',
    'emergency_contact_name',
    'emergency_contact_phone',
    'notes'
  ];
  
  for (let i = 0; i < clientsOrder.length; i++) {
    await updateFieldSort('clients', clientsOrder[i], i + 1);
  }
  console.log(`  ✓ Set order for ${clientsOrder.length} fields`);
  
  console.log('\n📊 Rentals - setting field order...');
  const rentalsOrder = [
    'id',
    'rental_number',
    'status',
    'client',
    'scooter',
    'start_date',
    'end_date',
    'actual_return_date',
    'rental_rate',
    'total_amount',
    'deposit_paid',
    'payment_status',
    'payment_method',
    'notes'
  ];
  
  for (let i = 0; i < rentalsOrder.length; i++) {
    await updateFieldSort('rentals', rentalsOrder[i], i + 1);
  }
  console.log(`  ✓ Set order for ${rentalsOrder.length} fields`);
  
  console.log('\n📊 Communications - setting field order...');
  const communicationsOrder = [
    'id',
    'client',
    'communication_type',
    'direction',
    'communication_date',
    'subject',
    'content',
    'follow_up_required',
    'follow_up_date'
  ];
  
  for (let i = 0; i < communicationsOrder.length; i++) {
    await updateFieldSort('communications', communicationsOrder[i], i + 1);
  }
  console.log(`  ✓ Set order for ${communicationsOrder.length} fields`);
  
  console.log('\n📊 Maintenance Records - setting field order...');
  const maintenanceOrder = [
    'id',
    'scooter',
    'maintenance_type',
    'maintenance_date',
    'mileage_at_service',
    'description',
    'parts_replaced',
    'cost_parts',
    'cost_labor',
    'cost_total',
    'service_provider',
    'notes'
  ];
  
  for (let i = 0; i < maintenanceOrder.length; i++) {
    await updateFieldSort('maintenance_records', maintenanceOrder[i], i + 1);
  }
  console.log(`  ✓ Set order for ${maintenanceOrder.length} fields`);
  
  console.log('\n\n✅ Field order configured!');
  console.log('\n💡 Обновите страницу в браузере (F5)');
  console.log('🌐 http://localhost:8055/admin/content/scooters');
}

setFieldOrder().catch(console.error);

