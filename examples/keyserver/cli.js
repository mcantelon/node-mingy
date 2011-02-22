/*

Experimental...

*/
var net = require('net')
  , mingy = require('../../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , argv = require('optimist').argv

var conn = net.createConnection(8888, '127.0.0.1')
var parser = new Parser()

parser.addCommand('set')
.set('syntax', ['set <key> <value>'])
.set('logic', function(args) {

  conn.write('set ' + args.key + ' ' + args.value)
  return "Attempting set..."
})

// when server has stored value, send command to get value
parser.addCommand('stored')
.set('syntax', ['stored'])
.set('logic', function(args, env) {
  return 'Set succeeded.'
})

conn.on('data', function(data) {

  data = data.toString()

  var output = parser.parse(data)

  if (output) {
    console.log(output)
  }
})

console.log(parser.parseLexemes(argv['_']))
