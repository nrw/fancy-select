var RCSS = require('rcss')
var mercury = require('mercury')
var raf = require('raf')
var test = require('tape')
var document = require('global/document')
var event = require('synthetic-dom-events')
window.e = event

var ENTER = 13
var BACKSPACE = 8
var UP = 38
var DOWN = 40

var FancySelect = require('../')

var comp, el, selected, input, options

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

  RCSS.injectAll()

  var div = document.createElement('div')
  document.body.insertBefore(div, document.body.childNodes[0])
  mercury.app(div, comp.state, FancySelect.render)

  el = document.querySelector('.fancy-select')

  selected = el.querySelectorAll('.selected')
  t.equal(selected.length, 1)
  t.equal(selected[0].innerText, 'A')

  input = el.querySelector('input')
  input.dispatchEvent(event('focus', {bubbles: true}))

  t.ok(comp.state().isOpen)

  raf(function () {
    options = document.querySelectorAll('.option')

    t.equal(options.length, 2)
    t.equal(options[0].innerText, 'B')
    t.equal(options[1].innerText, 'C')

    options[1].dispatchEvent(event('click', {bubbles: true}))

    raf(function () {
      options = document.querySelectorAll('.option')
      t.equal(options.length, 1)
      t.equal(options[0].innerText, 'B')

      selected = el.querySelectorAll('.selected')
      t.equal(selected.length, 2)
      t.equal(selected[0].innerText, 'A')
      t.equal(selected[1].innerText, 'C')
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
      t.equal(options[0].innerText, 'B')
      t.equal(options[1].innerText, 'C')
      selected = el.querySelectorAll('.selected')
      t.equal(selected.length, 1)
      t.equal(selected[0].innerText, 'A')
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
    t.equal(options[0].innerText, 'C')
    selected = el.querySelectorAll('.selected')
    t.equal(selected.length, 1)
    t.equal(selected[0].innerText, 'A')

    input.dispatchEvent(event('focus', {bubbles: true}))

    raf(function () {
      input.dispatchEvent(event('keydown', {
        keyCode: BACKSPACE,
        bubbles: true
      }))

      selected = el.querySelectorAll('.selected')
      t.equal(selected.length, 1, 'backspace does not delete when query is set')
      t.equal(selected[0].innerText, 'A')
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
    t.equal(options[0].innerText, 'A')
    t.equal(options[1].innerText, 'B')
    t.equal(options[2].innerText, 'C')
    t.equal(document.querySelector('.focused').innerText, 'A')

    input.dispatchEvent(event('keydown', {keyCode: BACKSPACE}))

    input = el.querySelector('input')
    input.dispatchEvent(event('focus', {bubbles: true}))
    input.dispatchEvent(event('keydown', {keyCode: UP}))

    raf(function () {
      t.equal(document.querySelector('.focused').innerText, 'A')
      input.dispatchEvent(event('keydown', {keyCode: DOWN}))
      raf(function () {
        t.equal(document.querySelector('.focused').innerText, 'B')
        input.dispatchEvent(event('keydown', {keyCode: DOWN}))

        raf(function () {
          t.equal(document.querySelector('.focused').innerText, 'C')
          input.dispatchEvent(event('keydown', {keyCode: DOWN}))

          raf(function () {
            t.equal(document.querySelector('.focused').innerText, 'C')
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
      selected = el.querySelectorAll('.selected')
      t.equal(selected.length, 1)
      t.equal(selected[0].innerText, 'B')

      input = el.querySelector('input')
      input.dispatchEvent(event('keydown', {keyCode: ENTER}))

      raf(function () {
        selected = el.querySelectorAll('.selected')
        t.equal(selected.length, 2)
        t.equal(selected[0].innerText, 'B')
        t.equal(selected[1].innerText, 'C')

        input = el.querySelector('input')
        input.dispatchEvent(event('keydown', {keyCode: ENTER}))

        raf(function () {
          selected = el.querySelectorAll('.selected')
          t.equal(selected.length, 3)
          t.equal(selected[0].innerText, 'B')
          t.equal(selected[1].innerText, 'C')
          t.equal(selected[2].innerText, 'A')
          t.end()
        })
      })
    })
  })
})
