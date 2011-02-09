/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var util = require('util')
  , net = require('net')
  , Command = require('./command').Command

exports.Shell = function Shell(parser, post_command_logic) {

  this.parser = parser || undefined
  this.post_command_logic = post_command_logic || undefined
  this.prompt = '> '
  this.port = 8000

  // what do modes do?
  this.modes = {
    'default_mode': this.default_mode
  }
  this.mode = 'default_mode'

  return this
}

exports.Shell.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  set_mode: function(mode, logic) {
    this.modes[mode] = logic
    return this
  },

  default_mode: function(shell, data) {

    var output = shell.parser.parse(data)
    output = output || "Bad command or command usage.\n"

    return output
  },

  start: function() {

    var parser = this.parser
    var shell  = this

    var stdin = process.openStdin()

    shell.main(parser, shell, stdin)
  },

  startServer: function() {

    var parser = this.parser
    var shell  = this

    var server = net.createServer(function (stream) {

      shell.main(parser, shell, stream, true)
    })

    server.listen(this.port)
  },

  main: function(parser, shell, stream, isStream) {

    stream.setEncoding('utf8')

    if (isStream) {
      stream.on('connect', function() {
        stream.write(shell.prompt)
      })
    }
    else {
      util.print(shell.prompt)
    }

    stream.on('data', function(data) {

      var output = shell.execute(parser, shell, data)

      output += shell.prompt

      if (isStream) {
        stream.write(output)
      }
      else {
        util.print(output)
      }
    })

    stream.on('end', function() {
      stream.end()
    })
  },

  execute: function(parser, shell, data, output_function) {

    var output = shell.modes[shell.mode](shell, data)

    if (shell.post_command_logic) {
      shell.post_command_logic(shell)
    }

    return output
  }
}
