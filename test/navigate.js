var test = require('tape')

var nav = require('../navigate')
var tree

// node order:
// - depth
// - width
// [
//   id: 0
// ,
//   id: 1
//   options: [
//     id: 2
//   ,
//     id: 3
//     options: [
//       id: 4
//       options: [
//         id: 5
//       ,
//         id: 6
//       ]
//     ,
//       id: 7
//     ,
//       id: 8
//     ]
//   ,
//     id: 9
//   ]
// ,
//   id: 10
// ]

test('read path', function (t) {
  tree = [{
    id: '1',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    id: '2',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    id: '3',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]

  t.equal(nav.readPath(tree, [0]).id, '1')
  t.equal(nav.readPath(tree, [0, 0]).id, 'a')
  t.equal(nav.readPath(tree, [0, 1]).id, 'b')
  t.equal(nav.readPath(tree, [1]).id, '2')
  t.equal(nav.readPath(tree, [1, 0]).id, 'c')
  t.equal(nav.readPath(tree, [1, 0, 0]).id, 'd')
  t.equal(nav.readPath(tree, [2]).id, '3')
  t.equal(nav.readPath(tree, [2, 0]).id, 'e')
  t.equal(nav.readPath(tree, [2, 1]).id, 'f')
  t.equal(nav.readPath(tree, [1, 0, 1]), null)
  t.equal(nav.readPath(tree, [6, 0, 1, 2]), null)
  t.equal(nav.readPath(tree, null), null)
  t.end()
})

test('traverse nodes', function (t) {
  t.same(nav.lastNode(tree, [0]), [0, 1])
  t.same(nav.lastNode(tree, [1]), [1, 0, 0])
  t.same(nav.lastNode(tree, [1, 0]), [1, 0, 0])
  t.same(nav.lastNode(tree, [2]), [2, 1])
  t.same(nav.lastNode(tree, null), null)

  // nav.nextNode(tree, path)
  t.same(nav.nextNode([]), null)
  t.same(nav.nextNode(tree), [0])
  t.same(nav.nextNode(tree, null), [0])
  t.same(nav.nextNode(tree, [0]), [0, 0])
  t.same(nav.nextNode(tree, [0, 0]), [0, 1])
  t.same(nav.nextNode(tree, [0, 1]), [1])
  t.same(nav.nextNode(tree, [1]), [1, 0])
  t.same(nav.nextNode(tree, [1, 0]), [1, 0, 0])
  t.same(nav.nextNode(tree, [1, 0, 0]), [2])
  t.same(nav.nextNode(tree, [2]), [2, 0])
  t.same(nav.nextNode(tree, [2, 0]), [2, 1])
  t.same(nav.nextNode(tree, [2, 1]), null)

  t.same(nav.nextNode(tree, [-20]), [0])

  // nav.prevNode(tree, path)
  t.same(nav.prevNode(tree), [2, 1])
  t.same(nav.prevNode(tree, [2, 1]), [2, 0])
  t.same(nav.prevNode(tree, [2, 0]), [2])
  t.same(nav.prevNode(tree, [2]), [1, 0, 0])
  t.same(nav.prevNode(tree, [1, 0, 0]), [1, 0])
  t.same(nav.prevNode(tree, [1, 0]), [1])
  t.same(nav.prevNode(tree, [1]), [0, 1])
  t.same(nav.prevNode(tree, [0, 1]), [0, 0])
  t.same(nav.prevNode(tree, [0, 0]), [0])
  t.same(nav.prevNode(tree, [0]), null)

  t.same(nav.prevNode(tree, [3, 2, 3]), [2, 1])

  t.end()
})

test('query nodes', function (t) {
  tree = [{
    title: '1',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    title: '2',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    title: '3',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]

  t.notOk(nav.hasId(tree))
  t.notOk(nav.hasId(tree, [0]))
  t.ok(nav.hasId(tree, [0, 0]))
  t.ok(nav.hasId(tree, [0, 1]))
  t.notOk(nav.hasId(tree, [0, 2]))
  t.notOk(nav.hasId(tree, [1]))
  t.ok(nav.hasId(tree, [1, 0]))
  t.ok(nav.hasId(tree, [1, 0, 0]))
  t.notOk(nav.hasId(tree, [1, 0, 1]))
  t.notOk(nav.hasId(tree, [1, 1, 0]))
  t.notOk(nav.hasId(tree, [2]))
  t.ok(nav.hasId(tree, [2, 0]))
  t.ok(nav.hasId(tree, [2, 1]))
  t.end()
})

test('traverse options', function (t) {
  // nav.nextOption(tree, path)
  t.same(nav.nextOption(tree, null), [0, 0])
  t.same(nav.nextOption(tree), [0, 0])
  t.same(nav.nextOption(tree, [0]), [0, 0])
  t.same(nav.nextOption(tree, [0, 0]), [0, 1])
  t.same(nav.nextOption(tree, [0, 1]), [1, 0])
  t.same(nav.nextOption(tree, [1, 0]), [1, 0, 0])
  t.same(nav.nextOption(tree, [1, 0, 0]), [2, 0])
  t.same(nav.nextOption(tree, [2, 0]), [2, 1])
  t.same(nav.nextOption(tree, [2, 1]), null)

  // nav.prevOption(tree, path)
  t.same(nav.prevOption(tree), [2, 1])
  t.same(nav.prevOption(tree, null), [2, 1])
  t.same(nav.prevOption(tree, [2, 1]), [2, 0])
  t.same(nav.prevOption(tree, [2, 0]), [1, 0, 0])
  t.same(nav.prevOption(tree, [1, 0, 0]), [1, 0])
  t.same(nav.prevOption(tree, [1, 0]), [0, 1])
  t.same(nav.prevOption(tree, [0, 1]), [0, 0])
  t.same(nav.prevOption(tree, [0, 0]), null)

  // nav.nearestOption(tree, path) // current, if selectable,
  //   else next if selectable else prev selectable
  t.same(nav.nearestOption(tree, null), [0, 0])
  t.same(nav.nearestOption(tree, [0]), [0, 0])
  t.same(nav.nearestOption(tree, [1, 0, 1]), [2, 0])
  t.same(nav.nearestOption(tree, [1, 1, 1]), [2, 0])
  t.same(nav.nearestOption(tree, [3, 1, 1]), [2, 1])
  t.same(nav.nearestOption(tree, [-10, 1, 1]), [0, 0])
  t.same(nav.nearestOption(tree, [10, -20, 1]), [0, 0])

  t.end()
})

test('gets children', function (t) {
  // nav.childNodes(tree, path)
  t.same(nav.childNodes(tree), [
    {id: 'a'},
    {id: 'b'},
    {id: 'c', options: [{id: 'd'}]},
    {id: 'd'},
    {id: 'e'},
    {id: 'f'}
  ])
  t.same(nav.childNodes(tree, [0]), [
    {id: 'a'},
    {id: 'b'}
  ])
  t.same(nav.childNodes(tree, [1]), [
    {id: 'c', options: [{id: 'd'}]},
    {id: 'd'}
  ])
  t.same(nav.childNodes(tree, [1, 0]), [
    {id: 'd'}
  ])
  t.same(nav.childNodes(tree, [2]), [
    {id: 'e'},
    {id: 'f'}
  ])
  t.end()
})
