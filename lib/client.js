/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var net = require('net')
  , Command = require('./command').Command

exports.Client = function Shell(parser) {

  this.parser = parser || undefined
  this.host = '127.0.0.1'
  this.port = 8000
  this.parseErrorMessage = "Bad command or command usage.\n"

  return this
}

exports.Client.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  start: function(argv) {

    var parser = this.parser

    console.log('Connecting to host ' + this.host +' port ' + this.port + '...')

    var conn = net.createConnection(this.port, this.host)
    this.conn = conn

    conn.on('data', function(data) {

      data = data.toString()

      var output = parser.parse(data, false, {"server": conn})

      if (output) {
        console.log(output)
      }
    })

    if (argv) {
      var output = parser.parseLexemes(argv['_'], false, {"server": conn})

      if (output) {
        console.log(output)
      }
    }

    return this
  },

  parse: function(input) {

    return this.parser.parse(input, false, {"server": this.conn})
  }
}
