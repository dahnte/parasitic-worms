# Parasitic Worms
An *infection mode* room script for [WebLiero](https://www.webliero.com/).

## Gameplay
Once there are enough players in the room a random player is selected as the *parasitic host (as of right now, the parasitic worm has no special abilities)*.
Soon after the *parasitic host* is put on the green team and the remaining players are put on the blue team.

At the start of the round, the parasites (green team) start with a collective amount of lives (default is 4).

Once a worm (blue team) dies, either by the parasites or friendly fire, they become infected. Which means they join the parasites.
If a parasite (green team) dies they remain on the same team, however, for each death 1 life is removed from their collective lives.

The blue team wins by bringing down the parasites collective lives down to 0.
The green team wins by infecting all the worms. Keep in mind, each infection adds to the collective lives (default lives multiplier is 1).

When a parasitic host leaves mid-round, a new host will be chosen.
If there are existing green team members then the host is randomly chosen from the green team only. If there are no existing green team members then the host is randomly chosen from the blue team.

## Setup
For the most basic setup, run this script in console at [Webliero Headless](https://www.webliero.com/headless).

## Technical
*Currently the only way to change the script's parameters is through console or altering the script before running*


The Round() constructor allows for easy changes to the script's behavior:
- round.lives - Controls the starting amount of collective lives that parasites start with (default is 4)
- round.livesMultiplier - Controls how many lives are added when there is an infection (default is 1)
- round.parasiticHost - Holds player information about the parasitic host
- round.remainingWorms - Holds amount of blue members left
- round.remainingParasites - Holds amount of green members left
- round.endFlag - 1 = round end, 0 = round alive
- round.playerListId - Holds a list of all current players' ID

## Bugs
- If the room reaches < 3 players mid round the game continues as usual, however it corrects itself once there are > 3 players.
- Room skips maps sometimes

## Planned features
- Sprite/sounds/mod pack
- In-game commands to change game parameters and spectate.
- Limit arsenal of the green team.
- Possible scaling as to how many *parasitic hosts* are chosen depending on room size.

## Credits
Thank you dsds for all your guidance and Basro for your [tournament script](https://gitlab.com/webliero/tournament-room), it was a great starting point!
