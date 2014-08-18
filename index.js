var mercury = require('mercury')
var document = require('global/document')

FancySelect.render = require('./view')

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
    readIndex: readIndex
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
    opts, value, query
  ], function (opts, value, query) {
    var ids = selectedIds()

    var unused = opts.filter(function (opt) {
      return !~ids.indexOf(opt.id)
    })

    if (query) {
      var regex = filterRegex(query)
      return unused.filter(function (opt) {
        return regex.test(opt.title)
      })
    } else {
      return unused
    }
  })

  var focused = mercury.value(nextOption(available()))
  // refocus when available changes
  available(function (val) {
    // events.selectNext({
    //   focused: state.focused(),
    //   available: val
    // })
  })

  events.focusNext(function (data) {
    // console.log('next', data.available, data.focused, nextOption(data.available, data.focused))
    focused.set(nextOption(data.available, data.focused))
  })

  events.focusPrev(function (data) {
    // console.log('prev', data.available, data.focused, nextOption(data.available, data.focused))
    focused.set(prevOption(data.available, data.focused))
  })

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    focused: focused,
    focusedId: mercury.computed([available, focused], function (available, focused) {
      // console.log('id', available, focused, readIndex(available, focused))
      var node = readIndex(available, focused)
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

function prevOption (tree, current) {
  var node, size
  // console.log('NEXT OPT', tree, current)
  if (!current) {
    var base = tree
    current = [0]
    while (base.options) {
      base = tree[0]
      current.push(0)
    }
    return current
  }

  var original = current
  current = current.slice(0)

  var i = current.length - 1
  // console.log('IIII', i)
  while (i >= 0) {
    // console.log('current------1', current)
    current[i]--
    node = readIndex(tree, current)
    // console.log('current------', current, node)

    if (node) {
      return current
    } else {
      // var len = current[i - 1]
      // if (len >= 0) {

      // }
      // console.log('INDEX', readIndex(tree, current.slice(0, i - 1)))
      current[i] = current[i - 1]
      i--
    }
  }

  return original
}

function nextOption (tree, current) {
  var node, size
  // console.log('NEXT OPT', tree, current)
  if (!current) {
    var base = tree
    current = [0]
    while (base.options) {
      base = tree[0]
      current.push(0)
    }
    return current
  }

  var original = current
  current = current.slice(0)

  var i = current.length - 1
  // console.log('IIII', i)
  while (i >= 0) {
    // console.log('current------1', current)
    current[i]++
    node = readIndex(tree, current)
    // console.log('current------', current, node)

    if (node) {
      return current
    } else {
      current[i] = 0
      i--
    }
  }

  return original
  // current[current.length - 1]++
  // size = current.length

  // for (var i = 0; i < current.length - 1; i++) {
  //   node = tree[current[i]]
  // }

  // if (node) {
  // console.log(node)
  // console.log(node[size - 1])
  // }
}

function readIndex (obj, path) {
  // console.log('READ', path)
  var node
  for (var i = 0; i < path.length; i++) {
    node = obj[path[i]]
  }
  return node
}

// last ++
// else  (last - 1)++, last = 0
