var test = require('tape')
var cloneDeep = require('lodash.clonedeep')

var Filter = require('../nested-filter')
var nav = require('../navigate')
var tree, filter, fns, node, path

test('test tree', function (t) {
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
  var treeCopy = cloneDeep(tree)

  function idExact (opt, query) {
    return opt.id && opt.id === query
  }

  fns = [idExact]

  t.same(Filter.testNodes(fns, tree, 'c'), [{
    id: '1',
    passes: false,
    options: [
      {id: 'a', passes: false},
      {id: 'b', passes: false}
    ]
  }, {
    id: '2',
    passes: false,
    options: [{
      id: 'c',
      passes: true,
      options: [
        {id: 'd', passes: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    options: [
      {id: 'e', passes: false},
      {id: 'f', passes: false}
    ]
  }])

  t.same(Filter.markKeepers(tree), [{
    id: '1',
    passes: false,
    keep: false,
    options: [
      {id: 'a', passes: false, keep: false},
      {id: 'b', passes: false, keep: false}
    ]
  }, {
    id: '2',
    passes: false, keep: true,
    options: [{
      id: 'c',
      passes: true,
      keep: true,
      options: [
        {id: 'd', passes: false, keep: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    keep: false,
    options: [
      {id: 'e', passes: false, keep: false},
      {id: 'f', passes: false, keep: false}
    ]
  }])

  t.same(Filter.filterTree(tree), [{
    id: '2',
    passes: false,
    keep: true,
    options: [{
      id: 'c',
      options: [],
      keep: true,
      passes: true
    }]
  }])
  t.end()
})

test('more filters', function (t) {
  tree = [{
    title: 'first',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    title: 'second',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    title: 'third',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]
  var copy = cloneDeep(tree)

  filter = Filter(function (opt, query) {
    try {
      var regex = new RegExp(query, 'i')
      return (
        (opt.id && regex.test(opt.id)) ||
        (opt.title && regex.test(opt.title))
      )
    } catch (e) {
      return false
    }
  })

  t.same(filter(tree, 'a'), [{
    title: 'first',
    passes: false,
    keep: true,
    options: [
      {id: 'a', keep: true, passes: true}
    ]
  }])
  t.same(copy, tree)

  t.same(filter(tree, 'e'), [{
    title: 'second',
    passes: true,
    keep: true,
    options: []
  }, {
    title: 'third',
    passes: false,
    keep: true,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  t.end()
})

test('alternate api', function (t) {
  tree = [{
    title: 'first',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    title: 'second',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    title: 'third',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]
  function searchFilter (opt, query) {
    try {
      var regex = new RegExp(query, 'i')
      return (
        (opt.id && regex.test(opt.id)) ||
        (opt.title && regex.test(opt.title))
      )
    } catch (e) {
      return false
    }
  }

  var ids = ['a']

  function unselectedFilter (opt) {
    return !opt.id || !~ids.indexOf(opt.id)
  }

  Filter.runFilter(unselectedFilter, tree, '', {})

  t.same(tree, [{
    title: 'first',
    keep: true,
    passes: true,
    options: [
      {id: 'b', keep: true, passes: true}
    ]
  }, {
    title: 'second',
    keep: true,
    passes: true,
    options: [{
      id: 'c',
      keep: true,
      passes: true,
      options: [
        {id: 'd', keep: true, passes: true}
      ]
    }]
  }, {
    title: 'third',
    keep: true,
    passes: true,
    options: [
      {id: 'e', keep: true, passes: true},
      {id: 'f', keep: true, passes: true}
    ]
  }])

  var copy = cloneDeep(tree)

  Filter.runFilter(searchFilter, tree, 'e', {keepMatchChildren: true})

  t.same(tree, [{
    title: 'second',
    keep: true,
    passes: true,
    options: [{
      id: 'c',
      keep: false,
      passes: false,
      options: [
        {id: 'd', keep: false, passes: false}
      ]
    }]
  }, {
    title: 'third',
    keep: true,
    passes: false,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  Filter.runFilter(searchFilter, copy, 'e', {keepMatchChildren: false})

  t.same(copy, [{
    title: 'second',
    keep: true,
    passes: true,
    options: []
  }, {
    title: 'third',
    keep: true,
    passes: false,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  t.end()
})
