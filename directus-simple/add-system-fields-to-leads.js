const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding system fields to leads table...\n');

db.serialize(() => {
  // Add created_at field
  console.log('Adding created_at field...');
  db.run(`ALTER TABLE leads ADD COLUMN created_at datetime`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding created_at:', err);
    } else {
      console.log('✅ created_at field added\n');
    }
  });

  // Add updated_at field
  console.log('Adding updated_at field...');
  db.run(`ALTER TABLE leads ADD COLUMN updated_at datetime`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding updated_at:', err);
    } else {
      console.log('✅ updated_at field added\n');
    }
  });

  // Add user_created field
  console.log('Adding user_created field...');
  db.run(`ALTER TABLE leads ADD COLUMN user_created char(36)`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding user_created:', err);
    } else {
      console.log('✅ user_created field added\n');
    }
  });

  // Add user_updated field
  console.log('Adding user_updated field...');
  db.run(`ALTER TABLE leads ADD COLUMN user_updated char(36)`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding user_updated:', err);
    } else {
      console.log('✅ user_updated field added\n');
    }

    // Update existing records with current timestamp
    setTimeout(() => {
      console.log('Updating existing records with current timestamp...');
      db.run(`UPDATE leads SET created_at = datetime('now'), updated_at = datetime('now') WHERE created_at IS NULL`, (err) => {
        if (err) {
          console.error('❌ Error updating timestamps:', err);
        } else {
          console.log('✅ Timestamps updated for existing records\n');
        }

        // Verify
        setTimeout(() => {
          db.all(`PRAGMA table_info(leads)`, (err, columns) => {
            if (err) {
              console.error('❌ Error verifying:', err);
            } else {
              console.log('📋 Updated leads table structure:');
              columns.forEach(col => {
                console.log(`  - ${col.name} (${col.type})`);
              });
            }
            
            setTimeout(() => {
              console.log('\n✅ System fields added! Please restart Directus.');
              db.close();
            }, 500);
          });
        }, 500);
      });
    }, 1000);
  });
});

