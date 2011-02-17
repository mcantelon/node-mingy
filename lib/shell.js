/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var util = require('util')
  , net = require('net')
  , Command = require('./command').Command

exports.Shell = function Shell(parser) {

  this.parser = parser || undefined
  this.prompt = '> '
  this.port = 8000
  this.parseErrorMessage = "Bad command or command usage.\n"

  // what do modes do?
  this.modes = {
    'default': this.defaultMode
  }
  this.mode = 'default'

  return this
}

exports.Shell.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  setMode: function(mode, logic) {
    this.modes[mode] = logic
    return this
  },

  streamActive: function(stream) {

    return !stream.type || stream.userID
  },

  defaultMode: function(shell, data, system) {

    if (shell.streamActive(system.stream)) {
      var output = shell.parser.parse(data, false, system)
      output = output || shell.parseErrorMessage

      return output
    }
  },

  start: function() {

    var parser = this.parser
    var shell  = this

    util.print(shell.welcome)
    util.print(shell.prompt)

    var stdin = process.openStdin()

    shell.main(parser, shell, stdin)
  },

  startServer: function() {

    var parser = this.parser
    var shell  = this

    console.log('Server started at port ' + this.port + '...')

    var server = net.createServer(function (stream) {

      shell.main(parser, shell, stream, true)
    })

    server.listen(this.port)
  },

  main: function(parser, shell, stream, isStream) {

    stream.setEncoding('utf8')

    stream.on('connect', function() {

      stream.userID = stream.remoteAddress + '|' + stream.remotePort

      if (shell.welcome) {
        stream.write(shell.welcome)
      }
      if (shell.connectLogic) {
        var connectOutput = shell.connectLogic(shell, {"stream": stream})
        if (connectOutput) {
          stream.write(connectOutput)
        }
      }
      if (shell.prompt && isStream) {
        stream.write(shell.prompt)
      }
    })

    stream.on('data', function(data) {

      if (shell.streamActive(stream)) {

        var output = shell.execute(parser, shell, data, stream)

        // don't show prompt if stream no longer active
        if (shell.streamActive(stream)) {
          output += shell.prompt
        }

        if (output) {
          if (isStream) {
            stream.write(output)
          }
          else {
            util.print(output)
          }
        }
      }
    })

    stream.on('end', function() {
      stream.end()
    })
  },

  execute: function(parser, shell, data, stream) {

    var output = ''

    if (shell.mode && shell.modes[shell.mode]) {
      var modeOutput = shell.modes[shell.mode](shell, data, {"stream": stream})
      output += (modeOutput) ? modeOutput : ''
    }

    if (shell.logic) {
      var postCommandOutput = shell.logic(shell, {"stream": stream})
      output += (postCommandOutput) ? postCommandOutput : ''
    }

    return output
  }
}
