
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
            "server": "73c34548e2954bf6",
            "emptyMsgOnFail": false,
            "keepMsgProperties": false,
            "delayOnStart": false,
            "startDelayTime": "",
            "selectedFc": "7b355bfa-4000-11ee-9d35-039b8e9e9955",
            "fc": "0x01",
            "requestCard": [
                {
                    "name": "Address",
                    "data": 0,
                    "offset": 0,
                    "type": "uint16be"
                },
                {
                    "name": "Quantity",
                    "data": 2,
                    "offset": 2,
                    "type": "uint16be"
                }
            ],
            "responseCard": [
                {
                    "name": "ByteCount",
                    "data": 0,
                    "offset": 0,
                    "type": "uint8be"
                }
            ],
            "lastSelectedFc": "7b355bfa-4000-11ee-9d35-039b8e9e9955",
            "x": 660,
            "y": 340,
            "wires": [
                [
                    "db1e89ae92dc7250"
                ]
            ]
        },
        {
            "id": "db1e89ae92dc7250",
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
            "x": 920,
            "y": 340,
            "wires": []
        },
        {
            "id": "73c34548e2954bf6",
            "type": "modbus-client",
            "name": "",
            "clienttype": "tcp",
            "bufferCommands": true,
            "stateLogEnabled": false,
            "queueLogEnabled": false,
            "failureLogEnabled": true,
            "tcpHost": "0.0.0.0",
            "tcpPort": "40081",
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


