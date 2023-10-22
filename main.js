//TODO: name teams, restrict weapon on helminth team, complete round logic and proper round loop

"use strict";

class Player {
	constructor(id, auth, conn, name) {
		this.team = 0;
		this.isAdmin = false;
		this.id = id;
		this.auth = auth;
		this.conn = conn;
		this.name = name;
	}
}

class Round {
	constructor() {
		this.state = "new";
		this.roundPlayers = [];
		this.roundWinners = [];
	}

	start() {
		if (room.getPlayerList().length < 3)
			throw new Error("Need at least three players to start");
		this.state = "playing";
	}
}

console.log("Running Server...");
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]);
const players = new Map();
let round = new Round();
const room = window.WLInit({
	token: "thr1.AAAAAGU06GQV4TD1b2XNoA.rupRqFX5Mng",
	roomName: "Dedicated Server",
	maxPlayers: 12,
	public: false,
	password: null
});
window.WLROOM = room;
//window.WLTOKEN = "thr1.AAAAAGU0qlt2hVWxBRSfUQ.J_OxuhoMkdA";
room.setSettings({
    gameMode: "tdm",
	//teamsLocked: true,
});
room.onRoomLink = (link) => console.log(link);
room.onCaptcha = () => console.log("Invalid token");

// will break if players leave match
function setHelminthHost() {
	let listLength = room.getPlayerList().length;
	let playerIndex = Math.floor(Math.random() * listLength) + 1;
	room.setPlayerTeam(playerIndex, 1);
	return playerIndex;
}

function* roundLogic() {
	round = new Round();
	let hostPlayer = setHelminthHost();
	let hostPlayerName = room.getPlayer(hostPlayer);
	room.sendAnnouncement(`The Helminth's have made ${hostPlayerName.name} their host!`, undefined, 0xFFFFFF, "bold");
	while (room.state == "playing") {
		room.onPlayerKilled = (killed, killer) => {
			if (killed.team == 0) {
				room.setPlayerTeam(killed.id, 1);
				room.sendAnnouncement(`${killed.name} has been infected!`);
			}
		}
	}
}

room.onPlayerJoin = (player) => {
	let p = new Player(player.id, player.auth, player.conn, player.name);
	players.set(p.id, p);
	if ( admins.has(player.auth) ) {
		room.setPlayerAdmin(player.id, true);
	}
	if (round.state == "new")
		room.sendAnnouncement("Welcome to Parasitic Worms! Enjoy a deathmatch as the Helminth's seek out their host.");
	else
		room.sendAnnouncement("Welcome to Parasitic Worms! The Helminth's have infested the server, join them and infect the Nematodes!");
};

//let t = roundLogic(); setInterval(() => t.next(), 100);