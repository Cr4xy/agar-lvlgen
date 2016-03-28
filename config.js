module.exports = {
	// Required
	accounts: [
		{
			c_user: "c_user",
			datr: "datr",
			xs: "xs"
		}
	],

	name: "agar-lvlgen", // Name of the bots that will be playing. // Ce champ requiert le nom du bot qui se connectera.
	reset: 10, // Minutes before server reset. (0 for none) (10 by default // Le nombre de minutes avant que le serveur redemarre. (0 pour aucun) (10 par default)
	showtoken: false, // Show the token of the Facebook account on start. // Afficher ou nom le token du compte facebook au demarrage.
	liveConsole: true, // Show a live console instead of new lines. // Voir la console en mode reel pour les nouvelles lignes.

	// Advance
	regions: ["BR-Brazil", "CN-China", "EU-London", "JP-Tokyo", "RU-Russia", "SG-Singapore", "TK-Turkey", "US-Atlanta"],
	statusDelay: 1000, // Delay of milleseconds for console.log. (1000 recommended for live console) // Delais en miliseconde pour les logs console.
	
	/* Possible values: // Options possible:
	 *
	 * default: Main AI - Poor performance, and low CPU Usage. // default: Robot Autonome - Mauvaise performance, et basse usage du CPU.
	 * apos: Beta AI - Better performance, and higher CPU Usage. // apos: Robot Beta - Meilleure performance, et haute usage du CPU.
	 * 
	*/
	ai: "apos"
}

        /* Traduction FRENCH/FRANCAIS par W1LKC0
        */
