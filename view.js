var mercury = require('mercury')
var window = require('global/window')
var h = mercury.h
var styles = require('./styles')
var mutableFocus = require('./mutable-focus')

var ENTER = 13
var BACKSPACE = 8
var UP = 38
var DOWN = 40

module.exports = render

function render (state) {
  return h('div.fancy-select', {
  }, [
    h('div.input-area', {
      className: styles.background.className,
      'ev-click': function (e) {
        e.currentTarget.children[1].focus()
      }
    }, [
      h('div.all-selected', {
        className: styles.allSelected.className
      }, [
        state.value.map(function (v) {
          return h('span.selected', {
            className: styles.selected.className
          }, v.title)
        })
      ]),
      h('input', {
        type: 'text',
        name: 'query',
        value: state.query,
        autocomplete: 'off',
        style: {
          width: measureString(state.query) + 'px'
        },
        className: styles.input.className,

        'ev-input': mercury.valueEvent(state.events.input, {
          preventDefault: false
        }),

        'ev-event': function (e) {
          mutableFocus()

          switch (e.type) {
            case 'blur':
              var relatedTarget = e.relatedTarget

              // TODO: this will likely stop working until
              // https://github.com/Raynos/dom-delegator/pull/4 is fixed
              if (
                !relatedTarget ||
                !e.currentTarget.parentNode.parentNode.contains(relatedTarget)
              ) {
                state.events.dropdown(false)
              }
              break
            case 'focus':
              state.events.dropdown(true)
              break

            case 'keydown':
              switch (e.keyCode) {
                case BACKSPACE:
                  state.events.backspace()
                  break
                case ENTER:
                  // console.log('REASDFJASDF', state.events.readIndex(state.available, state.focused))
                  state.events.select(
                    state.events.readPath(state.available, state.focused))
                  e.preventDefault()
                  break
                case DOWN:
                  // console.log('DOWN', state)
                  state.events.focusNext({
                    available: state.available,
                    focused: state.focused
                  })
                  e.preventDefault()
                  break
                case UP:
                  state.events.focusPrev({
                    available: state.available,
                    focused: state.focused
                  })
                  e.preventDefault()
                  break
              }
              break
          }
        }
      })
    ]),
    state.isOpen ? h('div.dropdown', {
    }, [
      renderGroup(state, state.available)
    ]) : null
  ])
}

function renderGroup (state, data) {
  return data.map(function (opt, index) {
    if (opt.options) {
      return h('div.group', [
        h('div.groupname', opt.title),
        h('div.groupoptions', renderGroup(state, opt.options))
      ])
    } else {
      // console.log('obj', state.focusedId)
      var focusClass = opt.id && opt.id === state.focusedId ?
        styles.focused.className + ' focused' : ''

      return h('div.option', {
        className: [styles.option.className, focusClass].join(' '),
        tabIndex: 1000,
        'ev-click': function (e) {
          state.events.select(opt)
          e.currentTarget.parentNode.parentNode
            .children[0].children[1].focus()
        }
      }, opt.title)
    }
  })
}

function measureString (str, current) {
  if (!str) return 0

  var span = document.createElement('span')
  span.style = 'position: absolute; top: -99999; left: -99999; width: auto;' +
    'padding: 0; white-space: pre;'
  span.innerText = str
  document.body.appendChild(span)

  // TODO: copy styles from input computed style to tolerate font changes
  // document.querySelector('.fancy-select input')
  // var currentStyle = window.getComputedStyle(current, null)
  // var toCopy = ['letterSpacing', 'fontSize', 'fontFamily', 'fontWeight',
  //   'textTransform']
  // toCopy.forEach(function (one) {
  //   test.style[one] = currentStyle.style[one]
  // })

  var width = span.offsetWidth
  span.remove()
  return width
}
