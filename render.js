var fs = require('fs')
var mercury = require('mercury')
var arrayEqual = require('array-equal')

var slice = Array.prototype.slice
var h = mercury.h

var insertCss = require('insert-css')
insertCss(fs.readFileSync(__dirname + '/styles/core.css', 'utf8'))

module.exports = render

function render (state) {
  var temp = template.bind(null, state)
  return template(state, 'combobox')
}

function template (state, name) {
  var temp = state.templates && state.templates[name] ?
    state.templates[name] : templates[name]
  return temp.apply(null, [state, template.bind(null, state)]
    .concat(slice.call(arguments, 2))
  )
}

var templates = {
  combobox: function (state, template) {
    return h('div.fancy-select', [
      template('textbox'),
      template('listbox')
    ])
  },
  textbox: function (state, template) {
    return h('div.background', {
      'ev-click': state.events.focusBackground
    }, [
      h('div.list', [
        state.value.map(function (v) { return h('span.listitem', v.title) })
      ]),
      template('input')
    ])
  },
  listbox: function (state, template) {
    return !state.isOpen ? null :
      h('div.listbox', template('group', state.filtered))
  },
  group: function (state, template, items, base) {
    base = base || []

    return items.map(function (option, index) {
      var path = base.slice(0).concat(index)

      if (option.options) {
        return h('div', [
          h('label.group-label', option.title),
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
      className: option.id && arrayEqual(path, state.active) ? 'focused' : '',
      'ev-click': state.events.clickOption.bind(null, path)
    }, template('optionlabel', option, path))
  },
  optionlabel: function (state, template, option) {
    return option.title
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

      'ev-event': state.events.inputEvent,
      'ev-input': mercury.valueEvent(state.events.input, {
        preventDefault: false
      })
    })
  }
}
