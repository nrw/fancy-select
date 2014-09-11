var fs = require('fs')
var insertCss = require('insert-css')

insertCss(fs.readFileSync(__dirname + '/styles/default.css', 'utf8'))
