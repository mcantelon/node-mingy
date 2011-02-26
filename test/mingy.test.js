var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , assert = require('assert')
  , should = require('should')

module.exports = {

  // basic command object setup
  'command configuration': function() {
    var command = new Command('look')
    command.set('syntax', ['look <string>'])
    command.set('logic', function(args) {
      if (!args || !args['string']) {
        return 'Nothing to look at.'
      }
      else {
        return 'You look at ' + args['string'] + '.'
      }
    })
    command.name.should.equal('look')
    command.syntax.length.should.equal(1)
    command.logic().should.equal('Nothing to look at.')
  },

  // named argument
  'command with named, untyped param': function() {
    var command = new Command('look')
    command.set('syntax', ['look <thing>'])
    command.set('logic', function(args) {
      return 'You look at ' + args['thing'] + '.'
    })

    var parser = new Parser([command])
    var output = parser.parseLexemes(['look', 'cat'])
    output.should.equal('You look at cat.')
  },

  // name argument and unrelated validator
  'command with named, untyped param and validator handler set': function() {
    var command = new Command('look')
    command.set('syntax', ['look <thing>'])
    command.set('logic', function(args) {
      return 'You look at ' + args['thing'] + '.'
    })

    var parser = new Parser([command])
    parser.addValidator('animal', function(lexeme) {
      throw "This should not have fired!"
      return lexeme
    })
    var output = parser.parseLexemes(['look', 'cat'])
    output.should.equal('You look at cat.')
  },

  // argument validator
  'simple parse with named, validated param': function() {
    var command = new Command('look')
    command.set('syntax', ['look <is_cat:thing>'])
    command.set('logic', function(args) {
      if (!args || !args['thing']) {
        return 'Nothing to look at.'
      }
      else {
        return 'You look at ' + args['thing'] + '.'
      }
    })

    var parser = new Parser([command])
    parser.addValidator('is_cat', function(lexeme) {
      if (lexeme == 'cat') {
        return {
          "success": true,
          "value": lexeme
        }
      }
      else {
        return {
          "success": false,
          "message": "That is not a cat."
        }
      }
    })

    var output = parser.parseLexemes(['look', 'cat'])
    output.should.equal('You look at cat.')

    var output = parser.parseLexemes(['look', 9])
    output.should.equal('That is not a cat.')
  },

  // typed name with no type hanlder
  'simple parse with named, typed param': function() {
    var command = new Command('look')
    command.set('syntax', ['look <string:thing>'])
    command.set('logic', function(args) {
      if (!args || !args['thing']) {
        return 'Nothing to look at.'
      }
      else {
        return 'You look at ' + args['thing'] + '.'
      }
    })

    var parser = new Parser([command])

    // arg is a string, so it should parse
    var output = parser.parseLexemes(['look', 'cat'])
    output.should.equal('You look at cat.')

    // arg is a number, so it shouldn't parse
    var output = parser.parseLexemes(['look', 9])
    should.equal(undefined, output)
  },

  // multiple command forms
  'multiple command forms': function() {
    var command = new Command('look')
    command.set('syntax', [
      'look <string:thing>',
      '<thing> examine'
    ])
    command.set('logic', function(args) {
      if (!args || !args['thing']) {
        return 'Nothing to look at.'
      }
      else {
        return 'You look at ' + args['thing'] + '.'
      }
    })

    var parser = new Parser([command])

    // try first command form
    var output = parser.parseLexemes(['look', 'cat'])
    output.should.equal('You look at cat.')

    // try second command form
    var output = parser.parseLexemes(['cat', 'examine'])
    output.should.equal('You look at cat.')
  },

  // callback from command
  'callback from command': function() {
    var parser = new Parser()
    parser.addCommand('test')
    .set('syntax', ['test'])
    .set('logic', function(args, env, system) {
      system.callback('jazzhands')
     })
    var success = false
    parser.parse('test', function(output) {
      output.should.equal('jazzhands')
      success = true
    })
    while(!success) {
      process.nextText()
    }
  },

  // load commands from hash
  'load commands from hash': function() {

    var commands = {
      "test1": {
        "syntax": ['test one'],
        "logic": function(args) {
          return "got test one"
        }
      },
      "test2": {
        "syntax": ['test two'],
        "logic": function(args) {
          return "got test two"
        }
      }
    }

    var parser = new Parser(commands)
    var first_test = parser.parse('test one')
    first_test.should.equal('got test one')
    var second_test = parser.parse('test two')
    second_test.should.equal('got test two')
  },

  // test out parser lexeme transformation functionality
  'parser lexeme transform': function() {

    var parser = new Parser()
    parser.setEnv('fullNames', {"monkey": "golden monkey"})

    parser.addCommand('touch')
    .set('syntax', ['touch <thing>'])
    .set('logic', function(args) {

      return "You touch the " + args.thing + "."
    })

    parser.addLexemeTransform(function(lexemes, env) {

      for (var lexemeIndex in lexemes) {
        if (env.fullNames[(lexemes[lexemeIndex])]) {
          lexemes[lexemeIndex] = env.fullNames[(lexemes[lexemeIndex])]
        }
      }

      return lexemes
    })

    var output = parser.parse('touch monkey')
    output.should.equal('You touch the golden monkey.')
  }
}
