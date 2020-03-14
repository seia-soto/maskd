const Router = require('@koa/router')

const clinicsRouter = require('./clinics')

const router = new Router()

router.use('/clinics', clinicsRouter.routes())

module.exports = router
