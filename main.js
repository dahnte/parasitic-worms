"use strict"
console.log("Running Server...");
const admins = new Set(["6zgUYjs_v504BzseshPSLgv7B4A3TU1v-jl0BMISJtA"]);
const room = window.WLInit({
	token: window.WLTOKEN,
	roomName: "Dedicated Server",
	maxPlayers: 12,
	public: false,
	password: null
});

window.WLROOM = room;
window.WLTOKEN = "thr1.AAAAAGU0qlt2hVWxBRSfUQ.J_OxuhoMkdA";
room.setSettings({
    gameMode: "tdm",
});

room.onRoomLink = (link) => console.log(link);
room.onCaptcha = () => console.log("Invalid token");

room.onPlayerJoin = (player) => {
	if ( admins.has(player.auth) ) {
		room.setPlayerAdmin(player.id, true);
	}
}