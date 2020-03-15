const { knex } = require('../../structures/database')

module.exports = async ctx => {
  const body = ctx.request.body
  const searchOpts = {}

  body.scope = body.scope || 'name'
  // body.keyword = `%${body.keyword}%`

  if ((body.keyword || '').length < 2) {
    ctx.body = {
      error: 'InvalidParameter'
    }

    return
  }

  try {
    const rows = await knex('MaskStores')
      .where(body.scope, 'like', `%${body.keyword}%`)

    ctx.body = rows
  } catch (error) {
    ctx.body = {
      error: 'InvalidParameter'
    }
  }
}
