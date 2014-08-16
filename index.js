var mercury = require('mercury')

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
    input: mercury.input()
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

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    isOpen: mercury.value(false),
    query: query,
    available: available
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
