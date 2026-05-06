const { createProxyMiddleware } = require('http-proxy-middleware');

const target =
  process.env.REACT_APP_API_PROXY_TARGET ||
  process.env.REACT_APP_API_TARGET ||
  'http://127.0.0.1:8000';

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: target.startsWith('https://'),
      logLevel: 'warn',
    })
  );
};
