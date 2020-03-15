const debug = require('debug')
const fs = require('fs')
const iconv = require('iconv-lite')
const path = require('path')

const { cache } = require('../../config')
const { name } = require('../../package')
const { parse } = require('../csv')
const { knex } = require('../database')
const fetch = require('../fetch')

class SafelySeparatedClinics {
  constructor () {
    this.cache = {}

    this.cache.directory = path.join(__dirname, '..', '..', cache.directory)
    this.cache.updateAt = 1000 * 60 * 60

    this.debug = debug(name + ':SafelySeparatedClinicsReports')

    // NOTE: Run the updater first.
    this.update()

    setTimeout(() => {
      this.update()

      setInterval(() => {
        this.update()
      }, this.cache.updateAt)
    }, (new Date().setMinutes(0, 0, 0, 0) + this.cache.updateAt) - Date.now())
  }

  async update () {
    if (!fs.existsSync(this.cache.directory)) {
      fs.mkdirSync(this.cache.directory, {
        recursive: true
      })
    }

    const now = Date.now()

    this.debug('updating the situation report data at ' + now)

    const stream = fs.createWriteStream(path.join(this.cache.directory, 'SafelySeparatedClinic.' + now + '.csv'))
    const file = await fetch.download(
      'https://www.data.go.kr/dataset/fileDownload.do?atchFileId=FILE_000000001610332&fileDetailSn=1&publicDataDetailPk=uddi:d3f3252a-1832-48fe-8c82-82947dcef08f',
      0,
      stream
    )

    if (file.error || !file.path) {
      this.debug('an error occured while downloading the report dataset')
      this.debug('error: ' + (file.error || 'unknown'))

      return
    }

    const report = fs.createReadStream(file.path)
      .pipe(iconv.decodeStream('euc-kr'))
    const data = await parse(report)

    for (let i = 0; i < data.length; i++) {
      const existingItem = await knex('SafelySeparatedClinics')
        .where({ identify: data[i]['연번'] })

      if (!existingItem.length) {
        await knex('SafelySeparatedClinics')
          .insert({
            identify: data[i]['연번'] || '',
            province: data[i]['시도'] || '',
            city: data[i]['시군구'] || '',
            clinicName: data[i]['기관명'] || '',
            address: data[i]['주소'] || '',
            requestType: data[i]['신청유형'] || '',
            representativeContact: data[i]['전화번호'] || '',
            availableAt: new Date(data[i]['운영가능일자'].split('.').slice(0, 3).join('-') || 0)
          })
      } else {
        await knex('SafelySeparatedClinics')
          .update({
            province: data[i]['시도'] || '',
            city: data[i]['시군구'] || '',
            clinicName: data[i]['기관명'] || '',
            address: data[i]['주소'] || '',
            requestType: data[i]['신청유형'] || '',
            representativeContact: data[i]['전화번호'] || '',
            availableAt: new Date(data[i]['운영가능일자'].split('.').slice(0, 3).join('-') || 0)
          })
          .where({
            identify: data[i]['연번'] || ''
          })
      }
    }

    this.debug('updated the situation report')
  }
}

module.exports = SafelySeparatedClinics
