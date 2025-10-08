const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Updating leads permissions to allow all fields...\n');

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

  console.log(`✅ Found admin policy: ${policy.id}\n`);

  // Update all permissions to allow all fields (including system fields)
  const actions = ['read', 'create', 'update', 'delete'];
  let completed = 0;

  actions.forEach(action => {
    db.run(`
      UPDATE directus_permissions 
      SET fields = '*', permissions = NULL, validation = NULL, presets = NULL
      WHERE collection = 'leads' AND policy = ? AND action = ?
    `, [policy.id, action], (err) => {
      if (err) {
        console.error(`❌ Error updating ${action} permission:`, err);
      } else {
        console.log(`✅ Updated ${action} permission to allow all fields`);
      }
      
      completed++;
      if (completed === actions.length) {
        setTimeout(() => {
          console.log('\n✅ All permissions updated! Please restart Directus.');
          db.close();
        }, 500);
      }
    });
  });
});

