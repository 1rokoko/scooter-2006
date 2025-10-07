// Pricing fields for scooters
module.exports = [
  // ========== PHOTOS ==========
  {
    field: 'main_photo',
    type: 'uuid',
    meta: {
      interface: 'file-image',
      width: 'half',
      note: 'Главное фото',
      group: 'photos'
    },
    schema: {}
  },
  
  {
    field: 'photo_link',
    type: 'string',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Ссылка на фото',
      group: 'photos'
    },
    schema: {}
  },
  
  {
    field: 'photos',
    type: 'alias',
    meta: {
      interface: 'files',
      special: ['files'],
      width: 'full',
      note: 'Дополнительные фото',
      group: 'photos'
    }
  },
  
  // ========== BASIC PRICING ==========
  {
    field: 'price',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Базовая цена',
      group: 'pricing_basic'
    },
    schema: {}
  },
  
  {
    field: 'price_1_year_rent',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '1 year rent',
      group: 'pricing_basic'
    },
    schema: {}
  },
  
  {
    field: 'price_6_month_high_season',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '6 month high season',
      group: 'pricing_basic'
    },
    schema: {}
  },
  
  {
    field: 'price_6_month_low_season',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '6 month low season',
      group: 'pricing_basic'
    },
    schema: {}
  },
  
  // ========== DAILY PRICING ==========
  {
    field: 'price_1_3_days',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '1-3 days',
      group: 'pricing_daily'
    },
    schema: {}
  },
  
  {
    field: 'price_4_7_days',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '4-7 days',
      group: 'pricing_daily'
    },
    schema: {}
  },
  
  {
    field: 'price_7_14_days',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '7-14 days',
      group: 'pricing_daily'
    },
    schema: {}
  },
  
  {
    field: 'price_15_25_days',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: '15-25 days',
      group: 'pricing_daily'
    },
    schema: {}
  },
  
  // ========== MONTHLY PRICING ==========
  {
    field: 'price_december',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'December',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_january',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'January',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_february',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'February',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_march',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'March',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_april',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'April',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_may',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'May',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_summer',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'Summer',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_september',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'September',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_october',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'October',
      group: 'pricing_monthly'
    },
    schema: {}
  },
  
  {
    field: 'price_november',
    type: 'decimal',
    meta: {
      interface: 'input',
      width: 'half',
      note: 'November',
      group: 'pricing_monthly'
    },
    schema: {}
  }
];

