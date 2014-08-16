var RCSS = require('rcss')

module.exports = {
  background: RCSS.registerClass({
    border: '0px solid black',
    background: '#fee'
  }),
  input: RCSS.registerClass({
    borderWidth: 0,
    background: 'transparent',
    outline: 0,
    minHeight: '2.8em',
    minWidth: '5em'
  }),
  selected: RCSS.registerClass({
    borderWidth: '10px',
    padding: '0.4em 0.8em',
    display: 'inline-block',
    margin: '0.2em',
    background: '#faa'
  }),
  allSelected: RCSS.registerClass({
    display: 'inline-block'
  }),
  option: RCSS.registerClass({
    borderBottom: '1px solid #eee',
    padding: '0.4em 0.8em',
    display: 'block',
    margin: 0
  }),
  focused: RCSS.registerClass({
    background: '#fffafa'
  })
}
