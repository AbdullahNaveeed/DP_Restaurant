const fs = require('fs');
const path = './temp_menu_filtered.html';
if (!fs.existsSync(path)) {
  console.error('File not found:', path);
  process.exit(2);
}
const s = fs.readFileSync(path, 'utf8');
console.log('includes Selected: Main Course ->', s.includes('Selected: Main Course'));
const count = (s.match(/class=\"group/g) || []).length;
console.log('cardsRendered:', count);
