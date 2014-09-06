var mercury = require('mercury')
var document = require('global/document')
var cloneDeep = require('lodash.clonedeep')

FancySelect.render = require('./view')

var NavTree = require('option-tree-navigate')
var FilterTree = require('option-tree-filter')
var SelectAction = require('option-select-action')

module.exports = FancySelect

function FancySelect (options, valueStore) {
  var tree = NavTree(options.options)
  options.actions = options.actions || {}
  valueStore = valueStore || SelectAction(options.actions, options.value)

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
    readPath: function (data, path) {
      return NavTree(data).readPath(path)
    }
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
    if (!opt) return
    console.log('opt__', opt, valueStore.value())
    valueStore.select(opt, query())

    var val = valueStore.value()
    value.set(val)
    query.set('')
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
  ], function (data, value, query, ids) {
    return FilterTree(
      FilterTree(data, [unselectedFilter(ids)]).query(),
      [queryFilter],
      {keepMatchChildren: true}
    ).query(query)
  })

  var focused = mercury.value(tree.nextWith('id', available()))
  // refocus when available changes
  available(function (val) {
    focused.set(NavTree(val).nearestWith('id', focused()))
  })

  events.focusNext(function (data) {
    var node = NavTree(data.available).nextWith('id', data.focused)
    if (node) {
      focused.set(node)
    }
  })

  events.focusPrev(function (data) {
    var node = NavTree(data.available).prevWith('id', data.focused)
    if (node) {
      focused.set(node)
    }
  })

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    focused: focused,
    focusedId: mercury.computed([
      available, focused
    ], function (available, focused) {
      var node = NavTree(available).readPath(focused)
      return node ? node.id : null
    }),
    selectedIds: selectedIds,
    isOpen: mercury.value(false),
    query: query,
    available: available
  })

  return {
    state: state,
    events: {}
  }
}

function queryFilter (opt, query) {
  try {
    var regex = new RegExp(query, 'i')
    return (opt.title && regex.test(opt.title)) || (opt && opt.alwaysShow)
  } catch (e) {
    return false
  }
}

function unselectedFilter (existing) {
  // console.log('existing', existing)
  return function (opt) {
    return !opt.id || existing.indexOf(opt.id) === -1
  }
}
