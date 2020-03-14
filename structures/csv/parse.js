const csv = require('csv-parser')
const fs = require('fs')

module.exports = stream => {
  return new Promise((resolve, reject) => {
    const results = []

    stream
      .pipe(csv())
      .on('data', row => results.push(row))
      .on('end', end => resolve(results))
  })
}
