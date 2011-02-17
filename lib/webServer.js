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

      // POSTs get data asynchronously so use callback
      var callback = false
      if (request.method == 'POST') {

        callback = function(output) {
          response.writeHead(200, {'Content-Type': 'text/html'})
          response.end(output)
        }
      }

      // dispatch request
      var output = parser.parseLexemes(
        webServer.requestToLexemes(request),
        callback,
        {"request": request, "getPost": webServer.getPost}
      )

      // allow POST requests to handle their own output
      if (!callback) {
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end(output)
      }
    }).listen(this.port)

    console.log('Server started at port ' + this.port + '...')
  },

  requestToLexemes: function(request) {
    // extract URL's path
    var path = url.parse(request.url).pathname

    // convert path to lexemes
    var lexemes = path.split('/').slice(1)

    // neutralize trailing slashes
    if(lexemes[lexemes.length - 1] == '') {
      lexemes.pop()
    }

    // prepend HTTP method to lexemes
    lexemes.unshift(request.method)

    return lexemes
  },

  getPost: function(request, callback) {

    var dataRaw = ''

    // receive chunks of data
    request.on('data', function(data) {
      dataRaw += data.toString()
    })

    // process data
    request.on('end', function() {

      callback(querystring.parse(dataRaw))
    })
  }
}
