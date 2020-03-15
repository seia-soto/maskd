const { knex } = require('../../structures/database')

module.exports = async ctx => {
  const body = ctx.request.body
  const searchOpts = {}

  body.limit = body.limit || 250
  body.page = body.page || 1
  body.scope = body.scope || 'name'
  // body.keyword = `%${body.keyword}%`

  if (String(body.keyword || '').length < 2) {
    ctx.body = {
      error: 'InvalidParameter'
    }

    return
  }

  if (body.limit > 1000) body.limit = 1000

  try {
    const rows = await knex('MaskStores')
      .where(body.scope, 'like', `%${body.keyword}%`)

    ctx.body = rows.slice(body.limit * (body.page - 1), body.limit * body.page)
  } catch (error) {
    ctx.body = {
      error: 'InvalidParameter'
    }
  }
}
