
module.exports = {
  // travsere options
  nearestOption: nearestOption,
  prevOption: prevOption,
  nextOption: nextOption,

  // travsere nodes
  nextNode: nextNode,
  prevNode: prevNode,
  lastNode: lastNode,

  // return nodes
  readPath: readPath,
  childNodes: childNodes,

  hasId: hasId
}

// travsere nodes
function nextNode (obj, path) {
  if (!obj || !obj.length) {
    return null
  }

  if (!path || !path.length || !isValidPath(path)) {
    return [0]
  }

  if (hasOptions(obj, path)) {
    return path.concat([0])
  }

  var sibling = nextSiblingPath(path)
  if (readPath(obj, sibling)) {
    return sibling
  }

  var parent = path
  while ((parent = nextParentPath(parent))) {
    if (readPath(obj, parent)) {
      return parent
    }
  }

  if (readPath(obj, parent)) {
    return parent
  }

  return null
}

function prevNode (obj, path) {
  if (!obj || !obj.length) {
    return null
  }

  if (!path || !path.length) {
    return lastNode(obj, [obj.length - 1])
  }

  var sibling = lastNode(obj, prevSiblingPath(path))
  if (readPath(obj, sibling)) {
    return sibling
  }

  var parent = parentPath(path)

  while (parent && !readPath(obj, parent)) {
    parent = parentPath(parent)
  }

  if (parent) {
    return parent
  }

  if (!isValid(path[0])) {
    return nextNode(obj)
  }

  if (path[0] > obj.length - 1) {
    return lastNode(obj, [obj.length - 1])
  }

  return null
}

function lastNode (obj, path) {
  if (!path || !readPath(obj, path)) {
    return null
  }

  var base = path.slice(0), current = base

  while (
    (path = nextNode(obj, path)) &&
    (isEqual(base, path.slice(0, base.length)))
  ) {
    current = path
  }
  return validPath(current)
}

// traverse options
function prevOption (obj, path) {
  if (!path || hasId(obj, path)) {
    path = prevNode(obj, path)
  }

  while (path && !hasId(obj, path)) {
    path = prevNode(obj, path)
  }
  return path
}

function nextOption (obj, path) {
  if (!path || hasId(obj, path)) {
    path = nextNode(obj, path)
  }

  while (path && !hasId(obj, path)) {
    path = nextNode(obj, path)
  }
  return path
}

function nearestOption (obj, orig) {
  var path

  if (!obj || !obj.length) {
    return null
  }

  if (!orig) {
    orig = nextNode(obj, orig)
  }

  path = orig.slice(0)

  while (path && !hasId(obj, path)) {
    path = nextNode(obj, path)
  }

  if (!path) {
    path = orig
    while (path && !hasId(obj, path)) {
      path = prevNode(obj, path)
    }
  }

  return path
}

// get paths - siblings
function prevSiblingPath (path) {
  if (!path) {
    return null
  }

  path = path.slice(0)
  path[path.length - 1]--
  return validPath(path)
}

function nextSiblingPath (path) {
  if (!path) {
    return null
  }

  path = path.slice(0)
  path[path.length - 1]++
  return path
}

// get paths - parents
function parentPath (path) {
  if (path.length === 1) {
    return null
  }

  return validPath(path.slice(0, path.length - 1))
}

function prevParentPath (path) {
  if (path.length === 1) {
    return validPath([path[0] - 1])
  }

  path = path.slice(0, path.length - 1)
  path[path.length - 1]--
  return validPath(path)
}

function nextParentPath (path) {
  if (path.length === 1) {
    return null
  }

  path = path.slice(0, path.length - 1)
  path[path.length - 1]++
  return path
}

// returning nodes
function readPath (obj, path) {
  if (!path || !obj) {
    return null
  }

  if (!isValid(path[0])) {
    return null
  }

  var node = obj[path[0]]
  for (var i = 1; i < path.length; i++) {
    if (!isValid(path[i])) {
      return null
    }

    if (node) {
      node = node.options[path[i]]
    }
  }
  return node || null
}

function childNodes (obj, path, nodes) {
  // return all children
  if (!path) {
    nodes = []
    for (var i = 0; i < obj.length; i++) {
      childNodes(obj, [i], nodes)
    }
    return nodes
  }

  // passed a path that pointed nowhere
  if (!readPath(obj, path)) {
    return null
  }

  var node, base = path.slice(0), current = base
  nodes = nodes || []

  while (
    (path = nextNode(obj, path)) &&
    (isEqual(base, path.slice(0, base.length)))
  ) {
    node = readPath(obj, path)
    nodes.push(node)
  }
  return nodes
}

// node queries
function hasOptions (obj, path) {
  var node = readPath(obj, path)
  return node && node.options && node.options.length
}

function hasId (obj, path) {
  var node = readPath(obj, path)
  return node && node.id
}

// validation
function validPath (path) {
  if (isValidPath(path)) {
    return path
  }

  return null
}

function isValidPath (path) {
  for (var i = path.length - 1; i >= 0; i--) {
    if (!isValid(path[i])) {
      return false
    }
  }
  return true
}

function isValid (point) {
  return point >= 0
}

// comparison
function isEqual (a, b) {
  if (!a || !b) {
    return false
  }

  for (var i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
