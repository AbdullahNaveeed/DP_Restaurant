const fs = require('fs');
const fetch = require('node-fetch');
(async () => {
  try {
    const base = 'http://localhost:3000';
    const file = 'temp_init/fallback-orders.json';
    const raw = fs.readFileSync(file, 'utf8');
    const list = JSON.parse(raw || '[]');
    console.log('Before patch - file entries:');
    list.forEach((o, i) => console.log(i, o._id, o.status));

    const target = list[0];
    if (!target) return console.log('No target order');
    console.log('Target id:', target._id, 'status:', target.status);

    // login demo admin
    let res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ghanishinwari.com', password: 'admin123' }),
    });
    const sc = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');
    console.log('Login status', res.status, 'set-cookie:', !!sc);
    const tokenMatch = sc ? sc.match(/token=([^;]+)/) : null;
    const token = tokenMatch ? tokenMatch[1] : null;
    const cookie = token ? `token=${token}` : null;

    // attempt transition
    const nextStatus = target.status === 'Pending' ? 'Preparing' : target.status === 'Preparing' ? 'Delivered' : null;
    if (!nextStatus) return console.log('No next status for', target.status);

    res = await fetch(base + '/api/orders/' + target._id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ status: nextStatus }),
    });
    console.log('PATCH status', res.status);
    const body = await res.text();
    console.log('PATCH body', body);

    const raw2 = fs.readFileSync(file, 'utf8');
    const list2 = JSON.parse(raw2 || '[]');
    console.log('After patch - file entries:');
    list2.forEach((o, i) => console.log(i, o._id, o.status));
  } catch (e) {
    console.error(e);
  }
})();
