module.exports = {
  apps: [{
    name: 'analytics-govix',
    script: 'index.js',
    cwd: '/root/analytics.govix.io/server',
    env: { PORT: '3030', NODE_ENV: 'production' },
    restart_delay: 3000,
    max_restarts: 10
  }]
};
