import http from 'node:http';

const port = process.env.PORT || 4000;
const options = {
  host: '127.0.0.1',
  port,
  path: '/api/v1/health/live',
  timeout: 3000,
};

const req = http.request(options, res => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.end();
