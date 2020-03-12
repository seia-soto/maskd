module.exports = {
  app: {
    port: 3000
  },
  database: {
    client: 'sqlite3',
    connection: {
      filename: './bin/sample.db'
    }
  }
}
