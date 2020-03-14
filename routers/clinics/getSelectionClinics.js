const { knex } = require('../../structures/database')

module.exports = async ctx => {
  const body = ctx.request.body
  const searchOpts = {}

  body.scope = body.scope || 'clinicName'
  // body.keyword = `%${body.keyword}%`

  if (!body.keyword) {
    ctx.body = {
      error: 'InvalidParamter'
    }

    return
  }

  const rows = await knex('SelectionClinics')
    .where(body.scope, 'like', `%${body.keyword}%`)

  ctx.body = rows
}
