    ,---.    ,---..-./`) ,---.   .--.  .-_'''-.      ____     __  
    |    \  /    |\ .-.')|    \  |  | '_( )_   \     \   \   /  / 
    |  ,  \/  ,  |/ `-' \|  ,  \ |  ||(_ o _)|  '     \  _. /  '  
    |  |\_   /|  | `-'`"`|  |\_ \|  |. (_,_)/___|      _( )_ .'   
    |  _( )_/ |  | .---. |  _( )_\  ||  |  .-----. ___(_ o _)'    
    | (_ o _) |  | |   | | (_ o _)  |'  \  '-   .'|   |(_,_)'     
    |  (_,_)  |  | |   | |  (_,_)\  | \  `-'`   | |   `-'  /      
    |  |      |  | |   | |  |    |  |  \        /  \      /       
    '--'      '--' '---' '--'    '--'   `'-...-'    `-..-'     

Mingy is a cheap and cheerful command parser for node.js CLI tools, adventure
games, and other such endeavors.

For CLI tools, Mingy works well with node-optimist (available as "optimist"
via npm). For interactive uses, Mingy includes a shell handler that lets you
quickly use your commands interactively. A Mingy shell can work locally via
the command line or remotely via telnet.

Mingy includes a number of simple demos, in the "examples" directory, that can
give you a quick idea how things work. Examples include a CLI calculator, a
file navigation shell, a tiny text adventure game, and the foundation of a MUD.

## Commands

In order to reap the "magic" of mingy you define a number of commands, each of
which has one or more syntax forms.

Syntax forms are strings that define command usage. The syntax form `look`
would mean the parser input `look` would trigger the command. The syntax
`look <prop>` would mean the parser input `look mailbox` or `look demon` would
both trigger the command (with the command's "prop" argument being set,
respectively, to `mailbox` and `demon`).

An example command for a text adventure game:

    parser.add_command('go')
    .set('syntax', ['go <direction>'])
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

## Validators

Arguments can either be unvalidated, validated by type, or validated by
handlers. Handlers check an argument, returning success or failure and, in
the event of failure, an optional error message.

An example that could be used to validate direction arguments for the text
adventure game example above:

    parser.add_validator('valid_direction', function(lexeme) {

      var valid_directions = ['north', 'south', 'east', 'west']

      return {
        'success': (valid_directions.indexOf(lexeme) != -1),
        'message': "That's not a direction I understand.\n"
      }
    })

To have a validator apply to a command argument the command's syntax form(s)
must prefix the name of an argument with the name of a handler and a colon.
For example, to enable the above validator on the above command one would
make the following change to the command:

    parser.add_command('go')
    .set('syntax', ['go <valid_direction:direction>'])

Validation by type is simpler. One just needs to prefix the name of an
argument with the name of the type and a colon. For example:

    parser.add_command('go')
    .set('syntax', ['go <string:direction>'])

## Parsing

To parse command input, either the `parse.parse` or `parse.parseLexemes`
methods are used.

Here's an example of parsing a string of text input using `parse.parse`:

    parser.parse('go north')

Here's an example of using `parseLexemes` to parse an array of unhyphenated
options returned from node-optimist:

    parser.parseLexemes(argv['_'])

## More soon...

Expect more documentation and publishing to the npm repository.
