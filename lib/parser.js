/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var util = require('util')
  , url = require('url')
  , Command = require('./command').Command

exports.Parser = function Parser(commands) {

  this.loadCommands(commands)
  this.validators = {}
  this.env = {}
  this.lexemeTransforms = []
}

exports.Parser.prototype = {

  setEnv: function(property, value) {
    this.env[property] = value
  },

  loadCommands: function(commands) {

    if (commands) {

      if(commands.constructor.name == 'Array') {

        this.commands = commands
      }
      else if(commands.constructor.name == 'Object') {

        this.commands = {}

        for (var name in commands) {
          this.addCommand(name)
          .set('syntax', commands[name].syntax)
          .set('logic', commands[name].logic)
        }
      }
      else {

        throw "Commands given to parser must be an array or hash (object)."
      }
    }
    else {

      this.commands = {}
    }
  },

  addCommand: function(name) {

    // throw error if name already taken
    var command = new Command('name')
    this.commands[name] = command
    return command
  },

  addValidator: function(name, logic) {
    this.validators[name] = logic
  },

  addLexemeTransform: function(logic) {
    this.lexemeTransforms.push(logic)
  },

  parse: function(input, callback, system) {

    input = this.cleanInput(input)
    var lexemes = input.split(' ')
    return this.parseLexemes(lexemes, callback, system)
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

  validCommands: function(lexemes) {

    var commands = []

    // cycle through commands looking for syntax match
    for (var index in this.commands) {

      var command = this.commands[index]

      // we clone lexemes because if the last syntax lexeme has a wildcard the
      // submitted lexeme corresponding to the last syntax lexeme ends up
      // getting subsequent submitted lexemes added to it
      if (command.try(this.validators, this.env, this.clone(lexemes), true)) {
        commands.push(command)
      }
    }

    return commands
  },

  parseLexemes: function(lexemes, callback, system) {

    var output = ''

    // cycle through plugins
    for (var index in this.lexemeTransforms) {

      lexemes = this.lexemeTransforms[index](lexemes, this.env)
    }

    // cycle through commands looking for syntax match
    var validCommands = this.validCommands(lexemes)
    for (var index in validCommands) {

      var command = validCommands[index]

      // command condition jazz goes here
      if (1) {

        system = system || {}
        system.callback = callback
        result = command.try(this.validators, this.env, lexemes, false, system)

        if (result) {
          return output + result
        }
      }
      else if(output) {
        return output
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
