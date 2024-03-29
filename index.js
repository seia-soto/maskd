const Koa = require('koa')
const useCORS = require('@koa/cors')
const useJSON = require('koa-json')
const debug = require('debug')

const routers = require('./routers')
const structures = require('./structures')
const config = require('./config')
const pkg = require('./package')

const app = new Koa()

const {
  MaskStores,
  SafelySeparatedClinics,
  SelectionClinic
} = structures.reports

app.context.config = config
app.context.debug = debug(pkg.name)
app.context.pkg = pkg

app.context.workers = {
  // MaskStores: new MaskStores(),
  SafelySeparatedClinics: new SafelySeparatedClinics(),
  SelectionClinic: new SelectionClinic()
}

const initFn = async () => {
  await structures.database.createTables()

  app
    .use(useJSON({ pretty: false }))
    .use(useCORS(/* Use request origin header. */))
    .use(routers.routes())
    .use(routers.allowedMethods())
    .listen(config.app.port, () => app.context.debug(`starting 'maskd' API server at ${Date.now()}.`))
}

initFn()
