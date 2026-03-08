// Simple check script: fetch /api/menu and apply client filter logic
const DEFAULT_CATEGORIES = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Drinks",
  "Specials",
];

async function main() {
  const url = process.env.MENU_URL || 'http://localhost:3000/api/menu';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  const items = await res.json();
  if (!Array.isArray(items)) {
    console.error('API did not return an array');
    process.exit(2);
  }

  console.log(`Loaded ${items.length} items from ${url}`);

  for (const cat of DEFAULT_CATEGORIES) {
    const filtered =
      cat === 'All'
        ? items
        : items.filter((item) => String(item.category || '').trim().toLowerCase() === cat.toLowerCase());
    console.log(`${cat}: ${filtered.length}`);
    if (filtered.length > 0) {
      const names = filtered.slice(0, 5).map((i) => i.name).join(' | ');
      console.log('  sample:', names);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
