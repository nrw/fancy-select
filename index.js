var mercury = require('mercury')
var document = require('global/document')
var cloneDeep = require('lodash.clonedeep')

FancySelect.render = require('./view')
var nav = require('./navigate')
var Filter = require('./nested-filter')

module.exports = FancySelect

function FancySelect (options) {
  var filterRegex = function (query) {
    return new RegExp(query, 'i')
  }

  var events = {
    backspace: mercury.input(),
    select: mercury.input(),
    dropdown: mercury.input(),
    input: mercury.input(),
    refocus: mercury.input(),
    close: mercury.input(),
    focusNext: mercury.input(),
    focusPrev: mercury.input(),
    readPath: nav.readPath
  }

  events.backspace(function () {
    if (!state.query()) {
      var val = value()
      val.pop()
      value.set(val)
    }
  })

  events.input(function (val) {
    state.query.set(val.query)
  })

  events.select(function (opt) {
    var val = value()
    val.push(opt)
    value.set(val)
    query.set('')
    focused.set(nav.nearestOption(available(), focused()))
  })

  events.dropdown(function (open) {
    state.isOpen.set(open)
  })

  var opts = mercury.value(options.options)
  var value = mercury.value(options.value)
  var query = mercury.value('')
  var selectedIds = mercury.computed([value], function (value) {
    return value.map(function (one) { return one.id })
  })

  // options - selected - not matching query
  var available = mercury.computed([
    opts, value, query, selectedIds
  ], function (opts, value, query, ids) {
    opts = cloneDeep(opts)
    Filter.runFilter(unselectedFilter(ids), opts, '')
    Filter.runFilter(queryFilter, opts, query, {keepMatchChildren: true})
    return opts
  })

  var focused = mercury.value(nav.nextOption(available()))
  // refocus when available changes
  available(function (val) {
    // events.selectNext({
    //   focused: state.focused(),
    //   available: val
    // })
  })

  events.focusNext(function (data) {
    var node = nav.nextOption(data.available, data.focused)
    if (node) {
      focused.set(node)
    }
  })

  events.focusPrev(function (data) {
    var node = nav.prevOption(data.available, data.focused)
    if (node) {
      focused.set(node)
    }
  })

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    focused: focused,
    focusedId: mercury.computed([available, focused], function (available, focused) {
      // console.log('id', available, focused, readIndex(available, focused))
      var node = nav.readPath(available, focused)
      // console.log(node, focused)
      return node ? node.id : null
    }),
    selectedIds: selectedIds,
    isOpen: mercury.value(false),
    query: query,
    available: available
    // focused: mercury.value(0)
  })

  var c
  window.next = function () {
    nextOption(opts())
    nextOption(opts(), [0, 0])
    nextOption(opts(), [0, 1])
    nextOption(opts(), [0, 2])
  }
  return {
    state: state,
    events: {
      onChange: onChange
    }
  }

  function onChange (argument) {
  }
}

function queryFilter (opt, query) {
  try {
    var regex = new RegExp(query, 'i')
    return opt.title && regex.test(opt.title)
  } catch (e) {
    return false
  }
}

function unselectedFilter (existing) {
  return function (opt) {
    return !opt.id || !~existing.indexOf(opt.id)
  }
}
