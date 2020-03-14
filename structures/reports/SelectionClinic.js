const debug = require('debug')
const fs = require('fs')
const iconv = require('iconv-lite')
const path = require('path')

const { cache } = require('../../config')
const { name } = require('../../package')
const { parse } = require('../csv')
const { knex } = require('../database')
const fetch = require('../fetch')

class SelectionClinic {
  constructor () {
    this.cache = {}

    this.cache.directory = path.join(__dirname, '..', '..', cache.directory)
    this.cache.updateAt = 1000 * 60 * 60

    this.debug = debug(name + ':SelectionClinicReports')

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

    const stream = fs.createWriteStream(path.join(this.cache.directory, 'SelectionClinic.' + now + '.csv'))
    const file = await fetch.download(
      'https://www.data.go.kr/dataset/fileDownload.do?atchFileId=FILE_000000001610331&fileDetailSn=1&publicDataDetailPk=uddi:0f64b818-d109-4d65-9771-e1d7f3baace1',
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
      const existingItem = await knex('SelectionClinics')
        .where({ identify: data[i]['연번'] })

      if (!existingItem.length) {
        await knex('SelectionClinics')
          .insert({
            identify: data[i]['연번'] || '',
            samplingAvailable: data[i]['검체채취 가능여부'].toLowerCase() === 'y',
            province: data[i]['시도'] || '',
            city: data[i]['시군구'] || '',
            clinicName: data[i]['의료기관명'] || data[i]['의료기관명 '] || '',
            address: data[i]['주소'] || data[i]['주소 '] || '',
            representativeContact: data[i]['대표 전화번호'] || ''
          })
      } else {
        await knex('SelectionClinics')
          .update({
            samplingAvailable: data[i]['검체채취 가능여부'].toLowerCase() === 'y',
            province: data[i]['시도'] || '',
            city: data[i]['시군구'] || '',
            clinicName: data[i]['의료기관명'] || data[i]['의료기관명 '] || '',
            address: data[i]['주소'] || data[i]['주소 '] || '',
            representativeContact: data[i]['대표 전화번호'] || ''
          })
          .where({
            identify: data[i]['연번'] || ''
          })
      }
    }
  }
}

module.exports = SelectionClinic
