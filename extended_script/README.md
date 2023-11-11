## Gameplay
### Round start
When the room reaches >2 players all the worms are moved to the blue team. Then the parasitic host is randomly chosen from the blue team and moved to the green team. The parasites (green team) start with the default amount of 4 collective lives. The parasitic host is the only parasite equipped with ranged weapons, the other parasites can only use `P BITE`.

### Mid round
When a worm (blue team) dies they become infected and join the parasites. Worm infection also results in the parasites gaining the default amount of +1  to their collective lives. When a parasite dies -1  is removed from their collective lives and they drop a health kit.

### Win conditions
The worms win by bringing down the parasites collective lives down to 0. The parasites win by infecting all the worms.

### Additional
When a parasitic host leaves mid-round, a new host will be chosen. If there are existing parasites then the host is randomly chosen from the parasites. If there are no existing parasites then the host is randomly chosen from the worms. 

## Setup
For the most basic setup, redirect `/v/20/headless-min.js` to `https://sylvodsds.gitlab.io/webliero-extended-scripts/headless-extended.js` in headless to host an Extended room.
After you do this run this script in console at [Webliero Headless](https://www.webliero.com/headless).

More information on extended [here](https://www.vgm-quiz.com/dev/webliero/extended).

## Technical
*Currently the only way to change the script's parameters is through console or altering the script before running*


The `Round()` constructor allows for easy changes to the script's behavior:
- `round.lives` - Controls the starting amount of collective lives that parasites start with (default is 4)
- `round.livesMultiplier` - Controls how many lives are added when there is an infection (default is 1)
- `round.parasiticHost` - Holds player information about the parasitic host
- `round.remainingWorms` - Holds amount of blue members left
- `round.remainingParasites` - Holds amount of green members left
- `round.endFlag` - 1 = round end, 0 = round alive
- `round.playerListId` - Holds an array of all current players ID
- `round.hostLoadout` - Holds an array of the parasitic host's default loadout
- `round.parasiteLoadout` - Holds an array of a parasite's default loadout 

## Bugs
- If the room reaches < 3 players mid round the game continues as usual, however it corrects itself once there are > 3 players.
- Room skips maps sometimes

## Planned features
- Sprite/sounds/mod pack
- In-game commands to change game parameters and spectate.
- Possible scaling as to how many *parasitic hosts* are chosen depending on room size.

## Credits
Thank you dsds for all your guidance and Basro for your [tournament script](https://gitlab.com/webliero/tournament-room), it was a great starting point!
