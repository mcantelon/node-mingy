var mingy = require('../lib/mingy')
  , Parser = mingy.Parser
  , Command = mingy.Command

var parser = new Parser()

parser.addCommand('add')
.set('syntax', ['test'])
.set('logic', function(args, env, system) {

  setTimeout(function() {
    system.callback('Time has passed.');
  }, 1000);
})

parser.parse('test', function(message) {
  console.log(message);
});
