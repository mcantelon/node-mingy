/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var util = require('util')
  , Command = require('./command').Command

exports.Shell = function Shell(parser, post_command_logic) {

  this.parser = parser || undefined
  this.post_command_logic = post_command_logic || undefined
  this.prompt = '> '

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

  default_mode: function(shell, data) {

    var output = shell.parser.parse(data)
    output = output || "Bad command or command usage.\n"

    return output
  },

  start: function() {

    var parser = this.parser
    var shell = this

    var stdin = process.openStdin()
    stdin.setEncoding('utf8')

    util.print(shell.prompt)
    stdin.on('data', function (data) {

      output = shell.modes[shell.mode](shell, data)

      if (shell.post_command_logic) {
        shell.post_command_logic(shell)
      }

      util.print(output)
      util.print(shell.prompt)
    })
  }
}
