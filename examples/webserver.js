/*

THIS IS A WORK IN PROGRESS...

*/
var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , http = require('http')
  , url = require('url')
  , querystring = require('querystring')

var parser = new Parser()

// define commands (which function as routes)
parser.addCommand('home')
.set('syntax', ['<method>'])
.set('logic', function(args, env, system) {

  var output = ''

  if (args.method == 'GET') {

    output += '<h1>Hello World!</h1>'+
              '<p>Check out the <a href="/news">news</a>.</p>'+
              '<h2>Add Story</h2>'+
              '<form action="/" method="post">'+
              '  <p>Slug: <input type="text" name="slug" /></p>'+
              '  <p>Title: <input type="text" name="title" /></p>'+
              '  <p>Body: <textarea name="body"></textarea></p>'+
              '  <p><input type="submit" value="Post" /></p>'+
              '</form>'
  }
  else if(args.method == 'POST') {

    var dataRaw = ''

    // receive chunks of data
    env.request.on('data', function(data) {
      dataRaw += data.toString()
    })

    // process data
    env.request.on('end', function() {

      // add story to in-memory stories
      var storyData = querystring.parse(dataRaw)
      env.news[storyData.slug] = {
        "title": storyData.title,
        "body": storyData.body
      }

      output += 'Story added. Check out the <a href="/news">news</a>.'

      // send response
      system.callback(output)
    })
  }

  return output
})

parser.addCommand('news')
.set('syntax', ['GET news', 'GET news <story>'])
.set('logic', function(args, env) {

  var output = ''

  if (args['story']) {

    output += "<h1>" + env.news[args.story].title + "</h1>"
    output += "<p>" + env.news[args.story].body + "</p>"
  }
  else {

    output += "<h1>News!</h1>"

    for (var story in env.news) {
      output += "<a href='/news/" + story + "'>" + env.news[story].title + "</a><br />"
    }
  }

  return output
})

// in-memory store of stories
parser.setEnv(
  'news',
  {
    "earthquake": {
      "title": "Horrid Earthquake",
      "body": "The earthquake was depressing."
    },
    "disease": {
      "title": "That Disease isn't such a Problem Anymore",
      "body": "The disease was cured."
    }
  }
)

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
}).listen(8000);

console.log('Server running at http://127.0.0.1:8000/');
