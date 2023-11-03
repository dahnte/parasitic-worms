# Parasitic Worms
An *infection mode* roomscript for [WebLiero](https://www.webliero.com/).

## Gameplay
Once there are enough players in the room a random player is selected as the *parasitic host (as of right now, the parasitic worm has now special abilities)*.
Soon after the *parasitic host* is put on the green team and the remaining players, *worms*, are put on the blue team.
At the start of the round, the parasites (green team) start with a collective amount of lives (default is 4).

Once a worm (blue team) dies, either by the parasites or friendly fire, they become infected. Which means they join the parasites.
If a parasite (green team) dies they remain on the same team, however, for each death 1 life is removed from their collective lives.

The worms (blue team) win by bringing down the parasites collective lives down to 0.
The parasites (green team) win by infecting all the worms. Keep in mind, each infection adds to the collective lives (default lives multiplier is 2).

## How to run
For the most basic setup, run this script in console at [Webliero Headless](https://www.webliero.com/headless).

## Bugs & Planned features
No known bugs at the moment.

Eventually a sounds/sprites/mod made for the script would be great, for now this is all up to your preferences.

## Credits
Thank you dsds for all your guidance and Basro for your [tournament script](https://gitlab.com/webliero/tournament-room), it was a great starting point!