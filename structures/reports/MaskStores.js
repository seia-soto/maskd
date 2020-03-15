const debug = require('debug')
const fs = require('fs')

const { name } = require('../../package')
const { knex } = require('../database')
const fetch = require('../fetch')

class MaskStores {
  constructor () {
    this.cache = {
      updateAt: 1000 * 60 * 2
    }
    this.debug = debug(name + ':MaskStoresReports')
    this.updating = 0
    this.updateMetadataAfter = 0 /* default: once per day / 2 (update interval) */

    // NOTE: Run the updater first.
    this.update()

    setTimeout(() => {
      this.update()

      setInterval(() => {
        this.update()
      }, this.cache.updateAt)
    }, (new Date().setSeconds(0, 0, 0) + this.cache.updateAt) - Date.now())
  }

  async updateStores (page) {
    this.debug('updating the metadata of the stores: ' + page)

    const now = Date.now()
    const storeMetadataResponse = await fetch('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/stores/json?page=' + page)
    const storeMetadata = await storeMetadataResponse.json()

    storeMetadata._updatedAt = now

    for (let i = 0; i < storeMetadata.storeInfos.length; i++) {
      const item = storeMetadata.storeInfos[i]

      if (item.code) {
        const existingData = await knex('MaskStores')
          .where({
            identify: item.code
          })

        if (!existingData.length) {
          await knex('MaskStores')
            .insert({
              identify: item.code || '',
              address: item.addr || '',
              latitude: item.lat || -1,
              longitude: item.lng || -1,
              name: item.name || '',
              type: parseInt(item.type || '0'),
              stockReplenishedAt: 0,
              stockStatus: 'unavailable',
              stockUpdatedAt: 0,
              updatedAt: now
            })
        } else {
          await knex('MaskStores')
            .update({
              address: item.addr || '',
              latitude: item.lat || -1,
              longitude: item.lng || -1,
              name: item.name || '',
              type: parseInt(item.type || '0'),
              updatedAt: now
            })
            .where({
              identify: item.code || ''
            })
        }
      }
    }

    return storeMetadata
  }

  async updateMaskStatus (page) {
    this.debug('updating the mask stock status of the stores: ' + page)

    const now = Date.now()
    const storeMaskStatusResponse = await fetch('https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/sales/json?page=' + page)
    const storeMaskStatus = await storeMaskStatusResponse.json()

    storeMaskStatus._updatedAt = now

    for (let i = 0; i < storeMaskStatus.sales.length; i++) {
      const item = storeMaskStatus.sales[i]

      if (item.code) {
        const existingData = await knex('MaskStores')
          .where({
            identify: item.code
          })

        if (existingData.length) {
          await knex('MaskStores')
            .update({
              stockReplenishedAt: new Date(item.stock_at),
              stockStatus: item.remain_stat,
              stockUpdatedAt: new Date(item.created_at),
              updatedAt: new Date(now)
            })
            .where({
              identify: item.code || ''
            })
        }
      }
    }

    return storeMaskStatus
  }

  async update () {
    if (this.updating) {
      return
    }

    this.updating = 1

    const now = Date.now()
    const stores = {}

    this.debug('updating the situation report data at ' + now)

    if (!this.updateMetadataAfter) {
      this.updateMetadataAfter = 30 * 24

      // NOTE: Update the store metadata.
      const storeData = await this.updateStores(1)

      for (let i = 2; i <= storeData.totalPages; i++) {
        const storeMetadata = await this.updateStores(i)
      }
    }

    // NOTE: The status of mask stock won't update during 23h ~ 8h.
    const currentHour = new Date(new Date().toUTCString()).getHours() + 1 + 9

    if (currentHour < 8 || currentHour > 23) {
      this.debug('skipped updating the status of mask stock data due to inactive API')

      return
    }

    // NOTE: Update the mask status.
    const stockData = await this.updateMaskStatus(1)

    for (let i = 2; i <= stockData.totalPages; i++) {
      const storeMaskStatus = await this.updateMaskStatus(i)
    }

    this.debug('updated the situation report')

    this.updating = 0
    this.updateMetadataAfter -= 1
  }
}

module.exports = MaskStores
