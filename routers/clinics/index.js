const Router = require('@koa/router')
const useBody = require('koa-body')

const getSafelySeparatedClinics = require('./getSafelySeparatedClinics')
const getSelectionClinics = require('./getSelectionClinics')

const router = new Router()

router.post('/safelySeparated', useBody(), getSafelySeparatedClinics)
router.post('/selection', useBody(), getSelectionClinics)

module.exports = router
