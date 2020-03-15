module.exports = async knex => {
  // NOTE: 보건복지부 국민안심병원
  await knex.schema.createTable('MaskStores', table => {
    // NOTE: 식별 코드
    table.integer('identify')
    // NOTE: 주소
    table.string('address', 128)
    // NOTE: 위도
    table.string('latitude', 32)
    // NOTE: 경도
    table.string('longitude', 32)
    // NOTE: 이름
    table.string('name', 32)
    // NOTE: 종류 ([null, 약국, 우체국, 농협])
    table.integer('type', 1)
    // NOTE: 마스크 입고 시간
    table.datetime('stockReplenishedAt')
    /*
      마스크 재고 상태

      {
        plenty: 100개 이상,
        some: 30개 이상,
        few: 2개 이상,
        empty: 1개 이하,
        break: 판매 중지
      }
    */
    table.string('stockStatus', 16)
    // NOTE: 마스크 재고 데이터 생성 일자
    table.datetime('stockUpdatedAt')
    // NOTE: 데이터 생성 일자
    table.datetime('updatedAt')

    return table
  })
}
