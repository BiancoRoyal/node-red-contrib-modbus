

const helperExtensions = require('../../helper/test-helper-extensions')

module.exports = {
    "testShouldBeReadyToSendFlow": helperExtensions.cleanFlowPositionData([
        {
            "id": "ec42ecc63a604e72",
            "type": "tab",
            "label": "Ready To Send",
            "disabled": false,
            "info": "",
            "env": []
        },
        {
            "id": "b0fefd31.802188",
            "type": "modbus-read",
            "z": "ec42ecc63a604e72",
            "name": "",
            "topic": "",
            "showStatusActivities": false,
            "logIOActivities": false,
            "showErrors": false,
            "unitid": "",
            "dataType": "Coil",
            "adr": "0",
            "quantity": "1",
            "rate": "10",
            "rateUnit": "s",
            "delayOnStart": false,
            "startDelayTime": "",
            "server": "1b49af22a0d089c9",
            "useIOFile": true,
            "ioFile": "2f5a90d.bcaa1f",
            "useIOForPayload": false,
            "emptyMsgOnFail": false,
            "x": 350,
            "y": 240,
            "wires": [
                [],
                []
            ]
        },
        {
            "id": "1b49af22a0d089c9",
            "type": "modbus-client",
            "name": "",
            "clienttype": "tcp",
            "bufferCommands": true,
            "stateLogEnabled": false,
            "queueLogEnabled": false,
            "failureLogEnabled": true,
            "tcpHost": "127.0.0.1",
            "tcpPort": "50502",
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
            "parallelUnitIdsAllowed": true
        },
        {
            "id": "2f5a90d.bcaa1f",
            "type": "modbus-io-config",
            "name": "ModbusIOConfig",
            "path": "testpath",
            "format": "utf8",
            "addressOffset": ""
        }
    ])
}