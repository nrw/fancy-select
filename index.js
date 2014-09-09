var mercury = require('mercury')
var document = require('global/document')
var cloneDeep = require('lodash.clonedeep')

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

  var events = {
    backspace: mercury.input(),
    select: tree.select,
    dropdown: mercury.input(),
    input: mercury.input(),
    refocus: mercury.input(),
    close: mercury.input(),
    next: tree.next,
    prev: tree.prev,
    readPath: function (data, path) {
      return NavTree(data).readPath(path)
    }
  }

  events.backspace(function () {
    if (!state.query()) {
      tree.pop()
    }
  })

  events.input(function (val) {
    tree.setQuery(val.query)
  })

  events.dropdown(function (open) {
    state.isOpen.set(open)
  })

  var state = mercury.struct({
    events: events,
    value: tree.state.value,
    filtered: tree.state.filtered,
    query: tree.state.query,
    active: tree.state.active,
    options: tree.state.options,
    isOpen: mercury.value(true),

    placeholder: mercury.value(data.placeholder || '')
  })

  return {
    state: state,
    setOptions: tree.setOptions,
    setQuery: tree.setQuery
  }
}
