const fetch = require('./_fetch')

module.exports = (url, opts, stream) => {
  return new Promise((resolve, reject) => {
    const res = fetch(url, opts)
      .then(res => {
        res.body.pipe(stream)
        res.body.on('error', error => resolve({ error }))
        res.body.on('end', () => resolve({ path: stream.path }))
      })
  })
}
