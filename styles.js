var RCSS = require('rcss')

module.exports = {
  background: RCSS.registerClass({
    border: '0px solid black',
    background: '#fee'
  }),
  input: RCSS.registerClass({
    borderWidth: 0,
    background: 'transparent',
    outline: 0
  }),
  selected: RCSS.registerClass({
    borderWidth: '10px',
    padding: '0.4em 0.8em',
    display: 'inline-block',
    margin: '0.2em',
    background: '#faa'
  }),
  option: RCSS.registerClass({
    borderBottom: '1px solid #eee',
    padding: '0.4em 0.8em',
    display: 'block',
    margin: 0
  })
}
