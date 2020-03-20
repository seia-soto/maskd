const debug = require('debug')
const iconv = require('iconv-lite')

const { cache } = require('../../config')
const { name } = require('../../package')
const { parse } = require('../csv')
const { knex } = require('../database')
const fetch = require('../fetch')

class SafelySeparatedClinics {
  constructor () {
    this.debug = debug(name + ':SafelySeparatedClinicsReports')
    this.updateAfter = 1000 * 60 * 60

    this.debug('creating the update function chain')

    this.update()
  }

  getLatestStatus () {
    return new Promise((resolve, reject) => {
      fetch('https://www.data.go.kr/dataset/fileDownload.do?atchFileId=FILE_000000001610332&fileDetailSn=1&publicDataDetailPk=uddi:d3f3252a-1832-48fe-8c82-82947dcef08f')
        .then(res => resolve(res.body.pipe(iconv.decodeStream('euc-kr'))))
        .catch(error => resolve(this.getClinicStatus()))
    })
  }

  async getExistingStatus () {
    const results = []

    const totalCount = (await knex('SafelySeparatedClinics').count('id'))[0]['count(`id`)']

    for (let i = 0; i < Math.floor(totalCount / 50) + 1; i++) {
      const items = await knex('SafelySeparatedClinics')
        .where('id', '>=', i * 50)
        .andWhere('id', '<', (i * 50) + 50)

      for (let k = 0; k < items.length; k++) {
        results.push(items[k])
      }
    }

    return results
  }

  async update () {
    const now = Date.now()

    const latestData = await parse(await this.getLatestStatus())
    const existingDataSource = await this.getExistingStatus()
    const existingData = {}
    const updateQueue = []
    const insertionQueue = []

    for (let i = 0; i < existingDataSource.length; i++) {
      delete existingDataSource[i].id

      existingData[Number(existingDataSource[i].identify)] = existingDataSource[i]
    }

    for (let i = 0; i < latestData.length; i++) {
      const data = {
        identify: latestData[i]['연번'] || '',
        province: latestData[i]['시도'] || '',
        city: latestData[i]['시군구'] || '',
        clinicName: latestData[i]['기관명'] || '',
        address: latestData[i]['주소'] || '',
        requestType: latestData[i]['신청유형'] || '',
        representativeContact: latestData[i]['전화번호'] || '',
        availableAt: new Date(latestData[i]['운영가능일자'].split('.').slice(0, 3).join('-') || 0)
      }
      const dataKeys = Object.keys(data)

      if (!data.identify) continue
      if (!existingData[Number(data.identify)]) {
        insertionQueue.push(data)

        continue
      }

      for (let k = 0; k < dataKeys.length; k++) {
        if (data[dataKeys[k]] !== existingData[Number(data.identify)][dataKeys[k]]) {
          updateQueue.push(data)

          continue
        }
      }
    }

    for (let i = 0; i < insertionQueue.length; i++) {
      await knex('SafelySeparatedClinics')
        .insert(insertionQueue[i])
    }
    for (let i = 0; i < updateQueue.length; i++) {
      await knex('SafelySeparatedClinics')
        .update(updateQueue[i])
        .where({
          identify: updateQueue[i].identify
        })
    }

    this.debug('updated the situation report')

    setTimeout(() => {
      this.debug('scheduled the update at ' + Date.now() + this.updateAfter)

      this.update()
    }, this.updateAfter)
  }
}

module.exports = SafelySeparatedClinics
