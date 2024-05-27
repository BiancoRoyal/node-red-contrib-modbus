
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {

    "testShouldBeLoadedFlow": helperExtensions.cleanFlowPositionData(
        [
            {
                "id": "eeef27e90296ce6b",
                "type": "modbus-flex-connector",
                "z": "440d3c0aa1f20a63",
                "name": "FlexConnector",
                "maxReconnectsPerMinute": 4,
                "emptyQueue": false,
                "showStatusActivities": true,
                "showErrors": true,
                "server": "a477577e.9e0bc",
                "x": 550,
                "y": 200,
                "wires": [
                    [
                        "9a8b80ec35507158"
                    ]
                ]
            },
            {
                "id": "0cefac770588a086",
                "type": "inject",
                "z": "440d3c0aa1f20a63",
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
                "payload": "{   \"connectorType\": \"TCP\",   \"tcpHost\": \"127.0.0.1\",   \"tcpPort\": \"10512\" }",
                "payloadType": "json",
                "x": 310,
                "y": 140,
                "wires": [
                    [
                        "eeef27e90296ce6b"
                    ]
                ],
                "l": false
            },
            {
                "id": "9a8b80ec35507158",
                "type": "helper",
                "z": "440d3c0aa1f20a63",
                "name": "helper 15",
                "active": true,
                "tosidebar": true,
                "console": false,
                "tostatus": false,
                "complete": "false",
                "statusVal": "",
                "statusType": "auto",
                "x": 820,
                "y": 200,
                "wires": []
            },
            {
                "id": "326135b2c28a74bf",
                "type": "modbus-server",
                "z": "440d3c0aa1f20a63",
                "name": "",
                "logEnabled": false,
                "hostname": "0.0.0.0",
                "serverPort": "10512",
                "responseDelay": 100,
                "delayUnit": "ms",
                "coilsBufferSize": 10000,
                "holdingBufferSize": 10000,
                "inputBufferSize": 10000,
                "discreteBufferSize": 10000,
                "showErrors": false,
                "x": 595,
                "y": 80,
                "wires": [
                    [],
                    [],
                    [],
                    [],
                    []
                ],
                "l": false
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
                "unit_id": 1,
                "commandDelay": 1,
                "clientTimeout": 1000,
                "reconnectOnTimeout": true,
                "reconnectTimeout": 2000,
                "parallelUnitIdsAllowed": true,
                "showErrors": false,
                "showWarnings": true,
                "showLogs": true
            }
        ])
}