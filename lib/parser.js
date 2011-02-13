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

  parse: function(input, stream) {

    input = this.cleanInput(input)
    var lexemes = input.split(' ')
    return this.parseLexemes(lexemes, stream)
  },

  cleanInput: function(input) {

    // server shell sends extra junk
    input = input.replace("\r\n", "\n")

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

  parseLexemes: function(lexemes, stream) {

    var output = ''

    // cycle through commands looking for syntax match
    for (var index in this.commands) {

      var command = this.commands[index]

      // we clone lexemes because if the last syntax lexeme has a wildcard the
      // submitted lexeme corresponding to the last syntax lexeme ends up
      // getting subsequent submitted lexemes added to it
      if (command.try(this.validators, this.env, this.clone(lexemes), true)) {

        // command condition jazz goes here
        if (1) {

          result = command.try(this.validators, this.env, lexemes, false, stream)

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

  clone: function(obj) {
    var newObj = (obj instanceof Array) ? [] : {};
    for (i in obj) {
      if (i == 'clone') continue;
      if (obj[i] && typeof obj[i] == "object") {
        newObj[i] = this.clone(obj[i]);
      } else newObj[i] = obj[i]
    } return newObj;
  }
}
