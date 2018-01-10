/**
 Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Modbus core node basics.
 * @module NodeRedModbusBasics
 */
module.exports.statusLog = false
/**
 *
 * @param unit
 * @returns {string}
 */
module.exports.get_timeUnit_name = function (unit) {
  let unitAbbreviation = ''

  switch (unit) {
    case 'ms':
      unitAbbreviation = 'msec.'
      break
    case 's':
      unitAbbreviation = 'sec.'
      break
    case 'm':
      unitAbbreviation = 'min.'
      break
    case 'h':
      unitAbbreviation = 'h.'
      break
    default:
      break
  }

  return unitAbbreviation
}

module.exports.calc_rateByUnit = function (rate, rateUnit) {
  switch (rateUnit) {
    case 'ms':
      break
    case 's':
      rate = parseInt(rate) * 1000 // seconds
      break
    case 'm':
      rate = parseInt(rate) * 60000 // minutes
      break
    case 'h':
      rate = parseInt(rate) * 3600000 // hours
      break
    default:
      rate = 10000 // 10 sec.
      break
  }

  return rate
}
/**
 *
 * @param statusValue
 * @param showActivities
 * @returns {{fill: string, shape: string, status: *}}
 */
module.exports.setNodeStatusProperties = function (statusValue, showActivities) {
  let fillValue = 'yellow'
  let shapeValue = 'ring'

  switch (statusValue) {
    case 'connecting':
      fillValue = 'yellow'
      shapeValue = 'ring'
      break

    case 'error':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'initialized':
      fillValue = 'yellow'
      shapeValue = 'dot'
      break

    case 'not ready to read':
    case 'not ready to write':
      fillValue = 'yellow'
      shapeValue = 'ring'
      break

    case 'connected':
      fillValue = 'green'
      shapeValue = 'ring'
      break

    case 'timeout':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'active':
    case 'active reading':
    case 'active writing':
      if (!showActivities) {
        statusValue = 'active'
      }
      fillValue = 'green'
      shapeValue = 'dot'
      break

    case 'disconnected':
    case 'terminated':
      fillValue = 'red'
      shapeValue = 'ring'
      break

    case 'polling':
      fillValue = 'green'
      if (showActivities) {
        shapeValue = 'ring'
      } else {
        statusValue = 'active'
        shapeValue = 'dot'
      }
      break

    default:
      if (!statusValue || statusValue === 'waiting') {
        fillValue = 'blue'
        statusValue = 'waiting ...'
      }
      break
  }

  return {fill: fillValue, shape: shapeValue, status: statusValue}
}
