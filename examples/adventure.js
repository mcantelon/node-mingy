var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command

// define locations in our special game
var Location = function Location() {}
var locations = {}

var hallway = new Location()
hallway.description = "You are in a hallway. From here you can go north."
hallway.exits = {"north": "room"}
locations['hallway'] = hallway

var room = new Location()
room.description = "You are in a hallway. From here you can go north."
room.exits = {"north": "room"}
locations['room'] = room

// define props in our special game
var Prop = function Prop() {}
var props = []

var rock = new Prop()
rock.description = 'The rock is alright.'
rock.location = 'hallway'
props['rock'] = rock

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
  output += "  'get <object>' to pick up something\n"
  output += "  'drop <object>' to drop something\n"
  output += "  'inventory' (or 'i') to list what you're carrying\n"
  output += "  'exit' to quit the game\n"

  return output
})

parser.add_command('look')
.set('syntax', ['l', 'look'])
.set('logic', function(args, env) {

  var output = ''

  // describe location
  output += env.locations[env.location].description + "\n"

  // describe nearby props
  for (var propName in env.props) {
    var prop = env.props[propName]
    if (prop.location == env.location) {
      output += "You see a " + propName + ".\n"
    }
  }

  return output
})

parser.add_command('go')
.set('syntax', ['go <direction>'])
.set('logic', function(args, env) {

  var output = ''

  var location = env.locations[env.location]

  if (location.exits[args.direction]) {
    output += "You go " + args.direction + ".\n"
    env.location = location.exits[args.direction]
  }
  else {
    output += "You can't go that way.\n"
  }

  return output
})

parser.add_command('get')
.set('syntax', ['get <prop>'])
.set('logic', function(args, env) {

  var output = ''

  if (env.props[args.prop]) {

    if (env.props[args.prop].location == env.location) {
      env.props[args.prop].location = 'player'
      output += "You take the " + args.prop + ".\n"
    }
    else if (env.props[args.prop].location == 'player') {
      output += "You already have it, Einstein.\n"
    }
  }

  // haven't gotten anything, so there's nothing to be got
  if (output == '') {
    output += "I don't see a " + args.prop + ".\n"
  }

  return output
})

parser.add_command('drop')
.set('syntax', ['drop <prop>'])
.set('logic', function(args, env) {

  var output = ''

  if (env.props[args.prop]) {

    if (env.props[args.prop].location == 'player') {
      env.props[args.prop].location = env.location
      output += "You drop the " + args.prop + ".\n"
    }
  }

  // haven't dropped anything, so there's nothing to drop
  if (output == '') {
    output += "You don't have a " + args.prop + ".\n"
  }

  return output
})

parser.add_command('inventory')
.set('syntax', ['i', 'inventory'])
.set('logic', function(args, env) {

  var output = ''

  // list props being carried
  for (var propName in env.props) {
    var prop = env.props[propName]
    if (prop.location == 'player') {
      output += "You have a " + propName + ".\n"
    }
  }

  if (output == '') {
    output += "You're carrying nothing.\n"
  }

  return output
})

parser.setEnv('locations', locations)
parser.setEnv('props', props)
parser.setEnv('location', 'hallway')

// begin adventurings!
console.log("Welcome to Rock Moving Adventure!\n")
console.log("In a world gone mad, one rock is out of place.")
console.log("Enter 'help' for a list of commands.")

parser.shell('>', function(parser) {
  if (parser.env.props.rock.location == 'room') {
    console.log("Congratulationis!!! You set things right and won the game!\n")
    process.exit(0)
  }
})
