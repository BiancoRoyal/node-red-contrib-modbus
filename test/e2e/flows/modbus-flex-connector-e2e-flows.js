
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

    "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData(
        [
            {
                "id": "a39e174edce1a54b",
                "type": "modbus-flex-connector",
                "z": "94b3ae6e28cbb7e3",
                "name": "modbus flex connector",
                "maxReconnectsPerMinute": 4,
                "emptyQueue": false,
                "showStatusActivities": false,
                "showErrors": false,
                "server": "a477577e.9e0bc",
                "x": 650,
                "y": 420,
                "wires": [
                    [
                        "ac5a2e2afa548a79"
                    ]
                ]
            },
            {
                "id": "96ba2fdb64280034",
                "type": "inject",
                "z": "94b3ae6e28cbb7e3",
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
                "repeat": "",
                "crontab": "",
                "once": false,
                "onceDelay": 0.1,
                "topic": "",
                "payload": "{     \"connectorType\": \"TCP\",     \"tcpHost\": \"127.0.0.1\",     \"tcpPort\": \"12512\" }",
                "payloadType": "json",
                "x": 410,
                "y": 400,
                "wires": [
                    [
                        "a39e174edce1a54b"
                    ]
                ]
            },
            {
                "id": "34eef8f58d93edd4",
                "type": "modbus-server",
                "z": "94b3ae6e28cbb7e3",
                "name": "modbus server node",
                "logEnabled": false,
                "hostname": "0.0.0.0",
                "serverPort": 10502,
                "responseDelay": 100,
                "delayUnit": "ms",
                "coilsBufferSize": 10000,
                "holdingBufferSize": 10000,
                "inputBufferSize": 10000,
                "discreteBufferSize": 10000,
                "showErrors": false,
                "x": 700,
                "y": 240,
                "wires": [
                    [],
                    [],
                    [],
                    [],
                    []
                ]
            },
            {
                "id": "ac5a2e2afa548a79",
                "type": "helper",
                "z": "94b3ae6e28cbb7e3",
                "name": "helper 16",
                "active": true,
                "tosidebar": true,
                "console": false,
                "tostatus": false,
                "complete": "false",
                "statusVal": "",
                "statusType": "auto",
                "x": 1060,
                "y": 400,
                "wires": []
            },
            {
                "id": "a477577e.9e0bc",
                "type": "modbus-client",
                "name": "Modbus Switch TCP",
                "clienttype": "tcp",
                "bufferCommands": true,
                "stateLogEnabled": false,
                "queueLogEnabled": false,
                "failureLogEnabled": false,
                "tcpHost": "127.0.0.1",
                "tcpPort": "10512",
                "tcpType": "DEFAULT",
                "serialPort": "/dev/ttyUSB",
                "serialType": "RTU-BUFFERD",
                "serialBaudrate": "9600",
                "serialDatabits": "8",
                "serialStopbits": "1",
                "serialParity": "none",
                "serialConnectionDelay": "100",
                "serialAsciiResponseStartDelimiter": "",
                "unit_id": "1",
                "commandDelay": "1",
                "clientTimeout": "1000",
                "reconnectOnTimeout": true,
                "reconnectTimeout": "2000",
                "parallelUnitIdsAllowed": true,
                "showErrors": false,
                "showWarnings": true,
                "showLogs": true
            }
        ])
}