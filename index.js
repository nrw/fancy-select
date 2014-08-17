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
    close: mercury.input()
  }

  var willClose

  events.close(function (close) {
    if (close) {
      willClose = setTimeout(function () {
        events.dropdown(false)
      }, 110)
    } else {
      clearTimeout(willClose)
      events.dropdown(true)
      willClose = null
    }
  })

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
    events.close(false)
    var val = value()
    val.push(opt)
    value.set(val)
    query.set('')
  })

  events.dropdown(function (open) {
    state.isOpen.set(open)
  })

  events.refocus(function (data) {
    var delta = data.current + data.change
    if (delta < 0) {
      delta = 0
    }

    if (delta > data.available.length - 1) {
      delta = data.available.length - 1
    }

    state.focused.set(delta)
  })

  var opts = mercury.value(options.options)
  var value = mercury.value(options.value)
  var query = mercury.value('')

  // options - selected - not matching query
  var available = mercury.computed([
    opts, value, query
  ], function (opts, value, query) {
    var ids = value.map(function (v) { return v.id })

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

  // refocus when available changes
  available(function (val) {
    events.refocus({
      change: 0,
      current: state.focused(),
      available: val
    })
  })

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    isOpen: mercury.value(false),
    query: query,
    available: available,
    focused: mercury.value(0)
  })

  return {
    state: state,
    events: {
      onChange: onChange
    }
  }

  function onChange (argument) {
  }
}
