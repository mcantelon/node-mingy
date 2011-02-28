/*

Experimental...

*/
var mingy = require('../../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell
  , base64_decode = require('base64').decode
  , fs = require('fs')

var parser = new Parser()
parser.setEnv('dataStore', {})

parser.addCommand('put')
.set('syntax', ['put <fileData> <filename>'])
.set('logic', function(args, env) {

console.log(args.fileData.length)
  fs.writeFileSync(args.filename, base64_decode(args.fileData), 'binary')
  return "saved\n"
})

parser.addCommand('get')
.set('syntax', ['get <fileData>'])
.set('logic', function(args, env) {

  console.log(args.fileData)
  return "sent\n"
})

var welcome = "connected\n"

var shell = new Shell(parser)
.set('port', 8888)
.set('welcome', welcome)
.set('prompt', '')
.startServer()
