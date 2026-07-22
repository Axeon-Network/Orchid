const args = process.argv.slice(2);

const hasPlatformArgs =
    args.includes("--discord") ||
    args.includes("--stoat") ||
    args.includes("--fluxer");

const discord = hasPlatformArgs ? args.includes("--discord") : true;
const stoat = hasPlatformArgs ? args.includes("--stoat") : true;
const fluxer = args.includes("--fluxer");

const core = require("./config/core.json");
const bot = require("./config/config.json");

if (bot.show_ascii) {
  console.log(`                #######                 `);
  console.log(`               #########                `);
  console.log(`               #########                `);
  console.log(`         ###### ####### ######          `);
  console.log(`         ######## ### #########         `);
  console.log(`         ##########  ##########         `);
  console.log(`          ########   *#######:          `);
  console.log(`                 ## ###                 `);
  console.log(`             ###### ######              `);
  console.log(`           ######## #########           `);
  console.log(`          ########   ########           `);
  console.log(`           ######   . ######            `);
  console.log(``);
}

process.on('uncaughtException', function (err) {
  console.error('\x1b[31m[ERROR]\x1b[0m ' + err.stack);
});
 
const panther = require("./components/panther.js");
const { MAJOR, MINOR } = require("./components/version.json");

const devStage = core.devStage;
const devStageLabel = devStage ? `(${core.devStage})` : '';

const { Client: DiscordClient, GatewayIntentBits, Partials, ActivityType, Collection } = require('discord.js');
const { Client: StoatClient } = require("stoat.js");

const client = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ], 
  partials: [Partials.Channel] 
}); 
const stoatClient = new StoatClient();

const login = require("./config/auth.json");

if (discord) {client.login(login.discord_token)};
if (stoat) {stoatClient.loginBot(login.stoat_token)};

const fs = require("fs");
client.commands = new Collection();

const commandFiles = fs.readdirSync("./cmds").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);
    client.commands.set(command.meta.name, command);
}

const Enmap = require('enmap').default;

client.global = new Enmap({
    name: "global"
});
if (!client.global.has("moderators")) {client.global.set("moderators", [])};

client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep',
  autoEnsure: {
    prefix: bot.prefix,
    announcementChannel: "",
    globalChannel: "",
    honeypotChannel: "",
    honeypotRole: "",
  }
});

client.once('clientReady', () => { 	
    console.log(`\x1b[36m[INFO]\x1b[0m Connected to Discord: ${client.user.tag} (ID: ${client.user.id})`);
    client.user.setStatus(bot.indicator || `online`);
    client.user.setActivity(bot.status || `v${MAJOR}.${MINOR} ${devStageLabel}`, { type: ActivityType.Playing });
});

stoatClient.on('ready', () => {
    console.log(`\x1b[36m[INFO]\x1b[0m Connected to Stoat: ${stoatClient.user.username}#${stoatClient.user.discriminator} (ID: ${stoatClient.user.id})`);
})

console.log(`\x1b[36m[INFO]\x1b[0m Press Ctrl+C in this terminal window to shut down.`);

function hexToInt(hex) { // discord are we serious-
  if (!hex || typeof hex !== "string") return 0;
  return parseInt(hex.replace('#', ''), 16);
}
color = hexToInt(bot.color);

const commands = require("./components/commands");
const globalChat = require("./components/globalChat");
const honeypot = require("./components/honeypot");
const slashCommands = require("./components/slashCommands");

client.on("messageCreate", async (message) => {
  if (await commands.handle(client, message)) return;
  if (await globalChat.handle(client, message)) return;
  if (await honeypot.handle(client, message)) return;
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (await honeypot.handleMemberUpdate(client, oldMember, newMember)) return;
});

client.on("interactionCreate", async (interaction) => {
  if (await slashCommands.handle(client, interaction)) return;
});

process.on("exit", () => {
  if (fluxer) {
    console.log(`\x1b[33m[WARN]\x1b[0m Fluxer support for Axeon Orchid will be only implemented in Beta 2.`)
  } else {
    console.log(`\x1b[31m[ERROR]\x1b[0m A fatal error has occurred. Process halted.`)
  }
});