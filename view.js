var mercury = require('mercury')
var h = mercury.h
var styles = require('./styles')

var ENTER = 13

module.exports = render

function render (state) {
  return h('div.fancy-select', [
    h('div.input-area', {
      className: styles.background.className
    }, [
      state.value.map(function (v) {
        return h('span.selected', {
          className: styles.selected.className
        }, v.title)
      }),
      h('input', {
        className: styles.input.className,
        'ev-focus': mercury.event(state.events.dropdown, true)
      })
    ]),
    state.isOpen ? h('div.dropdown', {
    }, [
      state.available.map(function (opt) {
        return h('div.option', {
          className: styles.option.className,
          'ev-click': mercury.event(state.events.select, opt)
        }, opt.title)
      })
    ]) : null
  ])
}
