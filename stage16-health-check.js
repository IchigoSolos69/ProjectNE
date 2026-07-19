const https = require('https');

function check() {
  const options = {
    hostname: 'projectne.onrender.com',
    path: '/api/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('Success: Live Render backend is up and running successfully!');
      process.exit(0);
    } else {
      console.error('Failure: Live Render backend returned status:', res.statusCode);
      process.exit(1);
    }
  });

  req.on('error', (e) => {
    console.error('HTTP Request failed:', e);
    process.exit(1);
  });

  req.end();
}

check();
