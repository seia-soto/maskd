const schemas = require('./schemas')
const knex = require('./knex')

module.exports = async () => {
  const schemaNames = Object.keys(schemas)

  for (let i = 0; i < schemaNames.length; i++) {
    if (!await knex.schema.hasTable(schemaNames[i])) {
      await schemas[schemaNames[i]](knex)
    }
  }
}
