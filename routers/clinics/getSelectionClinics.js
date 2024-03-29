const { knex } = require('../../structures/database')

module.exports = async ctx => {
  const body = ctx.request.body
  const searchOpts = {}

  body.scope = body.scope || 'clinicName'
  // body.keyword = `%${body.keyword}%`

  if (!body.keyword) {
    const rows = await knex('SelectionClinics')

    ctx.body = rows
  } else {
    const rows = await knex('SelectionClinics')
      .where(body.scope, 'like', `%${body.keyword}%`)

    ctx.body = rows
  }
}
