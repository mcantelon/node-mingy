var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell
  , fs = require('fs')

var parser = new Parser()

parser.addCommand('quit')
.set('syntax', ['quit', 'exit'])
.set('logic', function(args) {
  process.exit(0)
})

parser.addCommand('ls')
.set('syntax', ['ls'])
.set('logic', function(args) {
  var output = ''
  var directory = fs.readdirSync(process.cwd())
  for (var index in directory) {
    output += directory[index] + "\n"
  }
  return output
})

parser.addCommand('cd')
.set('syntax', ['cd <path>'])
.set('logic', function(args) {
  var output = ''
  try {
    process.chdir(process.cwd() + '/' + args['path'])
    output += "Directory changed.\n"
  } catch(e) {
    output += "Bad directory.\n"
  }
  return output
})

var welcome = 'Welcome to Sullen Shell: the shell with few aspirations.\n'+
              'Available commands: "ls", "cd", "quit", or "exit".\n\n'

var shell = new Shell(parser)
.set('welcome', welcome)
.set('prompt', '$ ')
.start()
