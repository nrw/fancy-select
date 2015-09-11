var fs = require('fs')
var hg = require('mercury')
var arrayEqual = require('array-equal')

var slice = Array.prototype.slice
var h = hg.h

var insertCss = require('insert-css')

insertCss(fs.readFileSync(__dirname + '/styles/core.css', 'utf8'))

var sendContext = hg.BaseEvent(function contextLambda (ev, broadcast) {
  broadcast(ev)
})

var sendDataContext = hg.BaseEvent(function contextLambda (ev, broadcast) {
  broadcast({event: ev, data: this.data})
})

module.exports = {
  custom: custom,
  'default': render.bind(null, {})
}

function render (overrides, state) {
  return template(overrides, state, 'combobox')
}

function custom (overrides) {
  return render.bind(null, overrides)
}

function template (overrides, state, name) {
  var temp = overrides && overrides[name]
    ? overrides[name] : templates[name]
  return temp.apply(null, [state, template.bind(null, overrides, state)]
    .concat(slice.call(arguments, 3))
  )
}

var templates = {
  combobox: function (state, template) {
    return h('div.fancy-select', {className: state.isOpen ? 'focused' : ''}, [
      template('textbox'),
      template('listbox')
    ])
  },
  textbox: function (state, template) {
    return h('div.background', {
      'ev-click': sendContext(state.channels.focusInput)
    }, [
      h('div.list', [
        state.value.map(function (v) { return h('span.listitem', v.label) })
      ]),
      template('input')
    ])
  },
  listbox: function (state, template) {
    return !state.isOpen ? null
      : h('div.listbox', template('group', state.filtered))
  },
  group: function (state, template, items, base) {
    base = base || []

    return items.map(function (option, index) {
      var path = base.slice(0).concat(index)

      if (option.options) {
        return h('div.groupbox', [
          h('label.grouplabel', option.label),
          h('div.group', template('group', option.options, path))
        ])
      } else {
        return template('option', option, path)
      }
    })
  },
  option: function (state, template, option, path) {
    return h('div.option', {
      tabIndex: 1000,
      className: option.value && arrayEqual(path, state.active) ? 'focused' : '',
      'ev-click': sendDataContext(state.channels.clickOption, path)
    }, template('optionlabel', option, path))
  },
  optionlabel: function (state, template, option) {
    return option.label
  },
  input: function (state, template) {
    return h('input', {
      type: 'text',
      name: 'query',
      autocomplete: 'off',

      value: state.query,
      placeholder: state.placeholder,
      style: {
        width: state.inputWidth + 'px'
      },

      'ev-input': hg.sendValue(state.channels.setQuery, {}),
      'ev-event': sendContext(state.channels.inputEvent)
    })
  }
}
