/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

exports.Command = function(name) {

  this.name = name || ''
  this.case_sensitive = false
}

exports.Command.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  try: function(validators, env, lexemes, test_mode) {

    var args = false
      , error
      , command_result

    if (this.syntax) {
      for(var index in this.syntax) {

        var syntax_lexemes = this.syntax[index].split(' ')

        if (syntax_lexemes.length == lexemes.length) {

          // test submitted lexemes against this syntax
          var valid = this.try_syntax_keywords(syntax_lexemes, lexemes)

          // valid syntax pattern found... now see arg lexemes are proper
          if (valid) {
            var result = this.determine_command_arguments(validators, syntax_lexemes, lexemes)
            if (result['error']) {
              valid = false
              error = result['error']
            }
          }

          if (valid) {

            command_result = ''

            // a bunch of condition stuff goes here

            if (test_mode) {
              return true
            }

            // do eval
            command_result += this.logic(result['args'], env)

            return command_result
          }
        }
      }
    }

    return args
  },

  type: function(object) {

    return object.constructor.name
  },

  try_syntax_keywords: function(syntax_lexemes, submitted_lexemes) {

    var valid = true
    var lexeme_to_test = 0

    for (var index in syntax_lexemes) {

      var syntax_lexeme    = syntax_lexemes[index]
      var submitted_lexeme = submitted_lexemes[lexeme_to_test]

      if (!this.case_sensitive) {
        syntax_lexeme    = (typeof syntax_lexeme == 'string')
          ? syntax_lexeme.toLowerCase()
          : syntax_lexeme
        submitted_lexeme = (typeof submitted_lexeme == 'string')
          ? submitted_lexeme.toLowerCase()
          : submitted_lexeme
      }

      // if lexeme doesn't reference an object, test as a keyword
      if (syntax_lexeme[0] != '<' && (syntax_lexeme != submitted_lexeme)) {
        valid = false
      }

      lexeme_to_test++
    }

    return valid
  },

  trim_arg_delimiters: function(arg) {

    return arg.slice(1, arg.length-1)
  },

  determine_command_arguments: function(validators, syntax_lexemes, input_lexemes) {

    var lexeme_to_test = 0

    var lexemes = input_lexemes

    var reference_data, reference_type, reference_name

    var error = false
    var arg = {}

    for (var index in syntax_lexemes) {

      var lexeme = syntax_lexemes[index]

      if (lexeme[0] == '<') {

        // determine reference type
        reference_data = this.trim_arg_delimiters(lexeme).split(':')
        reference_type = reference_data[0]

        // trim "<" and ">" from reference to determine reference type
        reference_name = (reference_data[1])
          ? reference_data[1]
          : reference_type

        // if there's a type handler, use it if the lexeme is the same type
        if (validators[reference_type]) {

          if (typeof lexemes[lexeme_to_test] == reference_type) {
            arg[reference_name] = validators[reference_type](lexemes[lexeme_to_test])
          }
          else {
            error = 'Error'
          }
        }
        else {

          if (reference_data.length == 1 || typeof lexemes[lexeme_to_test] == reference_type) {
            arg[reference_name] = lexemes[lexeme_to_test]
          } else {
            error = 'Error'
          }
        }
      }

      lexeme_to_test += 1
    }

    return {
      'error': error,
      'args': arg
    }
  }
}
