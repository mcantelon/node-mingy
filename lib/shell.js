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
  return this
}

exports.Shell.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  start: function() {

    var parser = this.parser
    var shell = this

    var stdin = process.openStdin()
    stdin.setEncoding('utf8')

    util.print(shell.prompt)
    stdin.on('data', function (data) {

      var output = parser.parse(data)
      output = output || "Bad command or command usage.\n"

      if (this.post_command_logic) {
        this.post_command_logic(parser)
      }

      util.print(output)
      util.print(shell.prompt)
    })
  }
}
