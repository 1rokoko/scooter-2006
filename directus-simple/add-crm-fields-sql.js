const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding CRM fields via SQL...\n');

db.serialize(() => {
  // Add fields to leads table
  console.log('📝 Adding fields to leads table...\n');

  const leadsFields = [
    { name: 'name', type: 'varchar(255)' },
    { name: 'client_phone', type: 'varchar(50)' },
    { name: 'telegram_account', type: 'varchar(100)' },
    { name: 'email', type: 'varchar(255)' },
    { name: 'all_conversation', type: 'TEXT' },
    { name: 'status', type: 'varchar(50)' },
    { name: 'notes', type: 'TEXT' }
  ];

  leadsFields.forEach(field => {
    db.run(`ALTER TABLE leads ADD COLUMN ${field.name} ${field.type}`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error(`❌ Error adding ${field.name}:`, err.message);
      } else if (!err) {
        console.log(`✅ Added ${field.name} to leads`);
      }
    });
  });

  // Add fields to clients table
  setTimeout(() => {
    console.log('\n📝 Adding fields to clients table...\n');

    db.run(`ALTER TABLE clients ADD COLUMN converted_from_lead_id INTEGER`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('❌ Error adding converted_from_lead_id:', err.message);
      } else if (!err) {
        console.log('✅ Added converted_from_lead_id to clients');
      }
    });

    // Add fields to scooters table
    setTimeout(() => {
      console.log('\n📝 Adding fields to scooters table...\n');

      db.run(`ALTER TABLE scooters ADD COLUMN client_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Error adding client_id:', err.message);
        } else if (!err) {
          console.log('✅ Added client_id to scooters');
        }

        // Set default status for leads
        setTimeout(() => {
          console.log('\n📝 Setting default values...\n');

          db.run(`UPDATE leads SET status = 'новый' WHERE status IS NULL`, (err) => {
            if (err) {
              console.error('❌ Error setting default status:', err.message);
            } else {
              console.log('✅ Set default status for leads');
            }

            // Verify changes
            setTimeout(() => {
              console.log('\n🔍 Verifying changes...\n');

              db.all(`PRAGMA table_info(leads)`, (err, columns) => {
                if (err) {
                  console.error('❌ Error verifying leads:', err);
                } else {
                  console.log(`📋 Leads table now has ${columns.length} columns:`);
                  columns.forEach(col => {
                    console.log(`  - ${col.name}`);
                  });
                }

                setTimeout(() => {
                  db.all(`PRAGMA table_info(clients)`, (err, columns) => {
                    if (err) {
                      console.error('❌ Error verifying clients:', err);
                    } else {
                      console.log(`\n📋 Clients table now has ${columns.length} columns`);
                    }

                    setTimeout(() => {
                      db.all(`PRAGMA table_info(scooters)`, (err, columns) => {
                        if (err) {
                          console.error('❌ Error verifying scooters:', err);
                        } else {
                          console.log(`📋 Scooters table now has ${columns.length} columns`);
                        }

                        setTimeout(() => {
                          console.log('\n✅ All CRM fields added successfully!');
                          console.log('\nPlease restart Directus to see all changes.');
                          db.close();
                        }, 500);
                      });
                    }, 500);
                  });
                }, 500);
              });
            }, 500);
          });
        }, 500);
      });
    }, 1000);
  }, 1000);
});

