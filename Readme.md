# Fancy Select [![build status](https://secure.travis-ci.org/nrw/fancy-select.png)](http://travis-ci.org/nrw/fancy-select)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/fancy-select.svg)](https://saucelabs.com/u/fancy-select)

Structure notes

- container
  - visible box with outline
    - selected values
    - text input
  - dropdown
    - groups
      - options

## fancy-select

## unidirectional-combobox

- data-source - must implement
  - setQuery
  - options
  - next
  - prev
  - select(option)
  - active() -> option
  - isActive(option) -> bool

  # - setOptions()
  # - setValue()
  # options()
  # value()

## option-tree-action-value

    setActions({})
    setValue()

    push(node) # checks if id is action, if not adds to value
    push(node)
    pop()
    value()

## option-tree-navigate

- nextNode
- prevNode
- nextWith('id', obj, path)
- prevWith
- nearestWith
- firstNode
- lastNode

- readPath
- childNodes

- has('id', obj, path)

## option-tree-filter

filter([fns...], tree, query, opts) -> tree

## option-tree

option-tree-navigate
option-tree-filter
option-tree-action-value

    tree.setOptions([])
    tree.setFilters([])
    tree.setValue([])

    tree.setActions({})
    tree.setQuery('str')
    tree.readPath(path)

    tree.select('id')

    tree.value()
    tree.options()
    tree.next()
    tree.prev()
    tree.active() # path


- data {options, value, actions}
- navigate
  fn(options, )
- filter
- select
- draw


What are all the things user input gets mapped to?

- next opt
- prev opt
- select opt
- filter opts


# select-action

    setActions({})
    setValue()

    push(node) # checks if id is action, if not adds to value
    push(node)
    pop()
    value()
