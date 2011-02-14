var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , http = require('http')

var parser = new Parser()

parser.addCommand('home')
.set('syntax', [''])
.set('logic', function(args) {
  var output = "<h1>Hello World!</h1>"
             + "Check out the <a href='/news'>news</a>."

  return output
})

parser.addCommand('news')
.set('syntax', ['news', 'news <story>'])
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

  response.writeHead(200, {'Content-Type': 'text/html'})
  response.end(
    parser.parseLexemes(
      parser.urlToLexemes(request.url)
    )
  )
}).listen(8000);

console.log('Server running at http://127.0.0.1:8000/');
