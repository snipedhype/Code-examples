const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
    ],
});
client.once('ready', async () => {
    const rest = new REST().setToken(token);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Loop through all the guilds and deploy commands
        for (const guild of client.guilds.cache.values()) {
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guild.id),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} application (/) commands for server ${guild.name} (${guild.id}).`);
        }
    } catch (error) {
        console.error(error);
    } finally {
        client.destroy();  
    }
});

client.login(token);
