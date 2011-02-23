/*

Experimental...

*/
var net = require('net')
  , mingy = require('../../lib/mingy')
  , Client = mingy.Client
  , Parser = mingy.Parser
  , Command = mingy.Command
  , argv = require('optimist').argv

var parser = new Parser()

// send command to server to set key to value
parser.addCommand('set')
.set('syntax', ['set <key> <value>'])
.set('logic', function(args, env, system) {

  system.server.write('set ' + args.key + ' ' + args.value)

  return "Attempting set..."
})

// when server has stored value, report success
parser.addCommand('stored')
.set('syntax', ['stored'])
.set('logic', function(args, env) {

  return 'Set succeeded.'
})

var client = new Client(parser)

client.set('port', 8888).start(argv)
