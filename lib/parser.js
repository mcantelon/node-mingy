/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var util = require('util')
  , Command = require('./command').Command

exports.Parser = function Parser(commands) {

  this.commands = commands || {}
  this.validators = {}
  this.env = {}
}

exports.Parser.prototype = {

  setEnv: function(property, value) {
    this.env[property] = value
  },

  add_command: function(name) {

    // throw error if name already taken
    var command = new Command('name')
    this.commands[name] = command
    return command
  },

  add_validator: function(name, logic) {
    this.validators[name] = logic
  },

  parse: function(input) {

    input = this.cleanInput(input)
    var lexemes = input.split(' ')
    return this.parseLexemes(lexemes)
  },

  cleanInput: function(input) {

    // remove trailing newline
    if (input.slice(-1) == "\n") {
      input = input.slice(0, input.length - 1)
    }

    // remove redundant spaces
    while (input.indexOf('  ') != -1) {
      input = input.replace('  ', ' ')
    }

    return input
  },

  parseLexemes: function(lexemes) {

    var output = ''

    // cycle through commands looking for syntax match
    for (var index in this.commands) {

      var command = this.commands[index]
      if (command.try(this.validators, this.env, lexemes, true)) {

        // command condition jazz goes here
        if (1) {

          result = command.try(this.validators, this.env, lexemes)

          if (result) {
            return output + result
          }
        }
        else if(output) {

          return output
        }
      }
    }
  },

  shell: function(prompt, post_command_logic) {

    var parser = this
    var stdin = process.openStdin()
    stdin.setEncoding('utf8')

    util.print(prompt)
    stdin.on('data', function (data) {

      var output = parser.parse(data)
      output = output || "Bad command or command usage.\n"

      if (post_command_logic) {
        post_command_logic(parser)
      }

      util.print(output)
      util.print(prompt)
    })
  }
}
