module.exports = {
    apps: [
      {
        name: 'time',
        script: './node_modules/next/dist/bin/next',
        args: 'start -p 3001',
        exec_mode: 'fork',
        env: {
          NODE_ENV: 'production'
        }
      }
    ]
  }