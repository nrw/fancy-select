var mercury = require('mercury')
var document = require('global/document')
var cloneDeep = require('lodash.clonedeep')
var stringWidth = require('styled-string-width')
var slice = Array.prototype.slice
var Update = require('./update')

FancySelect.render = require('./view')

var OptionTree = require('option-tree')

module.exports = FancySelect

function FancySelect (data) {
  data = data || {}

  data.filter = data.filter || function (opt, query, value) {
    // keep any that start with __
    if (opt.id && opt.id.indexOf('__') === 0) return {keep: true}

    // omit value
    for (var i = value.length - 1; i >= 0; i--) {
      if (opt.id === value[i].id) {
        return {keep: false, passes: false, keepChildren: false}
      }
    }

    // match query
    try {
      var regex = new RegExp(query || '', 'i')
      return {
        keepChildren: true,
        passes: (
          (opt.id && regex.test(opt.id)) ||
          (opt.title && regex.test(opt.title))
        )
      }
    } catch (e) {
      return {passes: false}
    }
  }

  var tree = OptionTree(data)

  var events = mercury.input([
    'backspace', 'select', 'dropdown', 'input',
    'refocus', 'close', 'next', 'prev'
  ])

  var placeholder = mercury.value(data.placeholder || '')

  var state = mercury.struct({
    tree: tree,
    events: events,

    value: tree.state.value,
    filtered: tree.state.filtered,
    query: tree.state.query,
    active: tree.state.active,
    options: tree.state.options,

    isOpen: mercury.value(true),

    placeholder: placeholder,
    separator: mercury.value(data.separator || ','),
    inputWidth: mercury.computed([
      tree.state.query, placeholder
    ], function maxWidth () {
      var one, max = 0, strs = slice.call(arguments)
      strs.forEach(function (str) {
        one = stringWidth(str, '.fancy-select input')
        if (one > max) max = one
      })
      return max
    })
  })

  // wire up events
  for (var k in Update) {
    if (typeof events[k] === 'function') {
      events[k](Update[k].bind(null, state))
    } else {
      events[k] = Update[k].bind(null, state)
    }
  }

  return {
    state: state,
    setOptions: tree.setOptions,
    setQuery: tree.setQuery
  }
}
