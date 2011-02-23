/*

Experimental...

*/
var net = require('net')
  , mingy = require('../../lib/mingy')
  , Client = mingy.Client
  , Shell = mingy.Shell
  , Parser = mingy.Parser
  , Command = mingy.Command
  , base64_encode = require('base64').encode
  , Buffer = require('buffer').Buffer
  , fs = require('fs')

var parser = new Parser()

parser.addCommand('connected')
.set('syntax', ['connected'])
.set('logic', function(args) {

  return "Connected to server."
})

parser.addCommand('send')
.set('syntax', ['send <file> <filename>'])
.set('logic', function(args, env, system) {

  var fileContents = fs.readFileSync(args.file)
  system.server.write('put ' + base64_encode(fileContents) + ' ' + args.filename)
  return "File sent.\n"
})

var client = new Client(parser)
client.set('port', 8888).start()

var cliParser = new Parser()

cliParser.addCommand('send')
.set('syntax', ['send <file> <filename>'])
.set('logic', function(args) {

  return client.parse('send ' + args.file + ' ' + args.filename)
})

var shell = new Shell(cliParser)
shell.start()
