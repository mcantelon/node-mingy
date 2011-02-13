/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

exports.Command = function Command(name) {

  this.name = name || ''
  this.case_sensitive = false
}

exports.Command.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  // if test mode is true, return true if lexemes will trigger this command
  // if test mode is falsey, execute command logic
  try: function(validators, env, lexemes, test_mode, stream) {

    var args = false
      , command_result

    // try each syntax form
    if (this.syntax) {
      for(var index in this.syntax) {

        var syntax_lexemes = this.syntax[index].split(' ')

        //if (syntax_lexemes.length == lexemes.length) {

          // test submitted lexemes against this syntax
          var valid = this.try_syntax_keywords(syntax_lexemes, lexemes)

          // valid syntax pattern found... now see arg lexemes are proper
          if (valid) {

            // if the last syntax lexeme ends with an *, amalgamate execess
            // submitted lexemes to the submitted lexemes at the same
            // position as the last syntax lexeme
            var last_syntax_lexeme_index = syntax_lexemes.length - 1
            if (syntax_lexemes[last_syntax_lexeme_index].match(/\*>$/)) {

              lexemes[last_syntax_lexeme_index] =
                lexemes
                  .slice(last_syntax_lexeme_index, lexemes.length)
                  .join(' ')
            }

            // see if the arguments given to the command are valid
            var result = this.determine_command_arguments(validators, env, syntax_lexemes, lexemes)
            if (result.success === false) {
              if (result.message) {
                return result.message
              }

              valid = false
            }
          }

          if (valid) {

            command_result = ''

            // a bunch of condition stuff goes here

            if (test_mode) {
              return true
            }

            // do eval
            command_result += this.logic(result['args'], env, stream)

            return command_result
          }
        //}
      }
    }

    return args
  },

  type: function(object) {

    return object.constructor.name
  },

  try_syntax_keywords: function(syntax_lexemes, submitted_lexemes) {

    var valid = true
      , lexeme_to_test = 0
      , second_to_last

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

    second_to_last = syntax_lexemes[index][(syntax_lexemes[index].length - 2)]

    /*
    // if final syntax lexeme ends with a * character, amalgamate any
    // following submitted lexemes
    if (second_to_last == '*') {

      var last_syntax_lexeme_index = index
      index++
      while(index < submitted_lexemes.length) {
console.log(submitted_lexemes[index])
        submitted_lexemes[last_syntax_lexeme_index] += ' ' + submitted_lexemes[index]
        index++
      }
    }
    else if (
    */
    if (second_to_last != '*' && syntax_lexemes.length != submitted_lexemes.length) {
      valid = false
    }

// if final syntax lexeme didn't end with a * character and length of syntax vs submitted
// is different then invalid

    return valid
  },

  trim_arg_delimiters: function(arg) {

    return arg.slice(1, arg.length-1)
  },

  determine_command_arguments: function(validators, env, syntax_lexemes, input_lexemes) {

    var lexeme_to_test = 0

    var lexemes = input_lexemes

    var reference_data, reference_type, reference_name

    var success = true
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

        // if there's a validator, use it to test lexeme
        if (validators[reference_type]) {

          // need to return an object with success, value, and message
          // success determines whether validation was successful
          // value allows transformation of the lexeme
          // message allows a message to be passed back???
          var result = validators[reference_type](lexemes[lexeme_to_test], env)
          if (result.success) {
            arg[reference_name] = (result.value ===  undefined) ? lexemes[lexeme_to_test] : result.value
          }
          else {
            // if error is set to a string this message will be returned to the user
            if (result.message) {
              return {'success': false, 'message': result.message}
            }
          }
        }
        else {

          if (reference_data.length == 1 || typeof lexemes[lexeme_to_test] == reference_type) {
            arg[reference_name] = lexemes[lexeme_to_test]
          } else {
            // if error is simply true a generic error message will be returned to the user
            success = false
          }
        }
      }

      lexeme_to_test += 1
    }

    return {
      'success': success,
      'args': arg
    }
  }
}
