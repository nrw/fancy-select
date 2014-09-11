var slice = Array.prototype.slice
var mutableFocus = require('./mutable-focus')

var Key = {ENTER: 13, BACKSPACE: 8, UP: 38, DOWN: 40, COMMA: 188, ESCAPE: 27}

module.exports = {
  focusBackground: focusBackground,
  inputEvent: inputEvent,
  select: select,
  backspace: backspace,
  input: input,
  setOpen: setOpen,
  next: next,
  prev: prev,
  clickOption: clickOption
}

function focusBackground (e) {
  e.currentTarget.children[1].focus()
}

function select (state, active) {
  state.tree.select.apply(null, slice.call(arguments, 1))
  state.tree.setQuery('')
}

function backspace (state) {
  if (!state.query()) {
    state.tree.pop()
  }
}

function input (state, val) {
  state.tree.setQuery(val.query)
}

function setOpen (state, open) {
  state.isOpen.set(open)
}

function next (state) {
  state.tree.next()
}

function prev (state) {
  state.tree.prev()
}

function clickOption (state, path, e) {
  state.events.select(path)
  focusInput(state, e.currentTarget)
}

function focusInput (state, node) {
  while (node.className !== 'fancy-select') {
    node = node.parentNode
  }
  node.children[0].children[1].focus()
}

var textboxEvents = {
  blur: function (state, e) {
    var relatedTarget = e.relatedTarget

    // TODO: this will likely stop working until
    // https://github.com/Raynos/dom-delegator/pull/4 is fixed
    if (
      !relatedTarget ||
      !e.currentTarget.parentNode.parentNode.contains(relatedTarget)
    ) {
      state.events.setOpen(false)
    }
  },
  focus: function (state, e) {
    state.events.setOpen(true)
  },
  keydown: function (state, e) {
    switch (e.keyCode) {
      case Key.BACKSPACE:
        state.events.backspace()
        break
      case Key.COMMA:
      case Key.ENTER:
        state.events.select(state.active())
        e.preventDefault()
        break
      case Key.DOWN:
        state.events.next()
        e.preventDefault()
        break
      case Key.UP:
        state.events.prev()
        e.preventDefault()
        break
      case Key.ESCAPE:
        e.currentTarget.blur()
        break
    }
  }
}

function inputEvent (state, e) {
  mutableFocus()
  if (textboxEvents[e.type]) {
    textboxEvents[e.type](state, e)
  }
}