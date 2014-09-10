var document = require('global/document')
var event = require('synthetic-dom-events')
var mercury = require('mercury')
var raf = require('raf')
var test = require('tape')

var ENTER = 13
var BACKSPACE = 8
var UP = 38
var DOWN = 40
var COMMA = 188

var FancySelect = require('../')

var comp, el, selected, input, options, div, remove

function embed (state, render) {
  div = document.createElement('div')
  document.body.insertBefore(div, document.body.childNodes[0])
  remove = mercury.app(div, state, render)
  el = document.querySelector('.fancy-select')
}

function destroy () {
  if (div) {
    document.body.removeChild(div)
    remove()
  }
}

test('click select', function (t) {
  comp = FancySelect({
    options: [{
      id: 'a',
      title: 'A'
    }, {
      id: 'b',
      title: 'B'
    }, {
      id: 'c',
      title: 'C'
    }],
    value: [{
      id: 'a',
      title: 'A'
    }]
  })

  embed(comp.state, FancySelect.render)

  selected = el.querySelectorAll('.listitem')
  t.equal(selected.length, 1)
  t.equal(selected[0].innerHTML, 'A')

  input = el.querySelector('input')
  input.dispatchEvent(event('focus', {bubbles: true}))

  t.ok(comp.state().isOpen)

  raf(function () {
    options = document.querySelectorAll('.option')

    t.equal(options.length, 2)
    t.equal(options[0].innerHTML, 'B')
    t.equal(options[1].innerHTML, 'C')

    options[1].dispatchEvent(event('click', {bubbles: true}))

    raf(function () {
      options = document.querySelectorAll('.option')
      t.equal(options.length, 1)
      t.equal(options[0].innerHTML, 'B')

      selected = el.querySelectorAll('.listitem')
      t.equal(selected.length, 2)
      t.equal(selected[0].innerHTML, 'A')
      t.equal(selected[1].innerHTML, 'C')
      t.end()
    })
  })
})

test('backspace removes', function (t) {
  input = el.querySelector('input')
  input.dispatchEvent(event('focus', {bubbles: true}))

  raf(function () {
    input.dispatchEvent(event('keydown', {
      keyCode: BACKSPACE,
      bubbles: true
    }))

    raf(function () {
      options = document.querySelectorAll('.option')
      t.equal(options.length, 2)
      t.equal(options[0].innerHTML, 'B')
      t.equal(options[1].innerHTML, 'C')
      selected = el.querySelectorAll('.listitem')
      t.equal(selected.length, 1)
      t.equal(selected[0].innerHTML, 'A')
      t.end()
    })
  })
})

test('typing filters options', function (t) {
  input = el.querySelector('input')
  input.value = 'c'
  input.dispatchEvent(event('input', {bubbles: true}))

  raf(function () {
    options = document.querySelectorAll('.option')
    t.equal(options.length, 1)
    t.equal(options[0].innerHTML, 'C')
    selected = el.querySelectorAll('.listitem')
    t.equal(selected.length, 1)
    t.equal(selected[0].innerHTML, 'A')

    input.dispatchEvent(event('focus', {bubbles: true}))

    raf(function () {
      input.dispatchEvent(event('keydown', {
        keyCode: BACKSPACE,
        bubbles: true
      }))

      selected = el.querySelectorAll('.listitem')
      t.equal(selected.length, 1, 'backspace does not delete when query is set')
      t.equal(selected[0].innerHTML, 'A')
      t.end()
    })
  })
})

test('arrow through dropdown', function (t) {
  input = el.querySelector('input')
  input.value = ''
  input.dispatchEvent(event('input', {bubbles: true}))
  input.dispatchEvent(event('focus', {bubbles: true}))
  input.dispatchEvent(event('keydown', {
    keyCode: BACKSPACE,
    bubbles: true
  }))

  raf(function () {
    options = document.querySelectorAll('.option')
    t.equal(options.length, 3)
    t.equal(options[0].innerHTML, 'A')
    t.equal(options[1].innerHTML, 'B')
    t.equal(options[2].innerHTML, 'C')
    t.equal(document.querySelector('.focused').innerHTML, 'A')

    input.dispatchEvent(event('keydown', {keyCode: BACKSPACE}))

    input = el.querySelector('input')
    input.dispatchEvent(event('focus', {bubbles: true}))
    input.dispatchEvent(event('keydown', {keyCode: UP}))

    raf(function () {
      t.equal(document.querySelector('.focused').innerHTML, 'A')
      input.dispatchEvent(event('keydown', {keyCode: DOWN}))
      raf(function () {
        t.equal(document.querySelector('.focused').innerHTML, 'B')
        input.dispatchEvent(event('keydown', {keyCode: DOWN}))

        raf(function () {
          t.equal(document.querySelector('.focused').innerHTML, 'C')
          input.dispatchEvent(event('keydown', {keyCode: DOWN}))

          raf(function () {
            t.equal(document.querySelector('.focused').innerHTML, 'C')
            t.end()
          })
        })
      })
    })
  })
})

