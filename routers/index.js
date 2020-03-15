const Router = require('@koa/router')

const clinicsRouter = require('./clinics')
const masksRouter = require('./masks')

const router = new Router()

router.use('/clinics', clinicsRouter.routes())
router.use('/masks', masksRouter.routes())

module.exports = router
