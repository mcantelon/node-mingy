var connect = require('connect')
  , mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , ConnectMiddleware = mingy.ConnectMiddleware

// in-memory store of stories
var stories = {
  "earthquake": {
    "title": "Horrid Earthquake",
    "body": "The earthquake was depressing."
  },
  "disease": {
    "title": "That Disease isn't such a Problem Anymore",
    "body": "The disease was cured."
  }
}

var parser = new Parser()
parser.setEnv('news', stories)

// define commands (which function as routes)
parser.addCommand('home')
.set('syntax', ['<method>'])
.set('logic', function(args, env, system) {

  var output = ''

  if (args.method == 'GET') {

    output += '<div><img src="/mingy_times.png" /></div>'+
              '<h1>Hello World!</h1>'+
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

    system.getPost(system.request, function(storyData) {

      env.news[storyData.slug] = {
        "title": storyData.title,
        "body": storyData.body
      }

      output += 'Story added! Check out the <a href="/news">news</a>.'

      system.callback(output)
    })
  }

  return output
})

parser.addValidator('storyExists', function(lexeme, env) {
  return {
    'success': env.news[lexeme],
    'message': "Story not found.\n"
  }
})

parser.addCommand('news')
.set('syntax', ['GET news', 'GET news <storyExists:story>'])
.set('logic', function(args, env, system) {

  var output = ''

  if (args.story) {

    if (env.news[args.story]) {
      output += "<h1>" + env.news[args.story].title + "</h1>"
      output += "<p>" + env.news[args.story].body + "</p>"
    }
  }
  else {

    output += "<h1>News!</h1>"

    for (var story in env.news) {
      output += "<a href='/news/" + story + "'>" + env.news[story].title + "</a><br />"
    }
  }

  return output
})

var mingyRouter = new ConnectMiddleware(parser)

connect.createServer(
  connect.staticProvider(__dirname + '/public'),
  mingyRouter
)
.listen(8888)

console.log("Server started at port 8888...")
