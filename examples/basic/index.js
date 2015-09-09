// compile this with:
// $ browserify index.js -o bundle.js
//
// then open index.html in a browser

var hg = require('mercury')
var FancySelect = require('../../')
require('../../style') // include styles

window.onload = run

function run () {
  var comp = FancySelect({
    placeholder: 'Select Pilots...',
    options: [{
      label: 'Raptor Pilots',
      options: [
        {value: 'karl-agathon', label: 'Karl "Helo" Agathon', certs: 'RE'},
        {value: 'sharon-agathon', label: 'Sharon "Athena" Agathon', certs: 'RO'},
        {value: 'brendandog"-costanza', label: 'Brendan "Hot Dog" Costanza', certs: 'VR'},
        {value: 'steve-fleer', label: 'Steve "Red Devil" Fleer', certs: 'R'}
      ].sort(sort)
    }, {
      label: 'Viper Pilots',
      options: [
        {value: 'marcia-case', label: 'Marcia "Showboat" Case', certs: 'V'},
        {value: 'brendandog"-costanza', label: 'Brendan "Hot Dog" Costanza', certs: 'VR'},
        {value: 'paolo-mckay', label: 'Paolo "Redwing" McKay', certs: 'V'},
        {value: 'noel-allison', label: 'Noel "Narcho" Allison', certs: 'V'},
        {value: 'diana-seelix', label: 'Diana "Hardball" Seelix', certs: 'V'},
        {value: 'delphi-birch', label: 'Delphi "Falcon" Birch', certs: 'V'},
        {value: 'mei-firelli', label: 'Mei "Freaker" Firelli', certs: 'V'},
        {value: 'analy-amante', label: 'Analy "Feline" Amante', certs: 'V'},
        {value: 'river-brigden', label: 'River "Hiccup" Brigden', certs: 'V'}
      ].sort(sort)
    }, {
      label: 'Raptor ECOs',
      options: [
        {value: 'karl-agathon', label: 'Karl "Helo" Agathon', certs: 'RE'}
      ]
    }, {
      label: 'Other Craft',
      options: [
        {value: 'sharon-agathon', label: 'Sharon "Athena" Agathon', certs: 'RO'}
      ]
    }]
  })

  hg.app(document.body, comp.state, render)
}

function render (state) {
  return hg.h('div', [
    hg.h('div.block', FancySelect.render(state)),
    hg.h('div.block', [
      hg.h('p', 'Current Value'),
      hg.h('pre', JSON.stringify(state.value, null, 2))
    ])
  ])
}

function sort (a, b) {
  return a.label.localeCompare(b.label)
}
