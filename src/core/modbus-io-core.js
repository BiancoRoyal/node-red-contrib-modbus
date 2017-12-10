/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */
'use strict'

var de = de || {biancoroyal: {modbus: {io: {core: {}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.io.core.internalDebug = de.biancoroyal.modbus.io.core.internalDebug || require('debug')('contribModbus:io:core') // eslint-disable-line no-use-before-define
de.biancoroyal.modbus.io.core.LineByLineReader = de.biancoroyal.modbus.io.core.LineByLineReader || require('line-by-line') // eslint-disable-line no-use-before-define

de.biancoroyal.modbus.io.core.nameValuesFromIOFile = function (msg, configData, values) {
  let namedValues = []
  let ioCore = de.biancoroyal.modbus.io.core

  configData.forEach(function (mapping) {
    if (mapping.valueAddress.startsWith('%I')) {
      namedValues.push(ioCore.buildInputAddressMapping('MB-INPUTS', mapping, mapping.name.substring(0, 1)))
    }

    if (mapping.valueAddress.startsWith('%Q')) {
      namedValues.push(ioCore.buildOutputAddressMapping('MB-OUTPUTS', mapping, mapping.name.substring(0, 1)))
    }
  })

  return ioCore.insertValues(namedValues, values)
}

de.biancoroyal.modbus.io.core.buildInputAddressMapping = function (registerName, mapping, type) {
  let addressStart = 0
  let coilStart = 0
  let addressOffset = 0
  let bits = 0
  let bitAddress = ''

  let registerType = mapping.valueAddress.substring(2, 3)
  let addressType = mapping.valueAddress.substring(0, 3)

  switch (type) {
    case 'w':
    case 'i':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 1
      bits = 16
      break
    case 'd':
    case 'r':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 2
      bits = 32
      break
    case 'l':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 4
      bits = 64
      break
    case 'b':
      if (registerType === 'X') {
        bitAddress = mapping.valueAddress.split('%IX')[1].split('.')
        addressStart = Math.floor(Number(bitAddress[0]) / 2)
        coilStart = Number(bitAddress[0]) * 8 + Number(bitAddress[1])
        addressOffset = 1
        bits = 1
      }
      break
    default:
      bits = 0
  }

  if (bits) {
    return {
      'register': registerName,
      'name': mapping.name,
      'addressStart': addressStart,
      'addressOffset': addressOffset,
      'coilStart': coilStart,
      'bitAddress': bitAddress,
      'bits': bits,
      'type': 'input'
    }
  }

  return {'name': mapping.name, 'type': type, 'mapping': mapping, 'error': 'does not match in input mapping'}
}

de.biancoroyal.modbus.io.core.buildOutputAddressMapping = function (registerName, mapping, type) {
  let addressStart = 0
  let coilStart = 0
  let addressOffset = 0
  let bits = 0
  let bitAddress = 'none'

  let registerType = mapping.valueAddress.substring(2, 3)
  let addressType = mapping.valueAddress.substring(0, 3)

  switch (type) {
    case 'w':
    case 'i':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 1
      bits = 16
      break
    case 'd':
    case 'r':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 2
      bits = 32
      break
    case 'l':
      addressStart = Number(mapping.valueAddress.split(addressType)[1])
      addressOffset = 4
      bits = 64
      break
    case 'b':
      if (registerType === 'X') {
        bitAddress = mapping.valueAddress.split('%QX')[1].split('.')
        addressStart = Math.floor(Number(bitAddress[0]) / 2)
        coilStart = Number(bitAddress[0]) * 8 + Number(bitAddress[1])
        addressOffset = 1
        bits = 1
      }
      break
    default:
      bits = 0
  }

  if (bits) {
    return {
      'register': registerName,
      'name': mapping.name,
      'addressStart': addressStart,
      'addressOffset': addressOffset,
      'coilStart': coilStart,
      'bitAddress': bitAddress,
      'bits': bits,
      'type': 'output'
    }
  }

  return {'name': mapping.name, 'type': type, 'mapping': mapping, 'error': 'does not match in output mapping'}
}

de.biancoroyal.modbus.io.core.insertValues = function (namedValues, register) {
  namedValues.forEach(function (item) {
    if (item.hasOwnProperty('addressStart')) {
      if (de.biancoroyal.modbus.io.core.isRegisterSizeWrong(register, item.addressStart, Number(item.bits))) {
        return
      }

      switch (Number(item.bits)) {
        case 1:
          item.value = !!((register[item.addressStart] & Math.pow(2, item.bitAddress[1])))
          break
        case 16:
          item.value = register[item.addressStart]
          break
        case 32:
          item.value = register[item.addressStart + 1] << 16 | register[item.addressStart]
          break
        case 64:
          item.value = register[item.addressStart + 3] << 48 | register[item.addressStart + 2] << 32 | register[item.addressStart + 1] << 16 | register[item.addressStart]
          break
        default:
          item.value = 'none'
          break
      }
    }
  })

  return namedValues
}

de.biancoroyal.modbus.io.core.isRegisterSizeWrong = function (register, start, bits) {
  let sizeDivisor = (bits === 1) ? 16 : 1
  let startRegister = start / sizeDivisor
  return (register.length < startRegister)
}

de.biancoroyal.modbus.io.core.readIOConfigFile = function (configIOFile) {
  return new Promise(
    function (resolve, reject) {
      let lineReader = new de.biancoroyal.modbus.io.core.LineByLineReader(configIOFile.path)
      let configData = []

      lineReader.on('error', function (err) {
        reject(err)
      })

      lineReader.on('line', function (line) {
        if (line) {
          configData.push(JSON.parse(line))
        }
      })

      lineReader.on('end', function () {
        resolve(configData)
      })
    }
  )
}

module.exports = de.biancoroyal.modbus.io.core
