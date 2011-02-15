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

// define props in our special game
function Prop() {}
var props = []

var rock = new Prop()
rock.description = 'The rock is alright.'
rock.location = 'hallway'
props['rock'] = rock

// set up parser and commands
var parser = new Parser()

// prop validator restricts lexeme to props in current location
parser.addValidator('propPresent', function(lexeme, env) {

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
parser.addValidator('propHeld', function(lexeme, env) {

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

parser.addCommand('quit')
.set('syntax', ['quit', 'exit'])
.set('logic', function(args) {
    process.exit(0)
})

parser.addCommand('help')
.set('syntax', ['help'])
.set('logic', function(args) {

  var output = ''

  output += 'You can use the following commands:\n'+
            '  "look" (or "l") to look around\n'+
            '  "go <direction>" to walk in a direction\n'+
            '  "get <object>" to pick up something\n'+
            '  "drop <object>" to drop something\n'+
            '  "inventory" (or "i") to list what you\'re carrying\n'+
            '  "exit" to quit the game\n'

  return output
})

parser.addCommand('look')
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

parser.addValidator('direction', function(lexeme) {

  var validDirections = ['north', 'south', 'east', 'west']

  return {
    'success': (validDirections.indexOf(lexeme) != -1),
    'message': "That's not a direction I understand.\n"
  }
})

parser.addCommand('go')
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

parser.addCommand('get')
.set('syntax', ['get <propPresent>'])
.set('logic', function(args, env) {

  var output = ''
  var prop = args['propPresent']

  env.props[prop].location = 'player'
  output += "You take the " + prop + ".\n"

  return output
})

parser.addCommand('drop')
.set('syntax', ['drop <propHeld>'])
.set('logic', function(args, env) {

  var output = ''
  var prop = args.propHeld

  env.props[prop].location = env.location
  output += "You drop the " + prop + ".\n"

  return output
})

parser.addCommand('inventory')
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
parser.setEnv('propsStartingCondition', parser.clone(props))
parser.setEnv('location', 'hallway')

// begin adventurings!
var welcome = 'Welcome to Rock Moving Adventure!\n\n'+
              'In a world gone mad, one rock is out of place.\n'+
              'Enter "help" for a list of commands.\n'

var shell = new Shell(parser)
.set('welcome', welcome)
.set('logic', function(shell) {

  var output = ''

  // if player wins, allow her to restart game
  if (
    shell.parser.env.props.rock.location == 'room'
    && shell.mode != 'waitForRestart'
  ) {
    output += "Congratulations!!! You're set things right and won the game!\n\n"
    output += "Do you want to restart? ('yes' or 'no')\n"
    shell.mode = 'waitForRestart'
  }

  return output
})
.setMode('waitForRestart', function(shell, data) {

  data = shell.parser.cleanInput(data)

  var output = ''

  if (data == "yes") {

    output += "Restarting...\n\n"

    // reset props and player location to initial state
    shell.parser.env.props = shell.parser.clone(shell.parser.env.propsStartingCondition)
    shell.parser.env.location = 'hallway'

    output += shell.parser.commands['look'].logic({}, shell.parser.env)

    shell.mode = "default"
  }
  else if (data == "no") {
    output += "Thanks for playing.\n"
    process.exit()
  }
  else {
    output += "Please enter 'yes' or 'no.\n"
  }

  return output
})
.start()
