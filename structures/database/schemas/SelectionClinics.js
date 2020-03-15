module.exports = async knex => {
  // NOTE: 보건복지부 선별진료소
  await knex.schema.createTable('SelectionClinics', table => {
    table.increments()

    // NOTE: 연차
    table.integer('identify')
    // NOTE: 검체 선별 가능 여부
    table.boolean('samplingAvailable')
    // NOTE: 시/도
    table.string('province', 32)
    // NOTE: 시/군/구
    table.string('city', 32)
    // NOTE: 의료기관명
    table.string('clinicName', 64)
    // NOTE: 주소
    table.string('address', 256)
    // NOTE: 대표 전화번호
    table.string('representativeContact', 16)

    return table
  })
}
