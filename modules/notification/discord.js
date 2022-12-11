const config = require('../../.config/config.json');
const { Client, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});

// Create a new client instance

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// get message from discord ?
client.on('message', (message) => {
	console.log(message.content);
});

client.on(Events.message, (message) => {
	console.log(message);
});

client.login(config.BOT_TOKEN);
