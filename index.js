var mercury = require('mercury')
var document = require('global/document')
var cloneDeep = require('lodash.clonedeep')
var stringWidth = require('styled-string-width')
var slice = Array.prototype.slice
var Update = require('./update')

var render = require('./render')

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
    events: events,

    options: tree.state.options,
    value: tree.state.value,
    filtered: tree.state.filtered,
    query: tree.state.query,
    active: tree.state.active,

    isOpen: mercury.value(true),

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
    render: function (state) {
      return render(data.templates, state)
    },
    state: state,

    setOptions: tree.setOptions,
    setValue: tree.setValue,
    setFilter: tree.setFilter,
    setActions: tree.setActions,
    setQuery: tree.setQuery,
    setTemplates: function (templates) {
      data.templates = templates
    }
  }
}
