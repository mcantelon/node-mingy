var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command
  , Shell = mingy.Shell

// define locations in our special game
function Location() {}
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

parser.addCommand('quit')
.set('syntax', ['quit', 'exit'])
.set('logic', function(args, env, system) {
  delete env.users[system.stream.userID]
  delete system.stream.userID
  return "Goodbye!\n"
})

parser.addCommand('help')
.set('syntax', ['help'])
.set('logic', function(args) {

  var output = ''

  output += 'You can use the following commands:\n'+
            '  "look" (or "l") to look around\n'+
            '  "go <direction>" to walk in a direction\n'+
            '  "say <something>" to say some things\n'+
            '  "exit" to quit the game\n'

  return output
})

parser.addCommand('nick')
.set('syntax', ['nick <string:username>'])
.set('logic', function(args, env, system) {

  var output = ''

  env.users[system.stream.userID].name = args['username']

  output += "You are now known as " + args['username'] + ".\n"

  return output
})

parser.addCommand('say')
.set('syntax', ['say <string:message*>'])
.set('logic', function(args, env, system) {

  var output = "You say your piece.\n"

  var name = env.users[system.stream.userID].name
  var location = env.users[system.stream.userID].location

  // broadcast to nearby users
  for (var userID in env.users) {
    var user = env.users[userID]
    if (user.location == location && (userID != system.stream.userID)) {
      user.messages.push(name + " says '" + args['message*'] + "'.\n")
    }
  }

  return output
})

parser.addCommand('look')
.set('syntax', ['l', 'look'])
.set('logic', function(args, env, system) {

  var output = ''

  var location = env.users[system.stream.userID].location

  // describe location
  output += env.locations[location].description + "\n"

  // describe nearby users
  for (var userID in env.users) {
    var user = env.users[userID]
    if (user.location == location && (userID != system.stream.userID)) {
      output += "You see " + user.name + ".\n"
    }
  }

  return output
})

parser.addValidator('direction', function(lexeme) {

  var validDirections = ['north', 'south', 'east', 'west']

  return {
    'success': (validDirections.indexOf(lexeme) != -1),
    'message': "That's not a direction I understand.\n"
  }
})

parser.addCommand('go')
.set('syntax', ['go <direction:direction>'])
.set('logic', function(args, env, system) {

  var output = ''
  var direction = args.direction
  var userLocation = env.users[system.stream.userID].location

  var location = env.locations[userLocation]

  if (location.exits[direction]) {
    output += "You go " + direction + ".\n"
    env.users[system.stream.userID].location = location.exits[direction]
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
var welcome = 'Welcome to Low Rent MUD!\n\n'+
              'Not much happens here, but the stress level is low.\n'

var shell = new Shell(parser)
.set('port', 8888)
.set('welcome', welcome)
.set('connectLogic', function(shell, system) {

  var guestName = "Guest" + shell.parser.env.userNumber

  // set user properties to default
  shell.parser.env.users[system.stream.userID] = {
    "name": guestName,
    "location": "hallway",
    "messages": []
  }

  shell.parser.env.userNumber++

  return "You are now known as " + guestName + ".\n"
})
.set('logic', function(shell, system) {

  var output = ''
    , message
    , messages

  if (shell.parser.env.users[system.stream.userID]) {
    // relay anything sent by other users
    messages = shell.parser.env.users[system.stream.userID].messages
    for (var index in messages) {
      output += messages.pop()
    }
  }

  return output
})
.startServer()
