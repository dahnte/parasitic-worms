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
		this.playerList = new Map();
		this.endFlag = 0;
    }
    start() {
        if ((room.getPlayerList().length - specList.size) < 2) {
            throw new Error("Need at least two players to start!");
        }
        this.state = "playing";
    }
}
var specList = new Map(); // potentially dangerous!
var round = new Round();
var modCache = new Map();
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]); // Add your own player auth here.
const messages = [
	"Welcome to Parasitic Worms! ☣Extended☣. Type !h for a list of chat commands. For more information visit: https://github.com/dahnte/parasitic-worms",
	"Huddle around the campfire as the parasites seek out their host.",
	"Parasites have begun their infestation. You are now a parasite and must infect the remaining blue worms!",
	"⚠️WARNING⚠️ Configure your loadout before spawning! This will be your blue team loadout, avoid the prefix 'P'!",
	"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
];
console.log("Running Server...");

const chatCommands = {
	s: function (player) {
		if (!specList.has(player.id)) {
			specList.set(player.id, player);
		}
		else {
			throw new Error("You're already spectating!");
		}
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
		room.setPlayerTeam(player.id, 0);
	},
	j: function (player) {
		if(specList.has(player.id)) {
			specList.delete(player.id);
		}
		else {
			throw new Error("You're already playing!");
		}
		if(round.state == "playing") {
			room.setPlayerTeam(player.id, 1);
		}
		else {
			throw new Error("Waiting for round to start");
		}
	},
	h: function (player) {
		room.sendAnnouncement("Chat commands:", player.id, 0xFFFFFF, "normal", 0);
		room.sendAnnouncement("!s - To join the spectator team", player.id, 0xFFFFFF, "normal", 0);
		room.sendAnnouncement("!j - To rejoin the game from the spectator team", player.id, 0xFFFFFF, "normal", 0);
		room.sendAnnouncement("!h - To list these commands again", player.id, 0xFFFFFF, "normal", 0);
	}
};
const room = window.WLInit({
    token: window.WLTOKEN,
    roomName: "Parasitic Worms! ☣Extended☣",
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
		if (!specList.has(player.id)) {
			room.setPlayerTeam(player.id, 2);
		}
    }
}

function selectParasiticHost(selectedTeam) {
	round.playerList.clear();
	var playerIndex = 0;
	for (let player of room.getPlayerList()) {
		if (player.team == selectedTeam) {
			round.playerList.set(playerIndex, player);
			playerIndex++;
		}
	}
	let randomIndex = Math.floor(Math.random() * round.playerList.size);
	round.parasiticHost = round.playerList.get(randomIndex);
	if (round.parasiticHost != null) {
		room.setPlayerTeam(round.parasiticHost.id, 1);
		room.sendAnnouncement(`${round.parasiticHost.name} has become the parasitic host.`, undefined, 0xF40000, "bold");
		room.sendAnnouncement("The parasitic host is the only parasite that is equipped with ranged weapons!", undefined, 0xF40000, "normal");
		room.sendAnnouncement("Careful, death of any cause will result in parasitic infection.", undefined, 0xF40000, "normal");
		room.playSound("https://dahnte.github.io/liero/alertalert5_n_audioman.wav");
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

function* waitForSeconds(seconds) {
    const end = window.performance.now() + seconds * 1000;
    while (window.performance.now() < end) {
        yield null;
    }
}

//FIX BROKEN LOGIC
function* roundLogic() {
	round = new Round();
	while (round.state == "new") {
		//TODO: allow for players to DM before round start
		yield* waitForSeconds(8);
		if ((room.getPlayerList().length - specList.size) < 2) {
			room.sendAnnouncement("Need at least two players to start!");
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
		//yield* waitForSeconds(2);
		getRemainingGreen();
		if (round.lives <= 0) {
			room.playSound("https://dahnte.github.io/liero/bassloop_josefpres.wav");
			room.sendAnnouncement("The worms have survived the parasitic onslaught!", undefined, 0x66CCFF, "bold");
			round.endFlag = 1;
			break;
		}
		//yield* waitForSeconds(2);
		getRemainingBlue();
		if (round.remainingWorms <= 0) {
			room.playSound("https://dahnte.github.io/liero/darkswell_nfrae.wav");
			room.sendAnnouncement("The parasites have successfully taken over the room!", undefined, 0xF40000, "bold");
			round.endFlag = 1;
			break;
		}
	}
	if (round.endFlag == 1 && round.state == "playing") {
		yield null;
		room.endGame();
		round.state = "new";
		t = roundLogic();	
	}
}

room.onPlayerKilled = (killed, killer) => {
	if (round.state == "playing") {
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
			room.createBonus(-2, killed.x, killed.y, null);
			round.lives--;
			if (round.lives == 1) {
				room.sendAnnouncement(`The parasites have ${round.lives} life remaining!`);
			}
			else {
				room.sendAnnouncement(`The parasites have ${round.lives} lives remaining!`);
			}
		}
	}
};
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
};
room.onPlayerChat = (player, message) => {
	if (message[0] == "!") {
		const commandText = message.substr(1).split("");
		console.log(`Command: ${commandText.join(" ")}`);
		const command = chatCommands[commandText[0]];
		if (command == null) {
			room.sendAnnouncement(`Unrecognized command: ${commandText[0]}`, player.id);
		}
		else {
			try {
				command(player);
			}
			catch (e) {
				if (e instanceof Error) {
					room.sendAnnouncement(`Error: ${e.message}`, player.id);
				}
				else { 
					room.sendAnnouncement(`Unknown Error!`, player.id);
				}
			}
		}
		return false;
	}
	return true;
};

let t = roundLogic();
setInterval(() => t.next(), 100);
room.restartGame();
loadMod('https://dahnte.github.io/liero/Parasitic_Worms.zip');
