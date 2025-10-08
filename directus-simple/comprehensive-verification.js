const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 COMPREHENSIVE VERIFICATION REPORT\n');
console.log('=' .repeat(80));
console.log('\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function addResult(type, category, message) {
  results[type].push(`[${category}] ${message}`);
}

db.serialize(() => {
  // 1. CHECK SCOOTERS TABLE STRUCTURE
  console.log('📋 1. CHECKING SCOOTERS TABLE STRUCTURE\n');
  
  db.all(`PRAGMA table_info(scooters)`, (err, columns) => {
    if (err) {
      addResult('failed', 'SCOOTERS', `Error reading table: ${err.message}`);
      console.error('❌ Error:', err.message);
    } else {
      console.log(`✅ Scooters table has ${columns.length} columns\n`);
      
      // Check for required new fields
      const requiredFields = ['owner_scooter', 'telegram_account', 'client_id'];
      requiredFields.forEach(field => {
        const found = columns.find(col => col.name === field);
        if (found) {
          addResult('passed', 'SCOOTERS', `Field '${field}' exists (type: ${found.type})`);
          console.log(`  ✅ ${field} - ${found.type}`);
        } else {
          addResult('failed', 'SCOOTERS', `Field '${field}' is MISSING`);
          console.log(`  ❌ ${field} - MISSING`);
        }
      });
      
      console.log('\n');
    }
    
    // 2. CHECK CLIENTS TABLE STRUCTURE
    setTimeout(() => {
      console.log('📋 2. CHECKING CLIENTS TABLE STRUCTURE\n');
      
      db.all(`PRAGMA table_info(clients)`, (err, columns) => {
        if (err) {
          addResult('failed', 'CLIENTS', `Error reading table: ${err.message}`);
          console.error('❌ Error:', err.message);
        } else {
          console.log(`✅ Clients table has ${columns.length} columns\n`);
          
          const requiredFields = ['name', 'client_phone', 'telegram_account', 'email', 
                                  'all_conversation', 'status', 'notes', 'scooter_number', 
                                  'converted_from_lead_id'];
          requiredFields.forEach(field => {
            const found = columns.find(col => col.name === field);
            if (found) {
              addResult('passed', 'CLIENTS', `Field '${field}' exists (type: ${found.type})`);
              console.log(`  ✅ ${field} - ${found.type}`);
            } else {
              addResult('failed', 'CLIENTS', `Field '${field}' is MISSING`);
              console.log(`  ❌ ${field} - MISSING`);
            }
          });
          
          console.log('\n');
        }
        
        // 3. CHECK LEADS TABLE STRUCTURE
        setTimeout(() => {
          console.log('📋 3. CHECKING LEADS TABLE STRUCTURE\n');
          
          db.all(`PRAGMA table_info(leads)`, (err, columns) => {
            if (err) {
              addResult('failed', 'LEADS', `Error reading table: ${err.message}`);
              console.error('❌ Error:', err.message);
            } else {
              console.log(`✅ Leads table has ${columns.length} columns\n`);
              
              // Check system fields
              const systemFields = ['created_at', 'updated_at', 'user_created', 'user_updated'];
              console.log('  System fields:');
              systemFields.forEach(field => {
                const found = columns.find(col => col.name === field);
                if (found) {
                  addResult('passed', 'LEADS', `System field '${field}' exists`);
                  console.log(`    ✅ ${field} - ${found.type}`);
                } else {
                  addResult('failed', 'LEADS', `System field '${field}' is MISSING`);
                  console.log(`    ❌ ${field} - MISSING`);
                }
              });
              
              // Check CRM fields
              const crmFields = ['name', 'client_phone', 'telegram_account', 'email', 
                                'all_conversation', 'status', 'notes'];
              console.log('\n  CRM fields:');
              crmFields.forEach(field => {
                const found = columns.find(col => col.name === field);
                if (found) {
                  addResult('passed', 'LEADS', `CRM field '${field}' exists`);
                  console.log(`    ✅ ${field} - ${found.type}`);
                } else {
                  addResult('failed', 'LEADS', `CRM field '${field}' is MISSING`);
                  console.log(`    ❌ ${field} - MISSING`);
                }
              });
              
              console.log('\n');
            }
            
            // 4. CHECK DIRECTUS COLLECTIONS
            setTimeout(() => {
              console.log('📋 4. CHECKING DIRECTUS COLLECTIONS METADATA\n');
              
              db.all(`SELECT collection, icon, note FROM directus_collections WHERE collection IN ('scooters', 'clients', 'leads', 'communications')`, 
                (err, collections) => {
                if (err) {
                  addResult('failed', 'METADATA', `Error reading collections: ${err.message}`);
                  console.error('❌ Error:', err.message);
                } else {
                  console.log(`  Found ${collections.length} collections:\n`);
                  collections.forEach(col => {
                    console.log(`    - ${col.collection} (icon: ${col.icon})`);
                    if (col.collection === 'leads') {
                      addResult('passed', 'METADATA', 'Collection "leads" exists');
                    }
                    if (col.collection === 'communications') {
                      addResult('failed', 'METADATA', 'Old collection "communications" still exists!');
                      console.log('      ⚠️  WARNING: Old "communications" collection found!');
                    }
                  });
                  
                  const hasLeads = collections.find(c => c.collection === 'leads');
                  const hasCommunications = collections.find(c => c.collection === 'communications');
                  
                  if (!hasLeads) {
                    addResult('failed', 'METADATA', 'Collection "leads" not found in directus_collections');
                  }
                  if (hasCommunications) {
                    addResult('warning', 'METADATA', 'Old "communications" collection still registered');
                  }
                  
                  console.log('\n');
                }
                
                // 5. CHECK DIRECTUS FIELDS
                setTimeout(() => {
                  console.log('📋 5. CHECKING DIRECTUS FIELDS METADATA\n');
                  
                  db.all(`SELECT collection, field FROM directus_fields WHERE collection IN ('scooters', 'clients', 'leads') AND field IN ('owner_scooter', 'telegram_account', 'client_id', 'name', 'client_phone', 'email', 'all_conversation', 'status', 'notes', 'converted_from_lead_id', 'scooter_number')`, 
                    (err, fields) => {
                    if (err) {
                      addResult('failed', 'METADATA', `Error reading fields: ${err.message}`);
                      console.error('❌ Error:', err.message);
                    } else {
                      console.log(`  Found ${fields.length} registered fields:\n`);
                      
                      const byCollection = {};
                      fields.forEach(f => {
                        if (!byCollection[f.collection]) byCollection[f.collection] = [];
                        byCollection[f.collection].push(f.field);
                      });
                      
                      Object.keys(byCollection).forEach(collection => {
                        console.log(`    ${collection}:`);
                        byCollection[collection].forEach(field => {
                          console.log(`      - ${field}`);
                          addResult('passed', 'METADATA', `Field ${collection}.${field} registered in directus_fields`);
                        });
                      });
                      
                      console.log('\n');
                    }
                    
                    // 6. CHECK PERMISSIONS
                    setTimeout(() => {
                      console.log('📋 6. CHECKING DIRECTUS PERMISSIONS\n');
                      
                      db.all(`SELECT collection, action, fields FROM directus_permissions WHERE collection = 'leads'`, 
                        (err, permissions) => {
                        if (err) {
                          addResult('failed', 'PERMISSIONS', `Error reading permissions: ${err.message}`);
                          console.error('❌ Error:', err.message);
                        } else {
                          console.log(`  Found ${permissions.length} permissions for 'leads':\n`);
                          
                          const actions = ['create', 'read', 'update', 'delete'];
                          actions.forEach(action => {
                            const found = permissions.find(p => p.action === action);
                            if (found) {
                              addResult('passed', 'PERMISSIONS', `Permission '${action}' exists for leads`);
                              console.log(`    ✅ ${action} - fields: ${found.fields}`);
                            } else {
                              addResult('failed', 'PERMISSIONS', `Permission '${action}' MISSING for leads`);
                              console.log(`    ❌ ${action} - MISSING`);
                            }
                          });
                          
                          console.log('\n');
                        }
                        
                        // 7. CHECK DATA
                        setTimeout(() => {
                          console.log('📋 7. CHECKING DATA IN TABLES\n');
                          
                          db.get(`SELECT COUNT(*) as count FROM scooters`, (err, row) => {
                            if (!err) {
                              console.log(`  Scooters: ${row.count} records`);
                              addResult('passed', 'DATA', `Scooters table has ${row.count} records`);
                            }
                          });
                          
                          db.get(`SELECT COUNT(*) as count FROM clients`, (err, row) => {
                            if (!err) {
                              console.log(`  Clients: ${row.count} records`);
                              addResult('passed', 'DATA', `Clients table has ${row.count} records`);
                            }
                          });
                          
                          db.get(`SELECT COUNT(*) as count FROM leads`, (err, row) => {
                            if (!err) {
                              console.log(`  Leads: ${row.count} records`);
                              addResult('passed', 'DATA', `Leads table has ${row.count} records`);
                            }
                            
                            // FINAL REPORT
                            setTimeout(() => {
                              console.log('\n');
                              console.log('=' .repeat(80));
                              console.log('\n📊 FINAL VERIFICATION REPORT\n');
                              console.log('=' .repeat(80));
                              console.log('\n');
                              
                              console.log(`✅ PASSED: ${results.passed.length} checks`);
                              console.log(`❌ FAILED: ${results.failed.length} checks`);
                              console.log(`⚠️  WARNINGS: ${results.warnings.length} checks`);
                              console.log('\n');
                              
                              if (results.failed.length > 0) {
                                console.log('❌ FAILED CHECKS:\n');
                                results.failed.forEach(msg => console.log(`  ${msg}`));
                                console.log('\n');
                              }
                              
                              if (results.warnings.length > 0) {
                                console.log('⚠️  WARNINGS:\n');
                                results.warnings.forEach(msg => console.log(`  ${msg}`));
                                console.log('\n');
                              }
                              
                              if (results.failed.length === 0 && results.warnings.length === 0) {
                                console.log('🎉 ALL CHECKS PASSED! System is fully operational.\n');
                              } else if (results.failed.length === 0) {
                                console.log('✅ All critical checks passed. Some warnings present.\n');
                              } else {
                                console.log('⚠️  CRITICAL ISSUES FOUND. Please review failed checks.\n');
                              }
                              
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
        }, 500);
      });
    }, 500);
  });
});

