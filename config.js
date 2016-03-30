module.exports = {
	// Required
	accounts: [
		{
			c_user: "722797115",
			datr: "eJ_QVioQAP4QpRR1EaLH-OCF",
			xs: "84%3AE4QAm-7Jb8Pmew%3A2%3A1457454955%3A12285"
		}
	],

	name: "BATMAN", // Name of the bots that will be playing.
	reset: 0, // Minutes before server reset. (0 for none)
	showtoken: false, // Show the token of the Facebook account on start.
        liveConsole: true, // Show a live console instead of new lines.
	logging: true, //Enables Logging of restarts, token errors, and points over 500.

	// Advance
	regions: ["BR-Brazil", "CN-China", "EU-London", "JP-Tokyo", "RU-Russia", "SG-Singapore", "TK-Turkey", "US-Atlanta"],
	statusDelay: 1000, // Delay of milleseconds for console.log.
	
	/* Possible values:
	 *
	 * default: Main AI - Poor performance, and low CPU Usage.
	 * apos: Beta AI - Better performance, and higher CPU Usage.
	 * 
	*/
	ai: "apos"
}