var hg = require('mercury')
var stringWidth = require('styled-string-width')
var OptionTree = require('option-tree')
var raf = require('raf')

var render = require('./render')

var Key = {ENTER: 13, BACKSPACE: 8, UP: 38, DOWN: 40, ESCAPE: 27, TAB: 9}

FancySelect.render = render.default
FancySelect.customRender = render.custom

module.exports = FancySelect

function FancySelect (data) {
  data = data || {}
  data.filter = data.filter || defaultFilter

  var tree = OptionTree(data)

  var placeholder = hg.value(data.placeholder || '')
  var separator = hg.value(data.separator || 188)
  var isOpen = hg.value(false)
  var selectOnBlur = hg.value(data.selectOnBlur || false)
  var clearQueryOnSelect = hg.value(data.clearQueryOnSelect || false)

  var inputWidth = hg.computed([tree.query, placeholder], function (s1, s2) {
    var el = '.fancy-select input'
    var width = Math.max(stringWidth(s1, el), stringWidth(s2, el))

    return width + 20 // hack to fix browser subtleties
  })

  return hg.struct({
    channels: {
      clickOption: function (params) {
        tree.channels.select(params.data)

        if (clearQueryOnSelect()) {
          tree.query.set('')
        }

        focusInput(params.event)
      },
      setQuery: function (data) {
        tree.query.set(data.query)
      },
      next: function () {
        tree.channels.next()
      },
      inputEvent: inputEvent,
      focusInput: focusInput,
      focusOnClick: focusOnClick
    },

    // local
    isOpen: isOpen,
    selectOnBlur: selectOnBlur,
    clearQueryOnSelect: clearQueryOnSelect,
    separator: separator,

    placeholder: placeholder,
    inputWidth: inputWidth,

    // exported from option tree
    options: tree.options,
    value: tree.value,
    filtered: tree.filtered,
    query: tree.query,
    active: tree.active,
    actions: tree.actions
  })

  function inputEvent (e) {
    if (e.type === 'focus') {
      isOpen.set(true)
    }

    if (e.type === 'blur') {
      blur(e)
    }

    if (e.type === 'keydown') {
      keydown(e)
    }
  }

  function blur (e) {
    // TODO: this will likely stop working until
    // https://github.com/Raynos/dom-delegator/pull/4 is fixed
    var related = e.relatedTarget
    var notInside = !e.currentTarget.parentNode.parentNode.contains(related)

    if (!related || notInside) {
      if (isOpen() && selectOnBlur()) {
        tree.channels.select(tree.active())
        tree.query.set('')
      }
      isOpen.set(false)

      raf(function () {
        if (related) {
          related.focus()
        }
      })
    }
  }

  function keydown (e) {
    var code = e.keyCode === separator() ? Key.ENTER : e.keyCode

    // must be open when accepting keys
    if (code !== Key.TAB && code !== Key.ESCAPE && !isOpen()) {
      isOpen.set(true)
    }
    // prevent default for the following
    if ([Key.ENTER, Key.DOWN, Key.UP].indexOf(code) !== -1) {
      e.preventDefault()
    }

    if (code === Key.ESCAPE) {
      isOpen.set(false)
      e.currentTarget.blur()
    }

    if (code === Key.BACKSPACE) {
      if (!tree.query()) {
        tree.channels.pop()
      }
    }

    if (code === Key.ENTER) {
      tree.channels.select(tree.active())
      if (clearQueryOnSelect()) {
        tree.query.set('')
      }
      focusInput(e)
    }

    if (code === Key.DOWN) {
      tree.channels.next()
    }

    if (code === Key.UP) {
      tree.channels.prev()
    }
  }
}

function defaultFilter (opt, query, value) {
  // keep any that start with __
  if (opt.value && opt.value.indexOf('__') === 0) return {keep: true}

  // omit value
  for (var i = value.length - 1; i >= 0; i--) {
    if (opt.value === value[i].value) {
      return {keep: false, passes: false, keepChildren: false}
    }
  }

  // match query
  try {
    var regex = new RegExp(query || '', 'i')
    return {
      keepChildren: true,
      passes: (
        (opt.value && regex.test(opt.value)) ||
        (opt.label && regex.test(opt.label))
      )
    }
  } catch (e) {
    return {passes: false}
  }
}

function focusInput (ev) {
  var node = ev.currentTarget

  while (node && !isRootNode(node)) {
    node = node.parentNode
  }

  if (node) {
    raf(function () {
      node.children[0].children[1].focus()
    })
  }
}

function focusOnClick (ev) {
  if (ev.type === 'click') {
    focusInput(ev)
  }
}

function isRootNode (node) {
  return node.className.split(/\s/).indexOf('fancy-select') !== -1
}
