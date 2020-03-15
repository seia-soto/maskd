const debug = require('debug')
const fs = require('fs')

const { name } = require('../../package')
const { knex } = require('../database')
const fetch = require('../fetch')

class MaskStores {
  constructor () {
    this.debug = debug(name + ':MaskStoresReports')
    this.updateInterval = 1000 * 60 * 5
    this.updating = 0

    this.update()

    setTimeout(() => {
      this.update()

      setInterval(() => this.update(), this.updateInterval)
    }, (new Date().setSeconds(0, 0, 0) + this.updateInterval) - Date.now())
  }

  async getStoreDetails (page) {
    const results = []

    const storeMetadataResponse = await fetch('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/stores/json?page=' + (page || 1))
    const storeMetadata = await storeMetadataResponse.json()

    // NOTE: If no `page` argument found, download all details.
    if (!page) {
      for (let i = 0; i < storeMetadata.storeInfos.length; i++) {
        results.push(storeMetadata.storeInfos[i])
      }
      for (let i = 2; i <= storeMetadata.totalPages; i++) {
        const details = await this.getStoreDetails(i)

        for (let k = 0; k < details.storeInfos.length; k++) {
          results.push(details.storeInfos[k])
        }
      }

      return results
    } else {
      return storeMetadata
    }
  }

  async getMaskStatus (page) {
    const results = []

    const maskStatusResponse = await fetch('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/sales/json?page=' + (page || 1))
    const maskStatus = await maskStatusResponse.json()

    // NOTE: If no `page` argument found, download all details.
    if (!page) {
      for (let i = 0; i < maskStatus.sales.length; i++) {
        results.push(maskStatus.sales[i])
      }
      for (let i = 2; i <= maskStatus.totalPages; i++) {
        const details = await this.getMaskStatus(i)

        for (let k = 0; k < details.sales.length; k++) {
          results.push(details.sales[k])
        }
      }

      return results
    } else {
      return maskStatus
    }
  }

  async getExistingStoreDetails () {
    const results = []

    const totalCount = (await knex('MaskStores').count('id'))[0]['count(`id`)']

    for (let i = 0; i < Math.floor(totalCount / 50) + 1; i++) {
      const items = await knex('MaskStores')
        .where('id', '>=', i * 50)
        .andWhere('id', '<', (i * 50) + 50)

      for (let k = 0; k < items.length; k++) {
        results.push(items[k])
      }
    }

    return results
  }

  async updateStores () {
    this.debug('updating the store details')

    const now = Date.now()
    const insertionQueue = []

    this.debug('downloading the store details data')

    const latestData = await this.getStoreDetails()

    this.debug('loading the existing store details data from database')

    const existingData = await this.getExistingStoreDetails()

    this.debug('validating new version and current version')

    for (let i = 0; i < latestData.length; i++) {
      if (!latestData[i].code) continue

      const latestItem = latestData[i]
      const existingItem = existingData.find(item => item.identify === Number(latestData[i].code))

      if (!existingItem) {
        insertionQueue.push({
          identify: latestItem.code || '',
          address: latestItem.addr || '',
          latitude: latestItem.lat || '',
          longitude: latestItem.lng || '',
          name: latestItem.name || '',
          type: parseInt(latestItem.type || '0'),
          stockReplenishedAt: 0,
          stockStatus: 'unavailable',
          stockUpdatedAt: 0,
          updatedAt: new Date(now)
        })
      }
    }

    this.debug('inserting data which not exists in the database: ' + insertionQueue.length)

    for (let k = 0; k < insertionQueue.length; k++) {
      await knex('MaskStores')
        .insert(insertionQueue[k])
    }
  }

  async updateMaskStatus (page) {
    this.debug('updating the mask stock status')

    const now = Date.now()
    const updateQueue = []

    this.debug('downloading the mask stock data')

    const latestData = await this.getMaskStatus()

    this.debug('loading the existing mask stock data from database')

    const existingData = await this.getExistingStoreDetails()

    this.debug('validating new version and current version')

    for (let i = 0; i < latestData.length; i++) {
      if (!latestData[i].code) continue

      const latestItem = latestData[i]
      const existingItem = existingData.find(item => item.identify === Number(latestItem.code))

      if (existingItem && (!latestItem.stockUpdatedAt || new Date(latestItem.created_at).getTime() > existingItem.updatedAt + 1000 * 60 * 60 * 9)) {
        updateQueue.push({
          identify: latestItem.code,
          data: {
            stockReplenishedAt: new Date(latestItem.stock_at),
            stockStatus: latestItem.remain_stat,
            stockUpdatedAt: new Date(latestItem.created_at),
            updatedAt: new Date(now)
          }
        })
      }
    }

    this.debug('updating newer versions of data: ' + updateQueue.length)

    for (let k = 0; k < updateQueue.length; k++) {
      await knex('MaskStores')
        .update(updateQueue[k].data)
        .where({
          identify: updateQueue[k].identify
        })
    }
  }

  async update () {
    if (this.updating) return

    this.updating = 1

    this.debug('updating the situation report data at ' + Date.now())

    await this.updateStores()
    await this.updateMaskStatus()

    this.debug('updated the situation report')

    this.updating = 0
  }
}

module.exports = MaskStores
