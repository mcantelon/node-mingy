var net = require('net')
  , mingy = require('../../lib/mingy')
  , Client = mingy.Client
  , Parser = mingy.Parser
  , Command = mingy.Command
  , argv = require('optimist').argv
  , parser = new Parser()
  , client;

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

  client.close();
  return 'Set succeeded.'
})

// send command to set key to value
parser.addCommand('get')
.set('syntax', ['get <key>'])
.set('logic', function(args, env, system) {
  system.server.write('get ' + args.key)

  return "Attempting get..."
})

// receive value and output to console
parser.addCommand('value')
.set('syntax', ['value <key> <value>'])
.set('logic', function(args) {

  console.log('Retrieved value of ' + args.key + ': ' + args.value)
  client.close();
  return 'Value retrieved.'
})

// parse if valid, otherwise display usage
if (parser.validCommands(argv._).length > 0) {
  client = new Client(parser)
  client.set('port', 8888).start(argv)
} else {
  console.log('Usage: set <key> <value> | get <key>');
}
