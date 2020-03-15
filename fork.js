const Koa = require('koa')
const useCORS = require('@koa/cors')
const useJSON = require('koa-json')
const debug = require('debug')

const routers = require('./routers')
const config = require('./config')
const pkg = require('./package')

const app = new Koa()

app.context.config = config
app.context.debug = debug(pkg.name)
app.context.pkg = pkg

const initFn = async () => {
  app
    .use(useJSON({ pretty: false }))
    .use(useCORS(/* Use request origin header. */))
    .use(routers.routes())
    .use(routers.allowedMethods())
    .listen(config.app.port + 1, () => app.context.debug(`starting 'maskd' API server (fork, slave) at ${Date.now()}.`))
}

initFn()
