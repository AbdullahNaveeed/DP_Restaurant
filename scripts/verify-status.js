(async () => {
  try {
    const base = 'http://localhost:3000';

    // Login (demo fallback)
    let res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ghanishinwari.com', password: 'admin123' }),
    });

    const sc = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');
    console.log('Login status:', res.status);
    const bodyLogin = await res.text();
    console.log('Login body:', bodyLogin);
    console.log('Set-Cookie header:', sc);

    const tokenMatch = sc ? sc.match(/token=([^;]+)/) : null;
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) {
      console.error('No token found; aborting');
      return;
    }

    const cookie = `token=${token}`;

    // PATCH order status
      // GET orders filtered (Preparing)
      res = await fetch(base + '/api/orders?status=Preparing', { headers: { Cookie: cookie } });
      console.log('GET orders status:', res.status);
      const ordersBody = await res.text();
      console.log('GET orders body:', ordersBody);

      // GET admin page HTML
      res = await fetch(base + '/admin/orders', { headers: { Cookie: cookie } });
      console.log('GET admin page status:', res.status);
      const adminHtml = await res.text();
      console.log('Admin page snippet:', adminHtml.slice(0, 2000));
    
      // Now advance Preparing -> Delivered
      const patchRes = await fetch(base + '/api/orders/fallback-1772956076235', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ status: 'Delivered' }),
      });
      console.log('PATCH to Delivered status:', patchRes.status);
      console.log('PATCH to Delivered body:', await patchRes.text());

      // Confirm Delivered list
      const deliveredRes = await fetch(base + '/api/orders?status=Delivered', { headers: { Cookie: cookie } });
      console.log('GET Delivered status:', deliveredRes.status);
      console.log('GET Delivered body:', await deliveredRes.text());

  } catch (e) {
    console.error('Error in verify script:', e);
  }
})();
