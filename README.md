    ,---.    ,---..-./`) ,---.   .--.  .-_'''-.      ____     __  
    |    \  /    |\ .-.')|    \  |  | '_( )_   \     \   \   /  / 
    |  ,  \/  ,  |/ `-' \|  ,  \ |  ||(_ o _)|  '     \  _. /  '  
    |  |\_   /|  | `-'`"`|  |\_ \|  |. (_,_)/___|      _( )_ .'   
    |  _( )_/ |  | .---. |  _( )_\  ||  |  .-----. ___(_ o _)'    
    | (_ o _) |  | |   | | (_ o _)  |'  \  '-   .'|   |(_,_)'     
    |  (_,_)  |  | |   | |  (_,_)\  | \  `-'`   | |   `-'  /      
    |  |      |  | |   | |  |    |  |  \        /  \      /       
    '--'      '--' '---' '--'    '--'   `'-...-'    `-..-'     

Mingy is a cheap and cheerful command parser/server for node.js CLI tools,
adventure games, MUDs, and other such endeavors.

For CLI tools, Mingy works well with
[node-optimist](https://github.com/substack/node-optimist) (available as
"optimist" via npm). For interactive uses, Mingy includes a shell handler that
lets you quickly use your commands interactively. A Mingy shell can work
locally via the command line or remotely as a server.

Mingy includes a number of simple demos, in the "examples" directory, that can
give you a quick idea how things work. Examples include a CLI calculator, a
file navigation shell, a tiny text adventure game, and the foundation of a MUD.

In you use npm, simply `npm install mingy` to install.

## Commands

In order to reap the "magic" of mingy you define a number of commands, each of
which has one or more syntax forms.

Syntax forms are strings that define command usage. The syntax form `look`
would mean the parser input `look` would trigger the command. The syntax
`look <prop>` would mean the parser input `look mailbox` or `look demon` would
both trigger the command (with the command's "prop" argument being set,
respectively, to `mailbox` and `demon`).

Application state is stored by the parser in the env property and is relayed to
commands when executed.

An example command for a text adventure game:

    parser.addCommand('go')
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

    parser.addValidator('validDirection', function(lexeme) {

      var validDirections = ['north', 'south', 'east', 'west']

      return {
        'success': (validDirections.indexOf(lexeme) != -1),
        'message': "That's not a direction I understand.\n"
      }
    })

To have a validator apply to a command argument the command's syntax form(s)
must prefix the name of an argument with the name of a handler and a colon.
For example, to enable the above validator on the above command one would
make the following change to the command:

    parser.addCommand('go')
    .set('syntax', ['go <validDirection:direction>'])

Validation by type is simpler. One just needs to prefix the name of an
argument with the name of the type and a colon. For example:

    parser.addCommand('go')
    .set('syntax', ['go <string:direction>'])

## Parsing

To parse command input, either the `Parser.parse` or `Parser.parseLexemes`
methods are used. A response string is returned by the method (or, if
the parse was unsuccessful, `undefined`).

Here's an example of parsing a string of text input using `Parser.parse`:

    parser.parse('go north')

Here's an example of using `Parser.parseLexemes` to parse an array of
unhyphenated options returned from node-optimist:

    parser.parseLexemes(argv['_'])

If your commands contain asynchronous logic and you'd like command output to
be handled by a callback, you can supply one in the second argument to either
`Parser.parse` or `Parser.parseLexemes`. Below is an example:

    parser.parse('go north', function(output) {
      console.log(output)
    })

To set an environmental variable use the `Parser.setEnv` method:

    parser.setEnv('skyIs', 'blue')

## Concatenation

Normally an argument takes a single lexeme. If one wants to have an argument
contain a concatenation of all subsequent lexemes adding a `*` after the
argument name will enable this.

Note that these arguments only work when they are the last argument in a
syntax form.

Below is an example:

    parser.addCommand('say')
    .set('syntax', ['say <string:message*>'])
    .set('logic', function(args, env, stream) {

      return "You say '" + args['message*'] + "'.\n"
    })

## Interaction via Shell

Setting up an interactive shell is easy. Below is an example of setting
up a shell with a couple of useless commands.

    var welcome = "Welcome to The Shell of Futility. You can brood and shout.\n"

    var parser = new Parser()

    parser.addCommand('brood')
    .set('syntax', ['brood'])
    .set('logic', function(args) {
      return "You stare, angrily, at the floor.\n"
    })

    parser.addCommand('shout')
    .set('syntax', ['shout'])
    .set('logic', function(args) {
      return "You shout in definance and rage.\n"
    })

    var shell = new Shell(parser)
    .set('welcome', welcome)
    .set('prompt', '$ ')
    .start()

## Interaction via Shell Server

A shell server may be used to provide remote interactivity. The above example
can function as a server simply by changing the last line to the following:

    .startServer()

The shell is now accessible via telnet:

    telnet localhost 8000

## Dealing with Multiple Users

For multi-user shells, you may wish to use the third optional parameter that
is sent to command logic. This parameter provides access to context-specific
data and functions. When using the shell server a property of this parameter
is the node.js stream object representing the connection of the user to your
server. The shell server adds a `userID` property to the stream. This property
can be used to differentiate between users. Please see `examples/mud.js` for
an example of this.

## Connect Middleware

NOTE: Temporarily disabled as Connect not yet working with Node v0.5.0+.

Mingy includes some experimental web functionality. Using the included
[Connect](https://github.com/senchalabs/connect) middleware module,
Mingy can act as a request router. Please see `examples/web.js` for an example
of this.

## Initialization

To get easy access to Mingy's parser, command, and shell classes, include
the folowing code:

    var mingy = require('/path/to/mingy')
      , Parser = mingy.Parser
      , Command = mingy.Command
      , Shell = mingy.Shell

If you'd like to quickly specify and initialize a number of commands, you
can create a hash of them and provide this hash to the parser when
initializing. For example:

    var commands = {
      "look": {
        "syntax": ["look"],
        "logic": function(args) {
          return "You look around."
        }
      }
    }

    var parser = new Parser(commands)

See the [node-deja](https://github.com/mcantelon/node-deja/blob/master/deja.js)
module for a more substantial example of this.

## Testing

Testing requires the [expresso](ihttps://github.com/visionmedia/expresso)
and [should.js](https://github.com/visionmedia/should.js) modules (available
via rpm as "expresso" and "should" respectively).

Run the tests by entering:

    expresso

Last tested with node v0.4.0 and v0.3.8.
