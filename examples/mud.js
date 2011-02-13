var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell

// define locations in our special game
var Location = function Location() {}
var locations = {}

var hallway = new Location()
hallway.description = "You are in a hallway. From here you can go north."
hallway.exits = {"north": "room"}
locations['hallway'] = hallway

var room = new Location()
room.description = "You are in a groovy room. From here you can go south."
room.exits = {"south": "hallway"}
locations['room'] = room

// set up parser and commands
var parser = new Parser()

parser.add_command('quit')
.set('syntax', ['quit', 'exit'])
.set('logic', function(args) {
    process.exit(0)
})

parser.add_command('help')
.set('syntax', ['help'])
.set('logic', function(args) {

  var output = ''

  output += "You can use the following commands:\n"
  output += "  'look' (or 'l') to look around\n"
  output += "  'go <direction>' to walk in a direction\n"
  output += "  'say <something>' to say some things\n"
  output += "  'exit' to quit the game\n"

  return output
})

parser.add_command('nick')
.set('syntax', ['nick <string:username>'])
.set('logic', function(args, env, stream) {

  var output = ''

  env.users[stream.userID].name = args['username']

  output += "You are now known as " + args['username'] + ".\n"

  return output
})

parser.add_command('say')
.set('syntax', ['say <string:message*>'])
.set('logic', function(args, env, stream) {

  var output = "You say your piece.\n"

  var name = env.users[stream.userID].name
  var location = env.users[stream.userID].location

  // broadcast to nearby users
  for (var userID in env.users) {
    var user = env.users[userID]
    if (user.location == location && (userID != stream.userID)) {
      user.messages.push(name + " says '" + args['message*'] + "'.\n")
    }
  }

  return output
})

parser.add_command('look')
.set('syntax', ['l', 'look'])
.set('logic', function(args, env, stream) {

  var output = ''

  var location = env.users[stream.userID].location

  // describe location
  output += env.locations[location].description + "\n"

  // describe nearby users
  for (var userID in env.users) {
    var user = env.users[userID]
    if (user.location == location && (userID != stream.userID)) {
      output += "You see " + user.name + ".\n"
    }
  }

  return output
})

parser.add_validator('direction', function(lexeme) {

  var valid_directions = ['north', 'south', 'east', 'west']

  return {
    'success': (valid_directions.indexOf(lexeme) != -1),
    'message': "That's not a direction I understand.\n"
  }
})

parser.add_command('go')
.set('syntax', ['go <direction:direction>'])
.set('logic', function(args, env, stream) {

  var output = ''
  var direction = args.direction
  var userLocation = env.users[stream.userID].location

  var location = env.locations[userLocation]

  if (location.exits[direction]) {
    output += "You go " + direction + ".\n"
    env.users[stream.userID].location = location.exits[direction]
  }
  else {
    output += "You can't go that way.\n"
  }

  return output
})

parser.setEnv('locations', locations)
parser.setEnv('location', 'hallway')
parser.setEnv('users', {})
parser.setEnv('userNumber', 1)

// begin adventurings!
var welcome = "Welcome to Low Rent MUD!\n\n"
            + "Not much happens here, but the stress level is low.\n"

var shell = new Shell(parser)
.set('welcome', welcome)
.set('connect_logic', function(shell, stream) {

  var guestName = "Guest" + shell.parser.env.userNumber

  // set user properties to default
  shell.parser.env.users[stream.userID] = {
    "name": guestName,
    "location": "hallway",
    "messages": []
  }

  shell.parser.env.userNumber++

  return "You are now known as " + guestName + ".\n"
})
.set('logic', function(shell, stream) {

  var output = ''
    , message
    , messages

  // relay anything sent by other users
  messages = shell.parser.env.users[stream.userID].messages
  for (var index in messages) {
    output += messages.pop()
  }

  return output
})
.startServer()
