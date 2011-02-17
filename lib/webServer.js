/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var http = require('http')
  , url = require('url')
  , querystring = require('querystring')

exports.WebServer = function WebServer(parser) {

  this.parser = parser || undefined
  this.port = 8000
  this.parseErrorMessage = "Bad command or command usage.\n"

  return this
}

exports.WebServer.prototype = {

  set: function(property, value) {
    this[property] = value
    return this
  },

  start: function() {

    var parser = this.parser
    var webServer = this

    http.createServer(function (request, response) {

      parser.env['request']  = request
      parser.env['response'] = response

      var callback = false
      if (request.method == 'POST') {

        callback = function(output) {
          response.writeHead(200, {'Content-Type': 'text/html'})
          response.end(output)
        }
      }

      // dispatch request
      var output = parser.parseLexemes(
        parser.webRequestToLexemes(request),
        callback
      )

      // allow POST requests to handle their own output
      if (!callback) {
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end(output)
      }
    }).listen(this.port)

    console.log('Server started at port ' + this.port + '...')
  }
}