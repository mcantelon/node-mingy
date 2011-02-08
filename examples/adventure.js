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
room.description = "You are in a groovy room. From here you can go south."
room.exits = {"south": "hallway"}
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

// prop validator restricts lexeme to props in current location
parser.add_validator('prop_present', function(lexeme, env) {

  // make sure prop exists
  var success = (env.props[lexeme]) ? true : false

  // make sure prop is in current location
  if (success && (env.props[lexeme].location != env.location)) {
    success = false
  }

  return {
    'success': success,
    'message': "I don't see that.\n"
  }
})

// prop validator restricts lexeme to props in current location
parser.add_validator('prop_held', function(lexeme, env) {

  // make sure prop exists
  var success = (env.props[lexeme]) ? true : false

  // make sure prop is in player's inventory
  if (success && (env.props[lexeme].location != 'player')) {
    success = false
  }

  return {
    'success': success,
    'message': "I don't have that.\n"
  }
})

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

parser.add_validator('direction', function(lexeme) {

  var valid_directions = ['north', 'south', 'east', 'west']

  return {
    'success': (valid_directions.indexOf(lexeme) != -1),
    'message': "That's not a direction I understand.\n"
  }
})

parser.add_command('go')
.set('syntax', ['go <direction:direction>'])
.set('logic', function(args, env) {

  var output = ''
  var direction = args.direction

  var location = env.locations[env.location]

  if (location.exits[direction]) {
    output += "You go " + direction + ".\n"
    env.location = location.exits[direction]
  }
  else {
    output += "You can't go that way.\n"
  }

  return output
})

parser.add_command('get')
.set('syntax', ['get <prop_present>'])
.set('logic', function(args, env) {

  var output = ''
  var prop = args['prop_present']

  env.props[prop].location = 'player'
  output += "You take the " + prop + ".\n"

  return output
})

parser.add_command('drop')
.set('syntax', ['drop <prop_held>'])
.set('logic', function(args, env) {

  var output = ''
  var prop = args.prop_held

  env.props[prop].location = env.location
  output += "You drop the " + prop + ".\n"

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
