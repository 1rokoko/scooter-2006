// Scooter fields configuration based on user requirements
module.exports = [
  // ========== BASIC INFO ==========
  {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: [
          { text: 'Доступен', value: 'available' },
          { text: 'В аренде', value: 'rented' },
          { text: 'На обслуживании', value: 'maintenance' },
          { text: 'Списан', value: 'retired' }
        ]
      },
      display: 'labels',
      display_options: {
        choices: [
          { text: 'Доступен', value: 'available', foreground: '#FFF', background: '#00C897' },
          { text: 'В аренде', value: 'rented', foreground: '#FFF', background: '#2ECDA7' },
          { text: 'На обслуживании', value: 'maintenance', foreground: '#FFF', background: '#FFA439' },
          { text: 'Списан', value: 'retired', foreground: '#FFF', background: '#E35169' }
        ]
      },
      required: true,
      width: 'half',
      group: 'basic_info'
    },
    schema: { default_value: 'available' }
  },
  
  {
    field: 'power',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Мощность', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'model',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', note: 'Модель', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'year',
    type: 'integer',
    meta: { interface: 'input', required: true, width: 'half', note: 'Год выпуска', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'color',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Цвет', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'scooter_number_old',
    type: 'string',
    meta: { interface: 'input', required: true, width: 'half', note: 'Номер скутера (старый)', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'sticker',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Наклейка', group: 'basic_info' },
    schema: {}
  },
  
  {
    field: 'rental_sticker',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Наклейка о аренде', group: 'basic_info' },
    schema: {}
  },
  
  // ========== CURRENT RENTAL INFO ==========
  {
    field: 'client_name',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Имя клиента (текущая аренда)', group: 'current_rental' },
    schema: {}
  },
  
  {
    field: 'client_phone',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Номер клиента', group: 'current_rental' },
    schema: {}
  },
  
  {
    field: 'rental_start',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Начало аренды', group: 'current_rental' },
    schema: {}
  },
  
  {
    field: 'rental_end',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Конец аренды', group: 'current_rental' },
    schema: {}
  },
  
  // ========== MAINTENANCE - ENGINE ==========
  {
    field: 'oil_change_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Дата замены масла двигателя', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'oil_change_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Масло движ км', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'gear_oil_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Дата замены gear oil', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'gear_oil_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Gear oil км', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'radiator_water_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Вода радиатор дата', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'radiator_water_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Вода радиатор км', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'air_filter_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Воздушный фильтр дата', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'air_filter_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Воздушный фильтр км', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'spark_plugs_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Свечи дата', group: 'maintenance_engine' },
    schema: {}
  },
  
  {
    field: 'spark_plugs_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Свечи км', group: 'maintenance_engine' },
    schema: {}
  },
  
  // ========== MAINTENANCE - BRAKES ==========
  {
    field: 'front_brakes_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Тормоза передние дата', group: 'maintenance_brakes' },
    schema: {}
  },
  
  {
    field: 'front_brakes_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Тормоза передние км', group: 'maintenance_brakes' },
    schema: {}
  },
  
  {
    field: 'rear_brakes_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Тормоза задние дата', group: 'maintenance_brakes' },
    schema: {}
  },
  
  {
    field: 'rear_brakes_km',
    type: 'integer',
    meta: { interface: 'input', width: 'half', note: 'Тормоза задние км', group: 'maintenance_brakes' },
    schema: {}
  },
  
  {
    field: 'rear_disc_note',
    type: 'text',
    meta: { interface: 'input-multiline', width: 'full', note: 'Задний диск (заметка)', group: 'maintenance_brakes' },
    schema: {}
  },
  
  // ========== DOCUMENTS ==========
  {
    field: 'tech_passport_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Тех талон дата', group: 'documents' },
    schema: {}
  },
  
  {
    field: 'insurance_date',
    type: 'date',
    meta: { interface: 'datetime', width: 'half', note: 'Страховка дата', group: 'documents' },
    schema: {}
  },
  
  // ========== COMPONENTS ==========
  {
    field: 'cigarette_lighter',
    type: 'boolean',
    meta: { interface: 'boolean', width: 'half', note: 'Прикуриватель', group: 'components' },
    schema: { default_value: false }
  },
  
  {
    field: 'front_bearing',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Передний подшипник', group: 'components' },
    schema: {}
  },
  
  {
    field: 'rear_bearing',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Задний подшипник', group: 'components' },
    schema: {}
  },
  
  {
    field: 'front_tire',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Резина передняя', group: 'components' },
    schema: {}
  },
  
  {
    field: 'rear_tire',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Резина задняя', group: 'components' },
    schema: {}
  },
  
  {
    field: 'battery',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Батарея', group: 'components' },
    schema: {}
  },
  
  {
    field: 'belt',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Ремень', group: 'components' },
    schema: {}
  },
  
  {
    field: 'starter',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Стартер', group: 'components' },
    schema: {}
  },
  
  {
    field: 'gasket',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Прокладка', group: 'components' },
    schema: {}
  },
  
  {
    field: 'water',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Вода', group: 'components' },
    schema: {}
  },
  
  {
    field: 'sinotrack_gps',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'Sinotrack GPS', group: 'components' },
    schema: {}
  }
];

