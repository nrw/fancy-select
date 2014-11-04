var mercury = require('mercury')
var document = require('global/document')
var stringWidth = require('styled-string-width')

var OptionTree = require('option-tree')

var Update = require('./update')
var render = require('./render')

var slice = Array.prototype.slice

FancySelect.render = render.default
FancySelect.customRender = render.custom

module.exports = FancySelect

function FancySelect (data) {
  data = data || {}

  data.filter = data.filter || function (opt, query, value) {
    // keep any that start with __
    if (opt.value && opt.value.indexOf('__') === 0) return {keep: true}

    // omit value
    for (var i = value.length - 1; i >= 0; i--) {
      if (opt.value === value[i].value) {
        return {keep: false, passes: false, keepChildren: false}
      }
    }

    // match query
    try {
      var regex = new RegExp(query || '', 'i')
      return {
        keepChildren: true,
        passes: (
          (opt.value && regex.test(opt.value)) ||
          (opt.label && regex.test(opt.label))
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
    events: events,

    options: tree.state.options,
    value: tree.state.value,
    filtered: tree.state.filtered,
    query: tree.state.query,
    active: tree.state.active,

    isOpen: mercury.value(false),

    placeholder: placeholder,
    separator: mercury.value(data.separator || 188),

    inputWidth: mercury.computed([
      tree.state.query, placeholder
    ], function maxWidth () {
      var one, max = 0, strs = slice.call(arguments)
      strs.forEach(function (str) {
        one = stringWidth(str, '.fancy-select input')
        if (one > max) max = one
      })
      return max + 10
    })
  })

  // wire up events
  events.select(Update.select.bind(null, state, tree))
  events.backspace(Update.backspace.bind(null, state, tree))
  events.input(Update.input.bind(null, state, tree))
  events.next(Update.next.bind(null, state, tree))
  events.prev(Update.prev.bind(null, state, tree))

  events.focusBackground = Update.focusBackground.bind(null, state)
  events.inputEvent = Update.inputEvent.bind(null, state)
  events.setOpen = Update.setOpen.bind(null, state)
  events.clickOption = Update.clickOption.bind(null, state)

  return {
    state: state,

    setOptions: tree.setOptions,
    setValue: tree.setValue,
    setFilter: tree.setFilter,
    setActions: tree.setActions,
    setQuery: tree.setQuery
  }
}
