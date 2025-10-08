const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking leads table structure...\n');

// Get table structure
db.all(`PRAGMA table_info(leads)`, (err, columns) => {
  if (err) {
    console.error('❌ Error getting table structure:', err);
    db.close();
    return;
  }

  console.log('📋 Columns in leads table:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  console.log('');

  // Check directus_fields for leads collection
  db.all(`SELECT field, type, schema FROM directus_fields WHERE collection = 'leads'`, (err, fields) => {
    if (err) {
      console.error('❌ Error getting directus_fields:', err);
    } else {
      console.log(`📋 Fields registered in directus_fields for leads (${fields.length} fields):`);
      fields.forEach(f => {
        console.log(`  - ${f.field} (${f.type})`);
      });
    }
    
    setTimeout(() => {
      db.close();
    }, 500);
  });
});

