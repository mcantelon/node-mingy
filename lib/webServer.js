/*!
* mingy
* Copyright(c) 2011 Mike Cantelon
* MIT Licensed
*/

var connect = require('connect')
  , url = require('url')
  , querystring = require('querystring')

exports.WebServer = function WebServer(parser) {

  this.parser = parser || undefined
  this.parseErrorMessage = "Bad command or command usage.\n"
  this.createMiddleware()

  return this
}

exports.WebServer.prototype = {

  createMiddleware: function() {

    var parser = this.parser
    var webServer = this

    this.middleware = function (request, response, next) {

      // POSTs get data asynchronously so use callback
      var callback = false
      if (request.method == 'POST') {

        callback = function(output) {
          webServer.sendHtmlResponse(response, output)
        }
      }

      var system = {
        "request": request,
        "response": response,
        "sendHtmlResponse": webServer.sendHtmlResponse,
        "getPost": webServer.getPost
      }

      // create lexemes from request method and path
      var lexemes = webServer.requestToLexemes(request)

      // if the lexemes correspond to any commands, parse them
      if (parser.validCommands(lexemes).length) {

        var output = parser.parseLexemes(
          lexemes,
          callback,
          system
        )
      }
      else {
        return next()
      }

      // allow POST requests to handle their own output
      if (!callback) {
        webServer.sendHtmlResponse(response, output)
      }
    }

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

  sendHtmlResponse: function(response, output, code) {

    code = code || 200

    response.writeHead(code, {'Content-Type': 'text/html'})
    response.end(output)
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
