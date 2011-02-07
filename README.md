    ,---.    ,---..-./`) ,---.   .--.  .-_'''-.      ____     __  
    |    \  /    |\ .-.')|    \  |  | '_( )_   \     \   \   /  / 
    |  ,  \/  ,  |/ `-' \|  ,  \ |  ||(_ o _)|  '     \  _. /  '  
    |  |\_   /|  | `-'`"`|  |\_ \|  |. (_,_)/___|      _( )_ .'   
    |  _( )_/ |  | .---. |  _( )_\  ||  |  .-----. ___(_ o _)'    
    | (_ o _) |  | |   | | (_ o _)  |'  \  '-   .'|   |(_,_)'     
    |  (_,_)  |  | |   | |  (_,_)\  | \  `-'`   | |   `-'  /      
    |  |      |  | |   | |  |    |  |  \        /  \      /       
    '--'      '--' '---' '--'    '--'   `'-...-'    `-..-'     

mingy is a cheap parser for node.js CLI tools, adventure games, and other such
endeavors.

In order to reap the "magic" of mingy you define a number of commands, each of
which has one or more syntax forms.

Syntax forms are strings that define command usage. The syntax form `look`
would mean the parser input `look` would trigger the command. The syntax
`look <prop>` would mean the parser input `look mailbox` or `look demon` would
both trigger the command (with the command's "prop" argument being set,
respectively, to `mailbox` and `demon`).

I'll be fleshing this documentation out soon, but in the meantime check out
the samples in the examples directory.

This module isn't yet published to npm, so you'll have to get it from here
in the meantime.
