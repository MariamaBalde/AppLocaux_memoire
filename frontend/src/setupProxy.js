const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.REACT_APP_API_PROXY_TARGET || 'https://tableguerte.free.laravel.cloud';

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: true,
      logLevel: 'warn',
    })
  );
};
