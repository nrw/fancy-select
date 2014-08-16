var mercury = require('mercury')

FancySelect.render = require('./view')

module.exports = FancySelect

function FancySelect (options) {
  var events = {
    backspace: mercury.input(),
    select: mercury.input(),
    dropdown: mercury.input(),
    input: mercury.input()
  }

  events.backspace(function () {
    if (!state.typing()) {
      var val = value()
      val.pop()
      value.set(val)
    }
  })

  events.input(function (val) {
    state.typing.set(val)
  })

  events.select(function (opt) {
    var val = value()
    val.push(opt)
    value.set(val)
  })

  events.dropdown(function (open) {
    state.isOpen.set(open)
  })

  var opts = mercury.value(options.options)
  var value = mercury.value(options.value)

  var state = mercury.struct({
    events: events,
    options: opts,
    value: value,
    isOpen: mercury.value(false),
    typing: mercury.value(''),
    available: mercury.computed([opts, value], function (opts, value) {
      var ids = value.map(function (v) { return v.id })

      return opts.filter(function (opt) {
        return !~ids.indexOf(opt.id)
      })
    })
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
