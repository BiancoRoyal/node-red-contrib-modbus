const helper = require('node-red-node-test-helper');
const sinon = require('sinon');
const { expect } = require('chai');
const fs = require('fs-extra');
const coreIO = require('../../src/modbus-io-config'); 
const nodeUnderTest = require('../../src/modbus-io-config.js')
const readNode = require('../../src/modbus-read.js')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

helper.init(require.resolve('node-red'));
describe('Modbus Flow E2E Test', function () {
    const flow = [
        {
            id: "1a2b3c4d5e6f7g8h",
            type: "tab",
            label: "My Modbus Flow",
            disabled: false,
            info: "",
            env: []
        },
        {
            id: "a1b2c3d4e5f6g7h8",
            type: "modbus-read",
            z: "1a2b3c4d5e6f7g8h",
            name: "",
            topic: "",
            showStatusActivities: false,
            logIOActivities: false,
            showErrors: false,
            unitid: "",
            dataType: "Coil",
            adr: "0",
            quantity: "1",
            rate: "10",
            rateUnit: "s",
            delayOnStart: false,
            startDelayTime: "",
            server: "b1c2d3e4f5g6h7i8",
            useIOFile: true,
            ioFile: "c1d2e3f4g5h6i7",
            useIOForPayload: false,
            emptyMsgOnFail: false,
            x: 350,
            y: 240,
            wires: [
                [],
                []
            ]
        },
        {
            id: "b1c2d3e4f5g6h7i8",
            type: "modbus-client",
            name: "",
            clienttype: "tcp",
            bufferCommands: true,
            stateLogEnabled: false,
            queueLogEnabled: false,
            failureLogEnabled: true,
            tcpHost: "127.0.0.1",
            tcpPort: "50502",
            tcpType: "DEFAULT",
            serialPort: "/dev/ttyUSB",
            serialType: "RTU-BUFFERD",
            serialBaudrate: "9600",
            serialDatabits: "8",
            serialStopbits: "1",
            serialParity: "none",
            serialConnectionDelay: "100",
            serialAsciiResponseStartDelimiter: "0x3A",
            unit_id: "1",
            commandDelay: "1",
            clientTimeout: "1000",
            reconnectOnTimeout: true,
            reconnectTimeout: "2000",
            parallelUnitIdsAllowed: true
        },
        {
            id: "c1d2e3f4g5h6i7",
            type: "modbus-io-config",
            name: "ModbusIOConfig",
            path: "testpath",
            format: "utf8",
            addressOffset: ""
        }
    ];

    const modbusNodes = [injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode];

    before(function (done) {
        helper.startServer(done);
    });

    after(function (done) {
        helper.stopServer(done);
    });

    beforeEach(function (done) {
        helper.load(modbusNodes, flow, done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should initialize the Modbus IO Config node and read the IO file', function (done) {
        const modbusConfigNodeId = 'c1d2e3f4g5h6i7';
        const modbusConfigNode = helper.getNode(modbusConfigNodeId);

        expect(modbusConfigNode).to.have.property('name', 'ModbusIOConfig');
     
        const lineByLineReaderOnStub = sinon.stub();
        lineByLineReaderOnStub.withArgs('line').callsFake((event, callback) => {
            if (event === 'line') callback('{"key": "value"}');
        });
        lineByLineReaderOnStub.withArgs('end').callsFake((event, callback) => {
            if (event === 'end') callback();
        });
        lineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
            if (event === 'error') callback(new Error('test error'));
        });

        // sinon.stub(coreIO, 'LineByLineReader').returns({
        //     on: lineByLineReaderOnStub
        // });
        // sinon.stub(coreIO, 'internalDebug');
        const fsWatchFileStub = sinon.stub(fs, 'watchFile').callsFake((path, callback) => {
            setTimeout(() => {
                callback({ mtime: new Date() }, { mtime: new Date(Date.now() - 1000) });
            }, 1000);
        });

        setTimeout(() => {
            expect(modbusConfigNode.configData).to.deep.equal([]);
             expect(modbusConfigNode).to.have.property('lastUpdatedAt').that.is.not.null;

            // Simulate file change and re-read
            const newLineByLineReaderOnStub = sinon.stub();
            newLineByLineReaderOnStub.withArgs('line').callsFake((event, callback) => {
                if (event === 'line') callback('{"key": "newValue"}');
            });
            newLineByLineReaderOnStub.withArgs('end').callsFake((event, callback) => {
                if (event === 'end') callback();
            });
            newLineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
                if (event === 'error') callback(new Error('new test error'));
            });

            coreIO.LineByLineReader.restore();
            sinon.stub(coreIO, 'LineByLineReader').returns({
                on: newLineByLineReaderOnStub
            });

            fsWatchFileStub.yield({ mtime: new Date() }, { mtime: new Date(Date.now() - 2000) });

            setTimeout(() => {
                expect(modbusConfigNode.configData).to.deep.equal([{ key: 'newValue' }]);
                expect(modbusConfigNode).to.have.property('lastUpdatedAt').that.is.not.null;

                sinon.stub(fs, 'unwatchFile');
                sinon.spy(modbusConfigNode.watcher, 'stop');
                modbusConfigNode.emit('close', function () {
                    expect(fs.unwatchFile.calledWith(modbusConfigNode.path)).to.be.true;
                    expect(modbusConfigNode.watcher.stop.called).to.be.true;

                    coreIO.LineByLineReader.restore();
                    fs.watchFile.restore();
                    fs.unwatchFile.restore();
                    coreIO.internalDebug.restore();

                    done();
                });
            }, 1500);
        }, 1500);
    });

    it('should handle file read error', function (done) {
        const modbusConfigNodeId = 'c1d2e3f4g5h6i7';
        const modbusConfigNode = helper.getNode(modbusConfigNodeId);

        expect(modbusConfigNode).to.have.property('name', 'ModbusIOConfig');

        const lineByLineReaderOnStub = sinon.stub();
        lineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
            if (event === 'error') callback(new Error('test error'));
        });

        // sinon.stub(coreIO, 'LineByLineReader').returns({
        //     on: lineByLineReaderOnStub
        // });
        // const internalDebugSpy = sinon.spy(coreIO, 'internalDebug');

        setTimeout(() => {
            // expect(internalDebugSpy.calledWith('test error')).to.be.true;

            // coreIO.LineByLineReader.restore();
            // internalDebugSpy.restore();

            done();
        }, 500);
    });
});

