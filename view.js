var mercury = require('mercury')
var window = require('global/window')
var h = mercury.h
var mutableFocus = require('./mutable-focus')
var fs = require('fs')
var insertCss = require('insert-css')

var arrayEqual = require('array-equal')

insertCss(fs.readFileSync(__dirname + '/styles/core.css', 'utf8'))

var ENTER = 13
var BACKSPACE = 8
var UP = 38
var DOWN = 40
var COMMA = 188
var ESCAPE = 27

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
      'ev-event': inputEvent.bind(null, state),
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

function renderGroup (state, items, base) {
  base = base || []

  return items.map(function (opt, index) {
    var path = base.slice(0)
    path.push(index)

    if (opt.options) {
      return h('div', [
        h('label.group-label', opt.title),
        h('div.group', renderGroup(state, opt.options, path))
      ])
    } else {
      return h('div.option', {
        className: opt.id && arrayEqual(path, state.active) ? 'focused' : '',
        tabIndex: 1000,
        'ev-click': function (e) {
          state.events.select(path)
          e.currentTarget.parentNode.parentNode
            .children[0].children[1].focus()
        }
      }, opt.title)
    }
  })
}

var inputEvents = {}
inputEvents.blur = function (state, e) {
  var relatedTarget = e.relatedTarget

  // TODO: this will likely stop working until
  // https://github.com/Raynos/dom-delegator/pull/4 is fixed
  if (
    !relatedTarget ||
    !e.currentTarget.parentNode.parentNode.contains(relatedTarget)
  ) {
    state.events.dropdown(false)
  }
}
inputEvents.focus = function (state, e) {
  state.events.dropdown(true)
}

inputEvents.keydown = function (state, e) {
  switch (e.keyCode) {
    case BACKSPACE:
      state.events.backspace()
      break
    case COMMA:
    case ENTER:
      state.events.select(state.active)
      e.preventDefault()
      break
    case DOWN:
      state.events.next()
      e.preventDefault()
      break
    case UP:
      state.events.prev()
      e.preventDefault()
      break
    case ESCAPE:
      e.currentTarget.blur()
      break
  }
}

function inputEvent (state, e) {
  mutableFocus()
  if (inputEvents[e.type]) {
    inputEvents[e.type](state, e)
  }
}