test('select with enter', function (t) {
  input = el.querySelector('input')
  input.dispatchEvent(event('focus', {bubbles: true}))
  input.dispatchEvent(event('keydown', {keyCode: UP}))

  raf(function () {
    input = el.querySelector('input')
    input.dispatchEvent(event('keydown', {keyCode: ENTER}))

    raf(function () {
      selected = el.querySelectorAll('.listitem')
      t.equal(selected.length, 1)
      t.equal(selected[0].innerHTML, 'B')

      input = el.querySelector('input')
      input.dispatchEvent(event('keydown', {keyCode: ENTER}))

      raf(function () {
        selected = el.querySelectorAll('.listitem')
        t.equal(selected.length, 2)
        t.equal(selected[0].innerHTML, 'B')
        t.equal(selected[1].innerHTML, 'C')

        input = el.querySelector('input')
        input.dispatchEvent(event('keydown', {keyCode: ENTER}))

        raf(function () {
          selected = el.querySelectorAll('.listitem')
          t.equal(selected.length, 3)
          t.equal(selected[0].innerHTML, 'B')
          t.equal(selected[1].innerHTML, 'C')
          t.equal(selected[2].innerHTML, 'A')
          t.end()
        })
      })
    })
  })
})

test('clicking input background focuses input', function (t) {
  document.body.dispatchEvent(event('focus', {bubbles: true}))

  var bg = el.querySelector('.background')
  bg.dispatchEvent(event('click', {bubbles: true}))

  t.equal(document.activeElement, el.querySelector('input'))
  t.end()
})

test('dropdown hides on blur', function (t) {
  comp.state.value.set([])
  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))

  raf(function () {
    t.ok(el.querySelector('.listbox'))

    document.body.dispatchEvent(event('focus', {bubbles: true}))
    input.dispatchEvent(event('blur', {bubbles: true}))

    raf(function () {
      t.notOk(el.querySelector('.listbox'))
      t.end()
    })
  })
})

test('dropdown hides on blur', function (t) {
  comp.state.value.set([])
  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))

  raf(function () {
    t.ok(el.querySelector('.listbox'))

    document.body.dispatchEvent(event('focus', {bubbles: true}))
    input.dispatchEvent(event('blur', {bubbles: true}))

    raf(function () {
      t.notOk(el.querySelector('.listbox'))
      t.end()
    })
  })
})

test('allows groups', function (t) {
  destroy()

  comp = FancySelect({
    options: [{
      title: 'first',
      options: [
        {id: 'a', title: 'A'},
        {id: 'b', title: 'B'}
      ]
    }, {
      title: 'second',
      options: [
        {id: 'c', title: 'C'}
      ]
    }, {
      title: 'third',
      options: [
        {id: 'd', title: 'D'},
        {id: 'e', title: 'E'}
      ]
    }],
    value: [{id: 'a', title: 'A'}]
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))

  raf(function () {
    t.ok(el.querySelector('.listbox'))

    options = el.querySelectorAll('.option')
    t.equal(options.length, 4)
    t.equal(options[0].innerHTML, 'B')
    t.equal(options[1].innerHTML, 'C')
    t.equal(options[2].innerHTML, 'D')
    t.equal(options[3].innerHTML, 'E')

    input.value = 'se'
    input.dispatchEvent(event('input', {bubbles: true}))

    raf(function () {
      options = el.querySelectorAll('.option')
      t.equal(options.length, 1)
      t.equal(options[0].innerHTML, 'C')

      var groups = el.querySelectorAll('.group-label')
      t.equal(groups.length, 1)
      t.equal(groups[0].innerHTML, 'second')
      t.end()
    })
  })
})

test('creates unknown options', function (t) {
  destroy()

  var options = [{
    id: '__create__',
    title: 'create a new item',
    alwaysShow: true
  }, {
    id: 'a',
    title: 'A'
  }, {
    id: 'b',
    title: 'B'
  }, {
    id: 'c',
    title: 'C'
  }]

  comp = FancySelect({
    options: options,
    value: [{
      id: 'a',
      title: 'A'
    }],
    actions: {
      __create__: function (obj, query) {
        var opts = comp.state.options()
        opts.push({id: query, title: query.toUpperCase()})
        comp.setOptions(opts)
        comp.setQuery('')
      }
    }
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))
  raf(function () {
    t.ok(el.querySelector('.listbox'))

    document.body.dispatchEvent(event('focus', {bubbles: true}))
    input.value = 'e'
    input.dispatchEvent(event('input', {bubbles: true}))
    input.dispatchEvent(event('keydown', {keyCode: ENTER}))

    raf(function () {
      t.ok(el.querySelector('.listbox'))

      options = el.querySelectorAll('.option')
      t.equal(options.length, 4)
      t.equal(options[0].innerHTML, 'create a new item')
      t.equal(options[1].innerHTML, 'B')
      t.equal(options[2].innerHTML, 'C')
      t.equal(options[3].innerHTML, 'E')

      t.end()
    })
  })
})

