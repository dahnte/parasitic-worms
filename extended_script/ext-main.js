"use strict";
class Round {
    constructor() {
        this.state = "new";
		this.lives = 4;
		this.livesAdded = 1;
		this.remainingWorms = 0;
		this.remainingParasites = 0;
		this.parasiticHost = null;
		this.hostLoadout = ['40', '29', '21', '34', '30', '1', '2', '2', '4', '2'];
		this.parasiteLoadout = ['40', '40', '40', '40', '40', '1', '1', '1', '1', '1'];
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
	"Welcome to Parasitic Worms: Extended! For more information visit: https://github.com/dahnte/parasitic-worms",
	"Huddle around the campfire as the parasites seek out their host.",
	"Parasites have begun their infestation. You are now a parasite and must infect the remaining blue worms!",
	"**WARNING** Configure your loadout before spawning! This will be your blue team loadout, avoid the prefix 'P'!",
	"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
];
console.log("Running Server...");
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]); // Add your own player auth here.
var round = new Round();
const room = window.WLInit({
    token: window.WLTOKEN,
    roomName: "Parasitic Worms: Extended!",
    maxPlayers: 12,
    public: true,
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
		room.sendAnnouncement(`${round.parasiticHost.name} has become the parasitic host. The parasitic host is the only parasite that is equipped with ranged attacks!`, undefined, 0xF40000, "bold");
		room.sendAnnouncement("Careful, death of any cause will result in parasitic infection.", undefined, 0xF40000, "normal");
		room.setPlayerWeapons(round.parasiticHost.id, round.hostLoadout);
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
				if (round.livesAdded == 1) {
					room.sendAnnouncement(`The parasites gained ${round.livesAdded} life!`);
				}
				else {
					room.sendAnnouncement(`The parasites gained ${round.livesAdded} lives!`);
				}
				round.lives = round.lives + round.livesAdded;
			}
			if (killed.team == 1) {
				room.createBonus(-2, killed.x, killed.y, null)
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
var modCache = new Map();
async function getModData(modUrl) {    
    let obj = modCache.get(modUrl)
    if (obj) {
      return obj;
    }
    try {
        obj = await (await fetch(modUrl)).arrayBuffer();        
    }catch(e) {
        return null;
    }

    
    modCache.set(modUrl, obj)
    return obj;
}
async function loadMod(modname) {
    const mod = await getModData(modname)
    window.WLROOM.loadMod(mod);
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
			room.sendAnnouncement(messages[3], player.id, 0xFF9900, "bold", 0);
			room.sendAnnouncement(messages[2], player.id, 0x66CCFF, "normal", 0);
			room.sendAnnouncement(messages[4], player.id, 0x66CCFF, "normal", 0);
	}
	else {
		room.sendAnnouncement(messages[0], player.id, 0x66CCFF, "bold", 0);
		room.sendAnnouncement(messages[3], player.id, 0xFF9900, "bold", 0);
		room.sendAnnouncement(messages[1], player.id, 0x66CCFF, "normal", 0);
		room.sendAnnouncement(messages[4], player.id, 0x66CCFF, "normal", 0);
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
room.onPlayerSpawn = (player) => {
	if (round.state == "playing") {
		if (player.id == round.parasiticHost.id) {
			room.setPlayerWeapons(player.id, round.hostLoadout);
		}
		else if ((player.id != round.parasiticHost.id) && (player.team == 1)) {
			room.setPlayerWeapons(player.id, round.parasiteLoadout);
		}
	}
	/*
	if (player.team == 2) {
		let playerWeapons = [];
		for (let weapon of window.WLROOM.getPlayerWeapons(player.id)) {
			if (weapon.id == '40' || weapon.id == '29' || weapon.id == '21' || weapon.id == '34') {
				playerWeapons[weapon.index] = '3';
			}
			else {
				playerWeapons[weapon.index] = weapon.id;
			}
		}
		window.WLROOM.setPlayerWeapons(player.id, playerWeapons);
	}
 */
};
let t = roundLogic();
setInterval(() => t.next(), 100);
room.restartGame();
loadMod('https://dahnte.github.io/liero/Parasitic_Worms.zip');