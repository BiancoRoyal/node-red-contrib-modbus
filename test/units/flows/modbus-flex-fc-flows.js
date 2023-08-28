
const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = { 
    "modbusFlexFc": helperExtensions.cleanFlowPositionData([
        {
            "id": "f97dec5ce5d2a799",
            "type": "tab",
            "label": "Flow 1",
            "disabled": false,
            "info": "",
            "env": []
        },
        {
            "id": "d975b1203f71a3b5",
            "type": "modbus-flex-fc",
            "z": "f97dec5ce5d2a799",
            "name": "",
            "showStatusActivities": false,
            "showErrors": false,
            "showWarnings": true,
            "unitid": "1",
            "server": "5c2b693859e05456",
            "emptyMsgOnFail": false,
            "keepMsgProperties": false,
            "delayOnStart": false,
            "startDelayTime": "",
            "selectedFc": "2813f7a2-40f4-11ee-a078-f7298669a6cf",
            "fc": "0x01",
            "requestCard": [
                {
                    "name": "startingAddress",
                    "data": 0,
                    "offset": 0,
                    "type": "uint16be"
                },
                {
                    "name": "quanitityCoils",
                    "data": 8,
                    "offset": 2,
                    "type": "uint16be"
                }
            ],
            "responseCard": [
                {
                    "name": "byteCount",
                    "data": 0,
                    "offset": 0,
                    "type": "uint8be"
                },
                {
                    "name": "coilStatus",
                    "data": 0,
                    "offset": 1,
                    "type": "uint8be"
                }
            ],
            "lastSelectedFc": "2813f7a2-40f4-11ee-a078-f7298669a6cf",
            "x": 500,
            "y": 400,
            "wires": [
                [
                    "29dc12925bb8e2d4"
                ]
            ]
        },
        {
            "id": "c77fdcf307244a2f",
            "type": "modbus-server",
            "z": "f97dec5ce5d2a799",
            "name": "test_server",
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
            "x": 470,
            "y": 140,
            "wires": [
                [],
                [],
                [],
                [],
                []
            ]
        },
        {
            "id": "29dc12925bb8e2d4",
            "type": "helper",
            "z": "f97dec5ce5d2a799",
            "name": "helper 1",
            "active": true,
            "tosidebar": true,
            "console": false,
            "tostatus": false,
            "complete": "payload",
            "targetType": "msg",
            "statusVal": "",
            "statusType": "auto",
            "x": 760,
            "y": 400,
            "wires": []
        },
        {
            "id": "5c2b693859e05456",
            "type": "modbus-client",
            "name": "test_server",
            "clienttype": "tcp",
            "bufferCommands": true,
            "stateLogEnabled": false,
            "queueLogEnabled": false,
            "failureLogEnabled": true,
            "tcpHost": "127.0.0.1",
            "tcpPort": "10502",
            "tcpType": "DEFAULT",
            "serialPort": "/dev/ttyUSB",
            "serialType": "RTU-BUFFERD",
            "serialBaudrate": "9600",
            "serialDatabits": "8",
            "serialStopbits": "1",
            "serialParity": "none",
            "serialConnectionDelay": "100",
            "serialAsciiResponseStartDelimiter": "0x3A",
            "unit_id": "1",
            "commandDelay": "1",
            "clientTimeout": "1000",
            "reconnectOnTimeout": true,
            "reconnectTimeout": "2000",
            "parallelUnitIdsAllowed": true,
            "showWarnings": true,
            "showLogs": true
        }
    ])
}


