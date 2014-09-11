var mercury = require('mercury')
var window = require('global/window')
var h = mercury.h
var mutableFocus = require('./mutable-focus')
var fs = require('fs')
var insertCss = require('insert-css')

var arrayEqual = require('array-equal')

insertCss(fs.readFileSync(__dirname + '/styles/core.css', 'utf8'))

module.exports = render

function render (state) {
  return h('div.fancy-select', [
    renderTextbox(state),
    renderListbox(state)
  ])
}

function renderTextbox (state) {
  return h('div.background', {
    'ev-click': function (e) {
      e.currentTarget.children[1].focus()
    }
  }, [
    h('div.list', [
      state.value.map(function (v) {
        return h('span.listitem', v.title)
      })
    ]),
    h('input', {
      type: 'text',
      name: 'query',
      value: state.query,
      autocomplete: 'off',
      placeholder: state.placeholder,
      style: {width: state.inputWidth + 'px'},
      'ev-event': state.events.inputEvent,
      'ev-input': mercury.valueEvent(state.events.input, {
        preventDefault: false
      })
    })
  ])
}

function renderListbox (state) {
  return !state.isOpen ? null :
    h('div.listbox', renderGroup(state, state.filtered))
}

function renderOption (state, option, path) {
  return h('div.option', {
    tabIndex: 1000,
    className: option.id && arrayEqual(path, state.active) ? 'focused' : '',
    'ev-click': state.events.clickOption.bind(null, path)
  }, renderOptionTitle(option))
}

function renderOptionTitle (option) {
  return option.title
}

function renderGroup (state, items, base) {
  base = base || []

  return items.map(function (option, index) {
    var path = base.slice(0).concat(index)

    if (option.options) {
      return h('div', [
        h('label.group-label', option.title),
        h('div.group', renderGroup(state, option.options, path))
      ])
    } else {
      return renderOption(state, option, path)
    }
  })
}
