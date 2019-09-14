'use strict'

const ssbClient = require('ssb-client')
const secretStack = require('secret-stack')
const ssbConfig = require('ssb-config')
const debug = require('debug')('oasis')

const rawConnect = () => new Promise((resolve, reject) => {
  ssbClient((err, api) => {
    if (err) {
      reject(err)
    } else {
      resolve(api)
    }
  })
})

const db = {
  connect () {
    return handle
  },
  /**
   * @param {function} method
   */
  get (method, ...opts) {
    return new Promise((resolve, reject) => {
      method(...opts, (err, val) => {
        if (err) {
          reject(err)
        } else {
          resolve(val)
        }
      })
    })
  },
  read (method, ...args) {
    return new Promise((resolve, reject) => {
      resolve(method(...args))
    })
  }
}

debug.enabled = true

const handle = new Promise((resolve, reject) => {
  rawConnect().then((ssb) => {
    debug('Using pre-existing Scuttlebutt server instead of starting one')
    resolve(ssb)
  }).catch(() => {
    debug('Initial connection attempt failed')
    debug('Starting Scuttlebutt server')

    
    const connectOrRetry = () => {
      setTimeout(() => {
        rawConnect().then((ssb) => {
          debug('Retrying connection to own server')
          resolve(ssb)
        }).catch((e) => {
          debug(e)
          connectOrRetry()
        })
      }, 1000)
    }

    connectOrRetry()
  })
})

module.exports = db
