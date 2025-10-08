const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing permissions for leads collection...\n');

// Get admin policy ID
db.get(`SELECT id FROM directus_policies WHERE name = 'Administrator'`, (err, policy) => {
  if (err) {
    console.error('❌ Error getting admin policy:', err);
    db.close();
    return;
  }

  if (!policy) {
    console.error('❌ Admin policy not found');
    db.close();
    return;
  }

  console.log(`✅ Found admin policy: ${policy.id}`);

  // Check if permissions exist for leads
  db.get(`SELECT * FROM directus_permissions WHERE collection = 'leads' AND policy = ?`, [policy.id], (err, permission) => {
    if (err) {
      console.error('❌ Error checking permissions:', err);
      db.close();
      return;
    }

    if (permission) {
      console.log('✅ Permissions already exist for leads collection');
      
      // Update to ensure full access
      db.run(`
        UPDATE directus_permissions 
        SET action = 'read', permissions = '{}', validation = '{}', presets = '{}', fields = '*'
        WHERE collection = 'leads' AND policy = ? AND action = 'read'
      `, [policy.id], (err) => {
        if (err) console.error('❌ Error updating read permission:', err);
        else console.log('✅ Updated read permission');
      });

      db.run(`
        UPDATE directus_permissions 
        SET action = 'create', permissions = '{}', validation = '{}', presets = '{}', fields = '*'
        WHERE collection = 'leads' AND policy = ? AND action = 'create'
      `, [policy.id], (err) => {
        if (err) console.error('❌ Error updating create permission:', err);
        else console.log('✅ Updated create permission');
      });

      db.run(`
        UPDATE directus_permissions 
        SET action = 'update', permissions = '{}', validation = '{}', presets = '{}', fields = '*'
        WHERE collection = 'leads' AND policy = ? AND action = 'update'
      `, [policy.id], (err) => {
        if (err) console.error('❌ Error updating update permission:', err);
        else console.log('✅ Updated update permission');
      });

      db.run(`
        UPDATE directus_permissions 
        SET action = 'delete', permissions = '{}', validation = '{}', presets = '{}', fields = '*'
        WHERE collection = 'leads' AND policy = ? AND action = 'delete'
      `, [policy.id], (err) => {
        if (err) console.error('❌ Error updating delete permission:', err);
        else console.log('✅ Updated delete permission');
        
        setTimeout(() => {
          console.log('\n✅ Permissions updated! Please restart Directus.');
          db.close();
        }, 1000);
      });

    } else {
      console.log('⚠️  No permissions found, creating new ones...');
      
      // Create permissions for all CRUD operations
      const actions = ['read', 'create', 'update', 'delete'];
      let completed = 0;

      actions.forEach(action => {
        db.run(`
          INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
          VALUES (?, 'leads', ?, '{}', '{}', '{}', '*')
        `, [policy.id, action], (err) => {
          if (err) {
            console.error(`❌ Error creating ${action} permission:`, err);
          } else {
            console.log(`✅ Created ${action} permission`);
          }
          
          completed++;
          if (completed === actions.length) {
            setTimeout(() => {
              console.log('\n✅ All permissions created! Please restart Directus.');
              db.close();
            }, 1000);
          }
        });
      });
    }
  });
});

