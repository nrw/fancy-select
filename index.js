var mercury = require('mercury')

FancySelect.render = require('./view')

module.exports = FancySelect

function FancySelect (options) {
  var events = {
    keyPress: mercury.input(),
    select: mercury.input(),
    dropdown: mercury.input()
  }

  events.keyPress(function (argument) {
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
