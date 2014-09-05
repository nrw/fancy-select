// option-tree

// option-tree-navigate
// option-tree-filter
// option-tree-action-value

//     tree.setOptions([])
//     tree.setFilters([])
//     tree.setValue([])

//     tree.setActions({})
//     tree.setQuery('str')
//     tree.readPath(path)

//     tree.select('id')

//     tree.value()
//     tree.options()
//     tree.next()
//     tree.prev()
//     tree.active() # path

// - data-source - must implement
//   - setQuery
//   - options
//   - next
//   - prev
//   - select(option)
//   - active() -> option
//   - isActive(option) -> bool

var navigate = require('./option-tree-navigate')
var filter = require('./option-tree-filter')
var Value = require('./option-tree-action-value')

module.exports = OptionTree

function OptionTree (opts) {
  var options = opts.options

  var value = Value({
    __create__: function (str) {
      return options
    }
  })

  return {
    options: function () {
      return
    },
    value: function () {
      return
    },
    next: function () {
    },
    prev: function () {
    },
    select: function () {
    },
    active: function () {
    },

    setQuery: function () {
    },
    setOptions: function () {
    },
    setValue: function () {
    },
    setFilters: function () {
    }
  }
}
