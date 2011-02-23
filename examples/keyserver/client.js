/*

Experimental...

*/
var net = require('net')
  , mingy = require('../../lib/mingy')
  , Client = mingy.Client
  , Parser = mingy.Parser
  , Command = mingy.Command

var parser = new Parser()

// generate random key name
parser.setEnv('keyName', Math.floor(Math.random() * 1000000000).toString(24))
console.log('Generated key name ' + parser.env.keyName + '.')

// when connected with server, send command to store value
parser.addCommand('connected')
.set('syntax', ['connected'])
.set('logic', function(args, env, system) {

  var randomNumber = Math.floor(Math.random() * 10)
  system.server.write('set ' + env.keyName + ' ' + randomNumber)
  return 'Setting data to ' + randomNumber + '...'
})

// when server has stored value, send command to get value
parser.addCommand('stored')
.set('syntax', ['stored'])
.set('logic', function(args, env, system) {

  system.server.write('get ' + env.keyName)
  return 'Set succeeded.'
})

// receive value and output to console
parser.addCommand('value')
.set('syntax', ['value <key> <value>'])
.set('logic', function(args) {

  console.log('Retrieved value of ' + args.key + ': ' + args.value)
  return 'Value retrieved.'
})

var client = new Client(parser)
client.set('port', 8888).start()
