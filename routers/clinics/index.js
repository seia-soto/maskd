const Router = require('@koa/router')
const useBody = require('koa-body')

const getSelectionClinics = require('./getSelectionClinics')

const router = new Router()

router.post('/selection', useBody(), getSelectionClinics)

module.exports = router
