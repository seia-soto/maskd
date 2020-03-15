const Router = require('@koa/router')
const useBody = require('koa-body')

const getMaskStores = require('./getMaskStores')

const router = new Router()

router.post('/stores', useBody(), getMaskStores)

module.exports = router
