var test = require('tape')

var mercury = require('mercury')

// FFFfffff--- phantomJS.
if (!Function.prototype.bind) {
  Function.prototype.bind = require('function-bind')
}

test('mercury is a object', function (t) {
  t.equal(typeof mercury, 'object')
  t.end()
})

require('./navigate.js')
require('./nested-filter.js')
require('./integration.js')
