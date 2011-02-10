var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell
  , fs = require('fs')

var commands = []

commands.push(command = new Command('quit'))
command.set('syntax', ['quit', 'exit'])
command.set('logic', function(args) {
  process.exit(0)
})

commands.push(command = new Command('ls'))
command.set('syntax', ['ls'])
command.set('logic', function(args) {
  var output = ''
  var directory = fs.readdirSync(process.cwd())
  for (var index in directory) {
    output += directory[index] + "\n"
  }
  return output
})

commands.push(command = new Command('cd'))
command.set('syntax', ['cd <path>'])
command.set('logic', function(args) {
  var output = ''
  try {
    process.chdir(process.cwd() + '/' + args['path'])
    output += "Directory changed.\n"
  } catch(e) {
    output += "Bad directory.\n"
  }
  return output
})

var welcome = "Welcome to Sullen Shell: the shell with few aspirations.\n"
            + "Available commands: 'ls', 'cd', 'quit', or 'exit'.\n\n"

var parser = new Parser(commands)

var shell = new Shell(parser)
.set('welcome', welcome)
.set('prompt', '$ ')
.start()
