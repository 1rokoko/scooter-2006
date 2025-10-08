const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Properly renaming communications to leads...\n');

db.serialize(() => {
  // Step 1: Rename the actual SQLite table
  console.log('Step 1: Renaming SQLite table from communications to leads...');
  db.run(`ALTER TABLE communications RENAME TO leads`, (err) => {
    if (err) {
      console.error('❌ Error renaming table:', err);
      db.close();
      return;
    }
    console.log('✅ Table renamed successfully\n');

    // Step 2: Update directus_fields to point to new collection
    console.log('Step 2: Updating directus_fields...');
    db.run(`UPDATE directus_fields SET collection = 'leads' WHERE collection = 'communications'`, (err) => {
      if (err) {
        console.error('❌ Error updating fields:', err);
      } else {
        console.log('✅ Fields updated\n');
      }

      // Step 3: Update directus_relations
      console.log('Step 3: Updating directus_relations...');
      db.run(`UPDATE directus_relations SET many_collection = 'leads' WHERE many_collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating relations (many):', err);
      });
      
      db.run(`UPDATE directus_relations SET one_collection = 'leads' WHERE one_collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating relations (one):', err);
        else console.log('✅ Relations updated\n');
      });

      // Step 4: Update directus_presets
      console.log('Step 4: Updating directus_presets...');
      db.run(`UPDATE directus_presets SET collection = 'leads' WHERE collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating presets:', err);
        else console.log('✅ Presets updated\n');
      });

      // Step 5: Update directus_revisions
      console.log('Step 5: Updating directus_revisions...');
      db.run(`UPDATE directus_revisions SET collection = 'leads' WHERE collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating revisions:', err);
        else console.log('✅ Revisions updated\n');
      });

      // Step 6: Update directus_activity
      console.log('Step 6: Updating directus_activity...');
      db.run(`UPDATE directus_activity SET collection = 'leads' WHERE collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating activity:', err);
        else console.log('✅ Activity updated\n');
      });

      // Step 7: Update directus_permissions
      console.log('Step 7: Updating directus_permissions...');
      db.run(`UPDATE directus_permissions SET collection = 'leads' WHERE collection = 'communications'`, (err) => {
        if (err) console.error('❌ Error updating permissions:', err);
        else console.log('✅ Permissions updated\n');
      });

      // Step 8: Remove old communications collection entry
      console.log('Step 8: Removing old communications collection entry...');
      db.run(`DELETE FROM directus_collections WHERE collection = 'communications'`, (err) => {
        if (err) {
          console.error('❌ Error removing old collection:', err);
        } else {
          console.log('✅ Old collection entry removed\n');
        }

        // Verify the changes
        setTimeout(() => {
          console.log('🔍 Verifying changes...\n');
          
          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='leads'`, (err, table) => {
            if (table) {
              console.log('✅ Table "leads" exists');
            } else {
              console.log('❌ Table "leads" not found');
            }
          });

          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='communications'`, (err, table) => {
            if (table) {
              console.log('⚠️  Table "communications" still exists');
            } else {
              console.log('✅ Table "communications" removed');
            }
          });

          db.get(`SELECT * FROM directus_collections WHERE collection = 'leads'`, (err, coll) => {
            if (coll) {
              console.log('✅ Collection "leads" exists in directus_collections');
            } else {
              console.log('❌ Collection "leads" not found in directus_collections');
            }
          });

          db.get(`SELECT * FROM directus_collections WHERE collection = 'communications'`, (err, coll) => {
            if (coll) {
              console.log('⚠️  Collection "communications" still in directus_collections');
            } else {
              console.log('✅ Collection "communications" removed from directus_collections');
            }
          });

          setTimeout(() => {
            console.log('\n✅ Rename complete! Please restart Directus.');
            db.close();
          }, 1000);
        }, 1000);
      });
    });
  });
});

