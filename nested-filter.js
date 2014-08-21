var nav = require('./navigate')
var cloneDeep = require('lodash.clonedeep')

// omit if
// - any filter function returns false AND
// - no child node got all trues from the filter functions

// keep if
// - all filter functions returned true OR
// - any child node received true for all filter functions

module.exports = Filter

function Filter () {
  var fns = [].slice.call(arguments)

  return function (obj, query) {
    obj = cloneDeep(obj)
    return runFilter(fns, obj, query)
  }
}

Filter.testNodes = testNodes
Filter.markKeepers = markKeepers
Filter.filterTree = filterTree
Filter.runFilter = runFilter

function runFilter (fns, obj, query, opts) {
  if (!Array.isArray(fns)) {
    fns = [fns]
  }

  testNodes(fns, obj, query)
  markKeepers(obj)
  filterTree(obj, opts)
  return obj
}

function testNodes (fns, obj, query) {
  var node, path, passes
  while ((path = nav.nextNode(obj, path))) {
    node = nav.readPath(obj, path)
    node.passes = passesAll(fns, node, query)
  }
  return obj
}

function markKeepers (obj) {
  var node, path, children
  while ((path = nav.nextNode(obj, path))) {
    node = nav.readPath(obj, path)
    children = nav.childNodes(obj, path)
    node.keep = passes(node) || children.some(passes)
  }
  return obj
}

function filterTree (obj, opts) {
  obj = obj || []
  opts = opts || {}

  var node

  for (var i = 0; i < obj.length; i++) {
    node = obj[i]

    if (node.keep) {
      if (!(opts.keepMatchChildren && node.passes) && node.options) {
        filterTree(node.options)
      }
    } else {
      obj.splice(i, 1)
      i--
    }
  }
  return obj
}

function passes (obj) {
  return obj.passes
}

function passesAll (fns, node, query) {
  for (var i = 0; i < fns.length; i++) {
    if (!fns[i](node, query)) return false
  }
  return true
}
