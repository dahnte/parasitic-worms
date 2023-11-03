"use strict";
class Round {
    constructor() {
        this.state = "new";
		this.lives = 4;
		this.livesMultiplier = 2;
		this.remainingWorms = 0;
		this.endFlag = 0;
    }
    start() {
        if (room.getPlayerList().length < 3) {
            throw new Error("Need at least three players to start!");
        }
        this.state = "playing";
    }
}
const messages = [
	"Welcome to Night of the Parasitic Worms!",
	"Huddle around the campfire as the parasites seek out their host.",
	"Parasites have begun their infestation. You are now a parasite and must infect the remaining blue worms!",
];
console.log("Running Server...");
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]); // Add your own player auth here.
let round = new Round();
const room = window.WLInit({
    token: window.WLTOKEN,
    roomName: "Night of the Parasitic Worms",
    maxPlayers: 30,
    public: false,
});
window.WLROOM = room;
room.setSettings({
    gameMode: "tdm",
    teamsLocked: true,
    damageMultiplier: 1,
	levelPool: "allBest",
});

function moveAllPlayersToNematode() {
    for (let player of room.getPlayerList()) {
        room.setPlayerTeam(player.id, 2);
    }
}
function selectParasiteHost() {
	let listLength = room.getPlayerList().length;
    let playerIndex = Math.floor(Math.random() * listLength) + 1;
	let hostParasite = room.getPlayer(playerIndex);
    room.setPlayerTeam(hostParasite.id, 1);
	room.sendAnnouncement(`${hostParasite.name} has become a host for parasites! Dont let them kill you..`, undefined, 0xF40000, "bold");
}
function getRemainingSurvivorAmount() {
	let remainingSurvivor = room.getPlayerList().length;
	for (let player of room.getPlayerList()) {
		if (player.team == 1) {
			remainingSurvivor--;
		}
	}
	round.remainingWorms = remainingSurvivor;
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
		yield* waitForSeconds(3);
		if (room.getPlayerList().length < 3) {
			room.sendAnnouncement("Need at least three players to start!");
		}
		else {
			round.start();	
		}
	}
	moveAllPlayersToNematode();
	selectParasiteHost();
    while (round.state == "playing") {
        yield null;
		room.onPlayerJoin = (player) => {
			room.setPlayerTeam(player.id, 1);
			room.sendAnnouncement(messages[0], player.id, 0x66CCFF, "bold", 0);
			room.sendAnnouncement(messages[2], player.id, 0xF40000, "bold", 0);
		}
		room.onPlayerKilled = (killed, killer) => {
			if (killed.team == 2) {
				room.setPlayerTeam(killed.id, 1);
				room.sendAnnouncement(`${killed.name} has been infected!`, undefined, 0xF40000, "bold");
				room.sendAnnouncement(`The parasites gained ${round.livesMultiplier} lives!`);
				round.lives = round.lives + round.livesMultiplier;
				round.remainingWorms--;
			}
			else if (killed.team == 1) {
				round.lives--;
				room.sendAnnouncement(`The parasites have ${round.lives} lives remaining!`);
			}
		}
		if (round.lives <= 0) {
			room.sendAnnouncement("The worms have survived the parasitic onslaught!", undefined, 0x66CCFF, "bold");
			round.endFlag = 1;
			break;
		}
		getRemainingSurvivorAmount();
		if (round.remainingWorms <= 0) {
			room.sendAnnouncement("The parasites have taken over the worms!", undefined, 0xF40000, "bold");
			round.endFlag = 1;
			break;
		}
	}
	if (round.endFlag == 1) {
		room.endGame();
		t = roundLogic();
	}
}

room.onRoomLink = (link) => console.log(link);
room.onCaptcha = () => console.log("Invalid token");
room.onPlayerJoin = (player) => {
	room.sendAnnouncement(messages[0], player.id, 0x66CCFF, "bold", 0);
	room.sendAnnouncement(messages[1], player.id, 0x66CCFF, "bold", 0);
    for (let player of room.getPlayerList()) {
        if (admins.has(player.auth)) {
	        room.setPlayerAdmin(player.id, true);
		}
    }
};

let t = roundLogic();
setInterval(() => t.next(), 100);
room.restartGame();