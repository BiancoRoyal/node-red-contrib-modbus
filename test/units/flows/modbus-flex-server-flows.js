
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

  "testNodeShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "09209cdbe3c3750f",
      "type": "tab",
      "label": "Node Should Be Loaded",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ebd4bd0a.2f4af8",
      "type": "modbus-flex-server",
      "z": "09209cdbe3c3750f",
      "name": "ModbusFlexServer",
      "logEnabled": false,
      "serverAddress": "0.0.0.0",
      "serverPort": 8512,
      "responseDelay": 100,
      "unitId": 1,
      "delayUnit": "ms",
      "coilsBufferSize": 20000,
      "registersBufferSize": 20000,
      "minAddress": 0,
      "splitAddress": 10000,
      "funcGetCoil": "function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetDiscreteInput": "function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetInputRegister": "function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcGetHoldingRegister": "function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcSetCoil": "function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}",
      "funcSetRegister": "function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}",
      "showErrors": false,
      "x": 370,
      "y": 220,
      "wires": [
        [],
        [],
        [],
        [],
        []
      ]
    }
  ]),

  "testShouldSendDataFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "094d4527dfa1a377",
      "type": "tab",
      "label": "Should Send Data On Input",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ebd4bd0a.2f4af8",
      "type": "modbus-flex-server",
      "z": "094d4527dfa1a377",
      "name": "ModbusFlexServer",
      "logEnabled": false,
      "serverAddress": "0.0.0.0",
      "serverPort": 8512,
      "responseDelay": 100,
      "unitId": 1,
      "delayUnit": "ms",
      "coilsBufferSize": 20000,
      "registersBufferSize": 20000,
      "minAddress": 0,
      "splitAddress": 10000,
      "funcGetCoil": "function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetDiscreteInput": "function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetInputRegister": "function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcGetHoldingRegister": "function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcSetCoil": "function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}",
      "funcSetRegister": "function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}",
      "showErrors": false,
      "x": 410,
      "y": 280,
      "wires": [
        [
          "h1"
        ],
        [],
        [],
        [],
        []
      ]
    },
    {
      "id": "h1",
      "type": "helper",
      "z": "094d4527dfa1a377",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 730,
      "y": 280,
      "wires": []
    },
    {
      "id": "a75e0ccf.e16628",
      "type": "inject",
      "z": "094d4527dfa1a377",
      "name": "",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "2",
      "crontab": "",
      "once": true,
      "onceDelay": 0.1,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 170,
      "y": 300,
      "wires": [
        [
          "ebd4bd0a.2f4af8"
        ]
      ]
    }
  ]),

  "testShouldSendDiscreteDataFlow": helperExtensions.cleanFlowPositionData([
    {
      "id": "88a0232a44c5030b",
      "type": "tab",
      "label": "Should Send Discrete Data",
      "disabled": false,
      "info": "",
      "env": []
    },
    {
      "id": "ebd4bd0a.2f4af8",
      "type": "modbus-flex-server",
      "z": "88a0232a44c5030b",
      "name": "ModbusFlexServer",
      "logEnabled": false,
      "serverAddress": "0.0.0.0",
      "serverPort": 8512,
      "responseDelay": 100,
      "unitId": 1,
      "delayUnit": "ms",
      "coilsBufferSize": 20000,
      "registersBufferSize": 20000,
      "minAddress": 0,
      "splitAddress": 10000,
      "funcGetCoil": "function getFlexCoil(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetDiscreteInput": "function getFlexDiscreteInput(addr, unitID) {\n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.coils.readUInt8(addr * node.bufferFactor) \n\t}  \n}",
      "funcGetInputRegister": "function getFlexInputRegister(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcGetHoldingRegister": "function getFlexHoldingRegsiter(addr, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr > node.splitAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\treturn node.registers.readUInt16BE(addr * node.bufferFactor)  \n\t} \n}",
      "funcSetCoil": "function setFlexCoil(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.coils.writeUInt8(value, addr * node.bufferFactor)  \n\t} \n}",
      "funcSetRegister": "function setFlexRegister(addr, value, unitID) { \n\tif (unitID === node.unitId && \n\t\taddr >= node.minAddress && \n\t\taddr <= node.splitAddress * 2) { \n\n\t\tnode.registers.writeUInt16BE(value, addr * node.bufferFactor)  \n\t} \n}",
      "showErrors": false,
      "x": 370,
      "y": 260,
      "wires": [
        [],
        [],
        [],
        [
          "h1"
        ],
        []
      ]
    },
    {
      "id": "h1",
      "type": "helper",
      "z": "88a0232a44c5030b",
      "name": "",
      "tosidebar": true,
      "console": false,
      "tostatus": false,
      "complete": "payload",
      "targetType": "msg",
      "statusVal": "",
      "statusType": "auto",
      "x": 650,
      "y": 240,
      "wires": []
    },
    {
      "id": "a75e0ccf.e16628",
      "type": "inject",
      "z": "88a0232a44c5030b",
      "name": "",
      "props": [
        {
          "p": "payload"
        },
        {
          "p": "topic",
          "vt": "str"
        }
      ],
      "repeat": "2",
      "crontab": "",
      "once": true,
      "onceDelay": 0.1,
      "topic": "",
      "payload": "",
      "payloadType": "date",
      "x": 130,
      "y": 220,
      "wires": [
        [
          "ebd4bd0a.2f4af8"
        ]
      ]
    }
  ]),

}