/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/* see http://mochajs.org/ */

'use strict'

const assert = require('assert')

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function (done) {
      assert.strict.equal(-1, [1, 2, 3].indexOf(5))
      assert.strict.equal(-1, [1, 2, 3].indexOf(0))
      assert.strict.equal(1, [1, 2, 3].indexOf(2))

      done()
    })

    it('should return index when the value is present', function (done) {
      assert.strict.equal(0, [1, 2, 3].indexOf(1))
      assert.strict.equal(1, [1, 2, 3].indexOf(2))
      assert.strict.equal(2, [1, 2, 3].indexOf(3))

      done()
    })

    it('should work with assert', function () {
      assert.notEqual(4, 5)
      assert.strict.equal(5, 5)
    })
  })
})

describe('Array index of', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.strict.equal(-1, [1, 2, 3].indexOf(4))
    })
  })
})
