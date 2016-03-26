module.exports = {
	// Required
	accounts: [
		{
			c_user: "c_user",
			datr: "datr",
			xs: "xs"
		}
	],

	name: "agar-lvlgen", // Name of the bots that will be playing.
	reset: 0, // Minutes before server reset. (0 for none)
	showtoken: false, // Show the token of the Facebook account on start.
	liveConsole: true, // Show a live console instead of new lines.

	// Advance
	regions: ["BR-Brazil", "CN-China", "EU-London", "JP-Tokyo", "RU-Russia", "SG-Singapore", "TK-Turkey", "US-Atlanta"],
	statusDelay: 1000, // Delay of milleseconds for console.log. (1000 recommended for live console)
	
	/* Possible values:
	 *
	 * default: Main AI - Poor performance, and low CPU Usage.
	 * apos: Beta AI - Better performance, and higher CPU Usage.
	 * 
	*/
	ai: "apos"
}
