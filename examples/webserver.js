/*

THIS IS A WORK IN PROGRESS...

*/
var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , WebServer = mingy.WebServer
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
    system.request.on('data', function(data) {
      dataRaw += data.toString()
    })

    // process data
    system.request.on('end', function() {

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

var web = new WebServer(parser)
.set('port', '8888')
.start()
