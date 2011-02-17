/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

exports.Command = function Command(name) {

  this.name = name || ''
  this.caseSensitive = false
}

exports.Command.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  // if test mode is true, return true if lexemes will trigger this command
  // if test mode is falsey, execute command logic
  try: function(validators, env, lexemes, testMode, system) {

    var args = false
      , commandResult

    // try each syntax form
    if (this.syntax) {
      for(var index in this.syntax) {

        var syntaxLexemes = this.syntax[index].split(' ')

        //if (syntaxLexemes.length == lexemes.length) {

          // test submitted lexemes against this syntax
          var valid = this.trySyntaxKeywords(syntaxLexemes, lexemes)

          // valid syntax pattern found... now see arg lexemes are proper
          if (valid) {

            // if the last syntax lexeme ends with an *, amalgamate execess
            // submitted lexemes to the submitted lexemes at the same
            // position as the last syntax lexeme
            var lastSyntaxLexemeIndex = syntaxLexemes.length - 1
            if (syntaxLexemes[lastSyntaxLexemeIndex].match(/\*>$/)) {

              lexemes[lastSyntaxLexemeIndex] =
                lexemes
                  .slice(lastSyntaxLexemeIndex, lexemes.length)
                  .join(' ')
            }

            // see if the arguments given to the command are valid
            var result = this.determineCommandArguments(validators, env, syntaxLexemes, lexemes)
            if (result.success === false) {
              if (result.message) {
                return result.message
              }

              valid = false
            }
          }

          if (valid) {

            commandResult = ''

            // a bunch of condition stuff goes here

            if (testMode) {
              return true
            }

            // do eval
            commandResult += this.logic(result['args'], env, system)

            return commandResult
          }
        //}
      }
    }

    return args
  },

  type: function(object) {

    return object.constructor.name
  },

  trySyntaxKeywords: function(syntaxLexemes, submittedLexemes) {

    var valid = true
      , lexemeToTest = 0
      , secondToLast

    for (var index in syntaxLexemes) {

      var syntaxLexeme    = syntaxLexemes[index]
      var submittedLexeme = submittedLexemes[lexemeToTest]

      if (!this.caseSensitive) {
        syntaxLexeme    = (typeof syntaxLexeme == 'string')
          ? syntaxLexeme.toLowerCase()
          : syntaxLexeme
        submittedLexeme = (typeof submittedLexeme == 'string')
          ? submittedLexeme.toLowerCase()
          : submittedLexeme
      }

      // if lexeme doesn't reference an object, test as a keyword
      if (syntaxLexeme[0] != '<' && (syntaxLexeme != submittedLexeme)) {
        valid = false
      }

      lexemeToTest++
    }

    secondToLast = syntaxLexemes[index][(syntaxLexemes[index].length - 2)]

    // if final syntax lexeme didn't end with a * character and length of syntax
    // vs submitted is different then invalid
    if (secondToLast != '*' && syntaxLexemes.length != submittedLexemes.length) {
      valid = false
    }

    return valid
  },

  trimArgDelimiters: function(arg) {

    return arg.slice(1, arg.length-1)
  },

  determineCommandArguments: function(validators, env, syntaxLexemes, inputLexemes) {

    var lexemeToTest = 0

    var lexemes = inputLexemes

    var referenceData, referenceType, referenceName

    var success = true
    var arg = {}

    for (var index in syntaxLexemes) {

      var lexeme = syntaxLexemes[index]

      if (lexeme[0] == '<') {

        // determine reference type
        referenceData = this.trimArgDelimiters(lexeme).split(':')
        referenceType = referenceData[0]

        // trim "<" and ">" from reference to determine reference type
        referenceName = (referenceData[1])
          ? referenceData[1]
          : referenceType

        // if there's a validator, use it to test lexeme
        if (validators[referenceType]) {

          // need to return an object with success, value, and message
          // success determines whether validation was successful
          // value allows transformation of the lexeme
          // message allows a message to be passed back???
          var result = validators[referenceType](lexemes[lexemeToTest], env)
          if (result.success) {
            arg[referenceName] = (result.value ===  undefined)
              ? lexemes[lexemeToTest]
              : result.value
          }
          else {
            // if error is set to a string this message will be returned to the user
            if (result.message) {
              return {'success': false, 'message': result.message}
            }
          }
        }
        else {

          if (referenceData.length == 1
            || typeof lexemes[lexemeToTest] == referenceType
          ) {
            arg[referenceName] = lexemes[lexemeToTest]
          }
          else {
            // if error is simply true a generic error message will be returned to the user
            success = false
          }
        }
      }

      lexemeToTest += 1
    }

    return {
      'success': success,
      'args': arg
    }
  }
}
