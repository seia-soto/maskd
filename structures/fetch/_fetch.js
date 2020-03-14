const fetch = require('node-fetch')

module.exports = (url, opts) => {
  // NOTE: Attach User-Agent header
  opts = opts || {}
  opts.headers = opts.headers || {}
  opts.headers['User-Agent'] = opts.headers['User-Agent'] || 'maskd/v0 (https://github.com/Seia-Soto/maskd)'

  return fetch(url, opts)
}