test('dynamic placeholder text', function (t) {
  destroy()

  var options = [{
    id: 'a',
    title: 'A'
  }, {
    id: 'b',
    title: 'B'
  }, {
    id: 'c',
    title: 'C'
  }]

  comp = FancySelect({
    options: options,
    placeholder: 'select first',
    value: [{
      id: 'a',
      title: 'A'
    }]
  })

  mercury.watch(comp.state.value, function (val) {
    if (val.length === 0) {
      comp.state.placeholder.set('select first')
    } else if (val.length === 1) {
      comp.state.placeholder.set('select second')
    } else {
      comp.state.placeholder.set('select another')
    }
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))
  raf(function () {
    t.ok(el.querySelector('.listbox'))
    t.equal(input.placeholder, 'select second')

    document.body.dispatchEvent(event('focus', {bubbles: true}))

    input.dispatchEvent(event('keydown', {keyCode: ENTER}))

    raf(function () {
      t.equal(input.placeholder, 'select another')
      input.dispatchEvent(event('keydown', {keyCode: BACKSPACE}))
      input.dispatchEvent(event('keydown', {keyCode: BACKSPACE}))

      raf(function () {
        t.equal(input.placeholder, 'select first')
        t.end()
      })
    })
  })
})

test('treat separator key as create', function (t) {
  destroy()

  var options = [{
    id: 'a',
    title: 'A'
  }, {
    id: 'b',
    title: 'B'
  }, {
    id: 'c',
    title: 'C'
  }]

  comp = FancySelect({
    options: options,
    placeholder: 'select something',
    value: []
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')
  input.value = 'a'
  input.dispatchEvent(event('input', {bubbles: true}))
  input.dispatchEvent(event('focus', {bubbles: true}))
  input.dispatchEvent(event('keydown', {keyCode: COMMA}))

  raf(function () {
    t.notOk(input.value, 'clear value')

    selected = el.querySelectorAll('.listitem')
    t.equal(selected.length, 1)
    t.equal(selected[0].innerHTML, 'A')

    input.dispatchEvent(event('keydown', {keyCode: COMMA}))

    raf(function () {
      selected = el.querySelectorAll('.listitem')
      t.equal(selected.length, 2)
      t.equal(selected[0].innerHTML, 'A')
      t.equal(selected[1].innerHTML, 'B')

      t.end()
    })
  })
})

// test('querying text', function (t) {
//   t.end()
// })

test('custom rendering of line items', function (t) {
  destroy()

  var options = [{
    id: 'a',
    title: 'A'
  }, {
    id: 'b',
    title: 'B'
  }, {
    id: 'c',
    title: 'C'
  }]

  comp = FancySelect({
    options: options,
    placeholder: 'select something',
    value: []
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')
  input.dispatchEvent(event('focus', {bubbles: true}))
  // input.dispatchEvent(event('input', {bubbles: true}))
  // input.dispatchEvent(event('keydown', {keyCode: COMMA}))

  raf(function () {
    // t.notOk(input.value, 'clear value')

    // selected = el.querySelectorAll('.listitem')
    // t.equal(selected.length, 1)
    // t.equal(selected[0].innerHTML, 'A')

    // input.dispatchEvent(event('keydown', {keyCode: COMMA}))

    raf(function () {
      // selected = el.querySelectorAll('.listitem')
      // t.equal(selected.length, 2)
      // t.equal(selected[0].innerHTML, 'A')
      // t.equal(selected[1].innerHTML, 'B')

      t.end()
    })
  })
})

// idea: require('fancy-select/default-style')
// idea: require('fancy-select/another-style')


test('allows groups', function (t) {
  destroy()

  comp = FancySelect({
    options: [{
      title: 'first',
      options: [
        {id: 'a', title: 'A'},
        {id: 'b', title: 'B'}
      ]
    }, {
      title: 'second',
      options: [
        {id: 'c', title: 'C'}
      ]
    }, {
      title: 'third',
      options: [
        {id: 'd', title: 'D'},
        {id: 'e', title: 'E'}
      ]
    }],
    value: [{id: 'a', title: 'A'}]
  })

  embed(comp.state, FancySelect.render)

  input = el.querySelector('input')

  input.dispatchEvent(event('focus', {bubbles: true}))

  raf(function () {
    t.ok(el.querySelector('.listbox'))

    options = el.querySelectorAll('.option')
    t.equal(options.length, 4)
    t.equal(options[0].innerHTML, 'B')
    t.equal(options[1].innerHTML, 'C')
    t.equal(options[2].innerHTML, 'D')
    t.equal(options[3].innerHTML, 'E')

    input.value = 'se'
    input.dispatchEvent(event('input', {bubbles: true}))

    raf(function () {
      options = el.querySelectorAll('.option')
      t.equal(options.length, 1)
      t.equal(options[0].innerHTML, 'C')

      var groups = el.querySelectorAll('.group-label')
      t.equal(groups.length, 1)
      t.equal(groups[0].innerHTML, 'second')
      t.end()
    })
  })
})
