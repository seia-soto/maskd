const { knex } = require('../../structures/database')

module.exports = async ctx => {
  const body = ctx.request.body
  const searchOpts = {}

  body.scope = body.scope || 'clinicName'
  // body.keyword = `%${body.keyword}%`

  if (!body.keyword) {
    const rows = await knex('SafelySeparatedClinics')

    ctx.body = rows
  } else {
    const rows = await knex('SafelySeparatedClinics')
      .where(body.scope, 'like', `%${body.keyword}%`)

    ctx.body = rows
  }
}
