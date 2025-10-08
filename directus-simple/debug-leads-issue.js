const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Debugging leads collection issue...\n');

// Check if leads collection exists
db.get(`SELECT * FROM directus_collections WHERE collection = 'leads'`, (err, collection) => {
  if (err) {
    console.error('❌ Error checking collection:', err);
  } else if (collection) {
    console.log('✅ Leads collection exists in directus_collections:');
    console.log(JSON.stringify(collection, null, 2));
  } else {
    console.log('❌ Leads collection NOT found in directus_collections');
  }
  console.log('');

  // Check if communications collection still exists
  db.get(`SELECT * FROM directus_collections WHERE collection = 'communications'`, (err, commCollection) => {
    if (err) {
      console.error('❌ Error checking communications:', err);
    } else if (commCollection) {
      console.log('⚠️  Communications collection still exists:');
      console.log(JSON.stringify(commCollection, null, 2));
    } else {
      console.log('✅ Communications collection properly removed');
    }
    console.log('');

    // Check permissions for leads
    db.all(`SELECT * FROM directus_permissions WHERE collection = 'leads'`, (err, permissions) => {
      if (err) {
        console.error('❌ Error checking permissions:', err);
      } else {
        console.log(`📋 Found ${permissions.length} permissions for leads collection:`);
        permissions.forEach(p => {
          console.log(`  - Action: ${p.action}, Policy: ${p.policy}, Fields: ${p.fields}`);
        });
      }
      console.log('');

      // Check admin policy
      db.get(`SELECT * FROM directus_policies WHERE name = 'Administrator'`, (err, policy) => {
        if (err) {
          console.error('❌ Error checking admin policy:', err);
        } else if (policy) {
          console.log('✅ Admin policy found:');
          console.log(`  ID: ${policy.id}`);
          console.log(`  Admin Access: ${policy.admin_access}`);
          console.log(`  App Access: ${policy.app_access}`);
        }
        console.log('');

        // Check if table 'leads' exists in SQLite
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='leads'`, (err, table) => {
          if (err) {
            console.error('❌ Error checking table:', err);
          } else if (table) {
            console.log('✅ Table "leads" exists in database');
          } else {
            console.log('❌ Table "leads" does NOT exist in database');
            
            // Check if communications table exists
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='communications'`, (err, commTable) => {
              if (err) {
                console.error('❌ Error checking communications table:', err);
              } else if (commTable) {
                console.log('⚠️  Table "communications" still exists - rename was not completed!');
              }
            });
          }
          
          setTimeout(() => {
            db.close();
          }, 1000);
        });
      });
    });
  });
});

