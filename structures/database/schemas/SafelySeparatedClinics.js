module.exports = async knex => {
  // NOTE: 보건복지부 국민안심병원
  await knex.schema.createTable('SafelySeparatedClinics', table => {
    // NOTE: 연차
    table.integer('identify')
    // NOTE: 시/도
    table.string('province', 32)
    // NOTE: 시/군/구
    table.string('city', 32)
    // NOTE: 의료기관명
    table.string('clinicName', 64)
    // NOTE: 주소
    table.string('address', 256)
    // NOTE: 신청유형
    table.string('requestType', 32)
    // NOTE: 대표 전화번호
    table.string('representativeContact', 16)
    // NOTE: 운영 가능 일자
    table.date('availableAt')

    return table
  })
}
