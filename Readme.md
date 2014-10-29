# fancy-select [![build status](https://secure.travis-ci.org/nrw/fancy-select.png)](http://travis-ci.org/nrw/fancy-select)

A unidirectional combobox component based on the aria spec.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/fancy-select.svg)](https://saucelabs.com/u/fancy-select)

# Simple Example

```js
var mercury = require('mercury')
var FancySelect = require('fancy-select')
require('fancy-select/style') // include default stylesheet

var component = FancySelect({
  options: [{
    id: 'c',
    title: 'Consistency'
  }, {
    id: 'a',
    title: 'Availability'
  }, {
    id: 'p',
    title: 'Partition Tolerance'
  }],
  placeholder: 'Choose Two'
})

mercury.app(document.body, component.state, FancySelect.render)
```

# Usage

## var component = FancySelect(config = {})

### component.state

An instance of `observ-struct`. Holds the state for this component. All parts of the state are subclasses of `observ`.

- `state.options` the full option tree
- `state.value` the current value of this combobox
- `state.filtered` the option tree after it has been passed through the current filter function.
- `state.query` the current query string
- `state.active` the path of the active option in the listbox
- `state.isOpen` whether the dropdown is currently open
- `state.placeholder` the current placeholder text
- `state.separator` the key code for the current separator

### FancySelect.render

The render function to be passed to a `main-loop` or placed into another template.

## config

All the config options can be changed on the fly with the `set` function with a matching name:

- `component.setOptions(options)`
- `component.setValue(value)`
- `component.setFilter(filter)`
- `component.setActions(actions)`
- `component.setQuery(query)`

To create a custom render function, call FancySelect.customRender(templates)

- `var render = FancySelect.customRender(templates)`

### config.options = []

An array of `option` objects to use as the data source for this combobox. Will be passed to [`option-tree-navigate`](https://github.com/nrw/option-tree-navigate).

The properties in an `option` object used by `fancy-select` are:

- `option.id` Any option with an id will be selectable. Options without an `id` will be rendered as option groups.
- `option.title` By default, will be used as the label for an option
- `option.options` An array of `option` objects. The children of this option.

### config.value = []

An array of `option` objects to use as the initial value. Will be passed to [`option-tree-navigate`](https://github.com/nrw/option-tree-navigate). Child options will not be shown when an option with children is selected.

### config.filter = function (option, query, value) { ... }

The function to use when filtering which options are available to select. Gets passed to [`option-tree-filter`](https://github.com/nrw/option-tree-filter). The default filter function includes these rules:

- always show any option whose `id` starts with `__`
- omit any option whose `id` is identical to an option already in the `value`
- omit any option whose `id` and `title` do not match the `query` string (case insensiteve).

### config.actions = {}

A hash of option ids to the functions that should be called when that `id` is selected. Will be passed to [`option-select-action`](https://github.com/nrw/option-select-action).

### templates = {}

A hash of template names to render functions. The tree of default templates is nested in this order with these names:

```
combobox
  textbox
    input
  listbox
    group
      option
        optionlabel
```

A render function is passed the `state`, a `template` function, for inserting other templates, and then any other arguments it was called with.

```js
var h = require('virtual-hyperscript')

var templates = {
  option: function (state, template, option, path) {
    return h('div.option', [
      // insert another named template like this.
      // any arguments after the template name are
      // passed to its render function
      template('optionlabel', option, path)
    ])
  }
}

var render = FancySelect.customRender(templates)
```

### config.placeholder = ''

The string to use as the placeholder text in the textbox.

### config.separator = 188 (comma)

The key code of a key to consider a separator. Pressing the separator key will trigger the same action as pressing enter.

## styles

Include the default stylesheet with `require('fancy-select/style')`
