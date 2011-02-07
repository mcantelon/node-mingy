var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command

// define locations in our special game
var locations = {
  "hallway": {
    "description": "You are in a hallway. From here you can go north.",
    "exits": {"north": "room"}
  },
  "room": {
    "description": "You are in a room. From here you can go south.",
    "exits": {"south": "hallway"}
  }
}

// define props in our special game
var props = {
  "rock": {
    "description": "The rock is alright.",
    "location": "hallway"
  }
}

// define commands
var commands = []

commands.push(command = new Command('quit'))
command.set('syntax', ['quit', 'exit'])
command.set('logic', function(args) {
  process.exit(0)
})

commands.push(command = new Command('quit'))
command.set('syntax', ['help'])
command.set('logic', function(args) {

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

commands.push(command = new Command('look'))
command.set('syntax', ['l', 'look'])
command.set('logic', function(args, env) {

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

commands.push(command = new Command('go'))
command.set('syntax', ['go <direction>'])
command.set('logic', function(args, env) {

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

commands.push(command = new Command('get'))
command.set('syntax', ['get <prop>'])
command.set('logic', function(args, env) {

  var output = ''

  if (env.props[args.prop]) {

    if (env.props[args.prop].location == env.location) {
      env.props[args.prop].location = 'player'
      output += "You take the " + args.prop + ".\n"
    }
    else if (env.props[args.prop].location == 'player') {
      output += "You already have it, Einstein.\n"
    }
    else {
      output += "I don't see a " + args.prop + ".\n"
    }
  }
  else {
    output += "I don't see a " + args.prop + ".\n"
  }

  return output
})

commands.push(command = new Command('get'))
command.set('syntax', ['drop <prop>'])
command.set('logic', function(args, env) {

  var output = ''

  if (env.props[args.prop]) {

    if (env.props[args.prop].location == 'player') {
      env.props[args.prop].location = env.location
      output += "You drop the " + args.prop + ".\n"
    }
    else {
      output += "You don't have a " + args.prop + ".\n"
    }
  }
  else {
    output += "You don't have a " + args.prop + ".\n"
  }

  return output
})

commands.push(command = new Command('inventory'))
command.set('syntax', ['i', 'inventory'])
command.set('logic', function(args, env) {

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

// begin adventurings!
console.log("Welcome to Rock Moving Adventure!\n")
console.log("In a world gone mad, one rock is out of place.")
console.log("Enter 'help' for a list of commands.")

var parser = new Parser(commands)
parser.setEnv('locations', locations)
parser.setEnv('props', props)
parser.setEnv('location', 'hallway')
parser.shell('>', function(parser) {
  if (parser.env.props.rock.location == 'room') {
    console.log("Congratulationis!!! You set things right and won the game!\n")
    process.exit(0)
  }
})
