const helper = require('node-red-node-test-helper')
// const sinon = require('sinon')
// const { expect } = require('chai')
// const fs = require('fs-extra')
// const coreIO = require('../../src/modbus-io-config')
const nodeUnderTest = require('../../src/modbus-io-config.js')
const readNode = require('../../src/modbus-read.js')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

helper.init(require.resolve('node-red'))
const testFlows = require('./flows/modbus-io-config-e2e-flows.js')
const testIoConfigNodes = [injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

describe('Modbus Flow E2E Test', function () {
  before(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      done()
    }).catch(function () {
      done()
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  // it('should initialize the Modbus IO Config node and read the IO file', function (done) {
  //   const modbusConfigNodeId = 'c1d2e3f4g5h6i7'
  //   const modbusConfigNode = helper.getNode(modbusConfigNodeId)

  //   expect(modbusConfigNode).to.have.property('name', 'ModbusIOConfig')

  //   const lineByLineReaderOnStub = sinon.stub()
  //   // lineByLineReaderOnStub.withArgs('line').callsFake((event, callback) => {
  //   //   if (event === 'line') callback('{"key": "value"}')
  //   // })
  //   // lineByLineReaderOnStub.withArgs('end').callsFake((event, callback) => {
  //   //   if (event === 'end') callback()
  //   // })
  //   lineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
  //     if (event === 'error') callback(new Error('test error'))
  //   })

  //   expect(modbusConfigNode.configData).to.deep.equal([])
  //   expect(modbusConfigNode).to.have.property('lastUpdatedAt').that.is.not.null()

  //   expect(modbusConfigNode.configData).to.deep.equal([{ key: 'value' }])
  //   expect(modbusConfigNode).to.have.property('lastUpdatedAt').that.is.not.null()

  //   // Simulate file change and re-read
  //   const newLineByLineReaderOnStub = sinon.stub()
  //   // newLineByLineReaderOnStub.withArgs('line').callsFake((event, callback) => {
  //   //   if (event === 'line') callback('{"key": "newValue"}')
  //   // })
  //   // newLineByLineReaderOnStub.withArgs('end').callsFake((event, callback) => {
  //   //   if (event === 'end') callback()
  //   // })
  //   newLineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
  //     if (event === 'error') callback(new Error('new test error'))
  //   })

  //   coreIO.LineByLineReader.restore()
  //   sinon.stub(coreIO, 'LineByLineReader').returns({
  //     on: newLineByLineReaderOnStub
  //   })

  //   // fsWatchFileStub.yield({ mtime: new Date() }, { mtime: new Date(Date.now() - 2000) })

  //   expect(modbusConfigNode.configData).to.deep.equal([{ key: 'newValue' }])
  //   expect(modbusConfigNode).to.have.property('lastUpdatedAt').that.is.not.null()

  //   sinon.stub(fs, 'unwatchFile')
  //   sinon.spy(modbusConfigNode.watcher, 'stop')
  //   modbusConfigNode.emit('close', function () {
  //     expect(fs.unwatchFile.calledWith(modbusConfigNode.path)).to.be.true()
  //     expect(modbusConfigNode.watcher.stop.called).to.be.true()

  //     coreIO.LineByLineReader.restore()
  //     fs.watchFile.restore()
  //     fs.unwatchFile.restore()
  //     coreIO.internalDebug.restore()

  //     done()
  //   })

  // })

  // it('should handle file read error', function (done) {
  //   const modbusConfigNodeId = 'c1d2e3f4g5h6i7'
  //   const modbusConfigNode = helper.getNode(modbusConfigNodeId)

  //   expect(modbusConfigNode).to.have.property('name', 'ModbusIOConfig')

  //   const lineByLineReaderOnStub = sinon.stub()
  //   lineByLineReaderOnStub.withArgs('error').callsFake((event, callback) => {
  //     if (event === 'error') callback(new Error('test error'))
  //   })

  //   // sinon.stub(coreIO, 'LineByLineReader').returns({
  //   //     on: lineByLineReaderOnStub
  //   // });
  //   // const internalDebugSpy = sinon.spy(coreIO, 'internalDebug');

  //   // expect(internalDebugSpy.calledWith('test error')).to.be.true;

  //   // coreIO.LineByLineReader.restore();
  //   // internalDebugSpy.restore();

  //   done()
  // })

  it('should add parsed JSON lines to node.configData', function () {
    helper.load(testIoConfigNodes, testFlows.testShouldBeLoadedFlow, function () {
      const modbusIOConfigNode = helper.getNode('2f5a90d.bcaa1f')
      console.log(modbusIOConfigNode, 'hjjj')
    //   const testLine = '{"key": "value"}'
    //   fs.readFile('./test_file.txt')
    //   console.log(testLine, 'nnjn')
    //   setTimeout(function () {
    //     sinon.assert.calledWith(errorStub, sinon.match.instanceOf(Error), msg)
    //     sinon.assert.calledWith(sendStub, msg)
    //   }, 0)
    })
  })
})
