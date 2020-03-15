module.exports = {
  apps: [
    {
      name: 'maskd',
      script: './index.js',
      env: {
        ENV: 'development',
        DEBUG: 'maskd*'
      },
      env_production: {
        ENV: 'production',
        DEBUG: 'maskd*'
      }
    },
    {
      name: 'maskd-forks',
      script: './fork.js',
      instances: 4,
      exec_modee: 'cluster',
      env: {
        ENV: 'development',
        DEBUG: 'maskd*'
      },
      env_production: {
        ENV: 'production',
        DEBUG: 'maskd*'
      }
    }
  ]
}
