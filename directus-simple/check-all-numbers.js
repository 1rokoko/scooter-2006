const data = require('./scooters-data.json');

console.log('Всего записей в scooters-data.json:', data.length);
console.log('\nСписок всех номеров скутеров:\n');

data.forEach((s, i) => {
  const number = s['номер скутера  (старый)'] || s['номер скутера  '] || 'NO NUMBER';
  console.log(`${i+1}. ${number}`);
});

