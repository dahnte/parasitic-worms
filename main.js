"use strict";
class Round {
    constructor() {
        this.state = "new";
		this.lives = 4;
		this.livesMultiplier = 1;
		this.remainingWorms = 0;
		this.remainingParasites = 0;
		this.parasiticHost = null;
		this.endFlag = 0;
		this.playerListId = [];
    }
    start() {
        if (room.getPlayerList().length < 3) {
            throw new Error("Need at least three players to start!");
        }
        this.state = "playing";
    }
}
const messages = [
	"Welcome to Night of the Parasitic Worms! For more information visit: https://github.com/dahnte/parasitic-worms",
	"Huddle around the campfire as the parasites seek out their host.",
	"Parasites have begun their infestation. You are now a parasite and must infect the remaining blue worms!",
	"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
];
console.log("Running Server...");
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]); // Add your own player auth here.
var round = new Round();
const room = window.WLInit({
    token: window.WLTOKEN,
    roomName: "Night of the Parasitic Worms!",
    maxPlayers: 12,
    public: false,
});
window.WLROOM = room;
room.setSettings({
    gameMode: "tdm",
    teamsLocked: true,
    damageMultiplier: 1,
	levelPool: "allBest",
});

function moveAllPlayersToBlue() {
    for (let player of room.getPlayerList()) {
        room.setPlayerTeam(player.id, 2);
    }
}
function selectParasiticHost(selectedTeam) {
	round.playerListId = [];
	let index = 0;
	for (let player of room.getPlayerList()) {
		if (player.team == selectedTeam) {
			round.playerListId[index] = player.id;
			index++;
		}
	}
	let randomIndex = Math.floor(Math.random() * round.playerListId.length);
	round.parasiticHost = room.getPlayer(round.playerListId[randomIndex]);
	if (round.parasiticHost != null) {
		room.setPlayerTeam(round.parasiticHost.id, 1);
		room.sendAnnouncement(`${round.parasiticHost.name} has become the parasitic host!`, undefined, 0xF40000, "bold");
		room.sendAnnouncement("Careful, death of any cause will result in parasitic infection.", undefined, 0xF40000, "normal");
	}
	else {
		round.parasiticHost = null;
	}
}
function getRemainingBlue() {
	let remainingBlue = 0;
	for (let player of room.getPlayerList()) {
		if (player.team == 2) {
			remainingBlue++;
		}
	}
	round.remainingWorms = remainingBlue;
}
function getRemainingGreen() {
	let remainingGreen = 0;
	for (let player of room.getPlayerList()) { 
		if (player.team == 1) {
			remainingGreen++;
		}
	}
	round.remainingParasites = remainingGreen;
}
function* waitForSeconds(seconds) {
    const end = window.performance.now() + seconds * 1000;
    while (window.performance.now() < end) {
        yield null;
    }
}
function* roundLogic() {
    round = new Round();
	while (round.state == "new") {
		//TODO: allow for players to DM before round start
		yield* waitForSeconds(8);
		if (room.getPlayerList().length < 3) {
			room.sendAnnouncement("Need at least three players to start!");
		}
		else {
			round.start();	
		}
	}
	moveAllPlayersToBlue();
	yield* waitForSeconds(2);
	selectParasiticHost(2);
    while (round.state == "playing") {
        yield null;
		room.onPlayerKilled = (killed, killer) => {
			if (killed.team == 2) {
				room.setPlayerTeam(killed.id, 1);
				room.sendAnnouncement(`${killed.name} has been infected!`, undefined, 0xF40000, "normal");
				if (round.livesMultiplier == 1) {
					room.sendAnnouncement(`The parasites gained ${round.livesMultiplier} life!`);
				}
				else {
					room.sendAnnouncement(`The parasites gained ${round.livesMultiplier} lives!`);
				}
				round.lives = round.lives + round.livesMultiplier;
			}
			if (killed.team == 1) {
				round.lives--;
				if (round.lives == 1) {
					room.sendAnnouncement(`The parasites have ${round.lives} life remaining!`);
				}
				else {
					room.sendAnnouncement(`The parasites have ${round.lives} lives remaining!`);
				}
			}
		};
		getRemainingGreen();
		if (round.lives <= 0) {
			room.sendAnnouncement("The worms have survived the parasitic onslaught!", undefined, 0x66CCFF, "bold");
			round.endFlag = 1;
			break;
		}
		getRemainingBlue();
		if (round.remainingWorms <= 0) {
			room.sendAnnouncement("The parasites have successfully taken over the room!", undefined, 0xF40000, "bold");
			round.endFlag = 1;
			break;
		}
	}
	if ((round.endFlag == 1) || (room.getPlayerList().length < 3)) {
		room.endGame();
		t = roundLogic();
	}
}

room.onRoomLink = (link) => console.log(link);
room.onCaptcha = () => console.log("Invalid token");
room.onPlayerJoin = (player) => {
	if (admins.has(player.auth)) {
	     room.setPlayerAdmin(player.id, true);
	}
	if (round.state == "playing") {
			room.setPlayerTeam(player.id, 1);
			room.sendAnnouncement(messages[0], player.id, 0x66CCFF, "bold", 0);
			room.sendAnnouncement(messages[2], player.id, 0x66CCFF, "normal", 0);
			room.sendAnnouncement(messages[3], player.id, 0x66CCFF, "normal", 0);
	}
	else {
		room.sendAnnouncement(messages[0], player.id, 0x66CCFF, "bold", 0);
		room.sendAnnouncement(messages[1], player.id, 0x66CCFF, "normal", 0);
		room.sendAnnouncement(messages[3], player.id, 0x66CCFF, "normal", 0);
	}
};
room.onPlayerLeave = (player) => {
	if (round.state == "playing") {
		if (player.id == round.parasiticHost.id) {
			getRemainingGreen();
			if (round.remainingParasites > 0) {
				selectParasiticHost(1);
			}
			else {
				selectParasiticHost(2);
			}
		}
	}
};

let t = roundLogic();
setInterval(() => t.next(), 100);
room.restartGame();