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

console.log('000')
  var fileBuffer = new Buffer(fs.readFileSync(args.file, 'binary'))
console.log('111')
  system.server.write('put ' + base64_encode(fileBuffer) + ' ' + args.filename, 'utf8', function() {
console.log('aaa')
    system.server.end()
  })
  return "File sent.\n"
})

var client = new Client(parser)
client.set('port', 8888).start()

var cliParser = new Parser()

cliParser.addCommand('send')
.set('syntax', ['send <file> <filename>'])
.set('logic', function(args) {

console.log('azaz')
  return client.parse('send ' + args.file + ' ' + args.filename)
})

var shell = new Shell(cliParser)
shell.start()
