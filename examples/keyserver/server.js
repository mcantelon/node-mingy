/*

Experimental...

*/
var mingy = require('../../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell

var parser = new Parser()
parser.setEnv('dataStore', {})

parser.addCommand('set')
.set('syntax', ['set <key> <value>'])
.set('logic', function(args, env) {

  env.dataStore[args.key] = args.value
  console.log('Set ' + args.key + ' to ' + args.value + '.')
  return "stored\n"
})

parser.addCommand('get')
.set('syntax', ['get <key>'])
.set('logic', function(args, env) {

  var value = env.dataStore[args.key]
  console.log('Retrieving value of ' + args.key + '.')
  return 'value ' + args.key + ' ' + value + "\n"
})

var welcome = "connected\n"

var shell = new Shell(parser)
.set('port', 8888)
.set('welcome', welcome)
.set('prompt', '')
.set('logic', function(shell, system) {

  var keysStored = Object.keys(shell.parser.env.dataStore).length
  console.log('Now storing ' + keysStored + ' keys.')
})
.startServer()
