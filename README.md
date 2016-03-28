# agar-lvlgen

## Tutorial
###### How-To:
1. Get your Facebook-Cookies, and put them into the config.
2. Edit the config
3. Run Start.bat (on windows) or run it through a terminal or via linux cmd with "chmod +x Start.sh" and "./Start.sh"

## Tutoriel
###### Comment-faire:
1. Prendre en note le cookie Facebook, et le mettre dans le fichier config.
2. Éditer le fichier config
3. Démarrer Start.bat (sur windows) ou le démarrer via un terminal
4. Si vous etes en linux démarrer le fichier Start.sh (sur linux) avec la commande "chmod + Start.sh" ensuite "./Start.sh"

## Config
###### How to edit your config:
When you have your cookies, replace them in the config to make it farm for your account.
Aditionally, you can specify the name of your bots, the amount and more.

## Config
###### Comment éditer le fichier config:
Quand vous avez les informations cookies, replacer les information dans le fichier.
Vous pouvez aussi ajouter le nom du bot en plus de plusieurs autres informations.

When you first downloaded the lvlgen, your config should look something like this:
Quand vous télécharger lvlgen, votre fichier de configuration devrai resembler à ceci:
```
module.exports = {
	// Required
	
	accounts: [
		{
			c_user: "c_user",
			datr: "datr",
			xs: "xs"
		}
	],
	
	name: "agar-lvlgen",
	
	// Advanced
	regions: ["BR-Brazil", "CN-China", "EU-London", "JP-Tokyo", "RU-Russia", "SG-Singapore", "TK-Turkey", "US-Atlanta"],
	statusDelay: 1000,
	
	/* Possible values:
	 *
	 * default: Primitive "AI", low cpu usage
	 * apos: Smart AI, higher cpu usage (still buggy)
	 * 
	*/
	ai: "default"
}
```
In order to make it work you only need to replace ```c_user```, ```datr``` and ```xs``` with your cookies.<br />
You can also have multiple accounts:
```
	accounts: [
		{
			c_user: "c_user",
			datr: "datr",
			xs: "xs"
		},
		{
			c_user: "c_user",
			datr: "datr",
			xs: "xs"
		}
	],
```
All other options are optional.

## Cookies
###### How to get your Facebook token:
1. Get this extension: http://www.editthiscookie.com/
2. Go to facebook.com, click on the cookie and copy the values of datr and so on.

## Planned features / Options planifier
* G+ account support / Support des comptes G+
* Easier config / Meilleure configuration
* More options / Beaucoup plus d'options
* Better AI / Meilleure robot AI
* GUI / Une interface GUI

[Submit suggestions/issues here](../../issues)

## License
[MIT](/LICENSE.md)
