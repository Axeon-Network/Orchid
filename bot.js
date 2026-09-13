const fs = require("fs");

const core = {name: "Axeon Orchid", shortName: "Orchid", devStage: "", idPrefix: ""};
global.core = core;

const bot = require("./config/config.json");
global.bot = bot;

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`Usage: node bot.js [--log] [--discord] [--stoat]`);
  console.log(``);
  console.log(`--help           Display this command`);
  console.log(`--log            Start the bot but write console logs to file`);
  console.log(`--discord        Start the Discord bot ONLY`);
  console.log(`--stoat          Start the Stoat bot ONLY`);
  console.log(`--fluxer         Start the Fluxer bot ONLY`);
  process.exit(0);
}

const hasPlatformArgs = args.includes("--discord") || args.includes("--stoat") || args.includes("--fluxer");
const discord = hasPlatformArgs ? args.includes("--discord") : true;
const stoat = hasPlatformArgs ? args.includes("--stoat") : true;
const fluxer = hasPlatformArgs ? args.includes("--fluxer") : true;

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception!!!');
  console.error(err);
});

const { isDebug } = require("./components/panther");
global.isDebug = isDebug;

let logger;
let ascii;
let log;
try {
  logger = require("./components/logger");
  ({ ascii, log, logToFile } = logger);
  global.log = log;
} catch {
  console.error("/components/logger.js not found, falling back to basic console logging");
  ascii = () => {};
  log = () => {};
  logToFile = () => {};
}
global.logger = logger;

if (args.includes("--log")) logToFile();
ascii();
log('debug', "Ello!~");

const { Client: DiscordClient, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { Client: StoatClient } = require("stoat.js");
const { Client: FluxerClient, Events } = require("@fluxerjs/core");

const client = new DiscordClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], 
  partials: [Partials.Channel] 
}); 
const stoatClient = new StoatClient();
const fluxerClient = new FluxerClient();

const login = require("./config/auth.json");
if (discord) client.login(login.discord_token);
if (stoat) stoatClient.loginBot(login.stoat_token);
if (fluxer) fluxerClient.login(login.fluxer_token);
log('debug', "Client(s) initialized");
global.auth = login;

const errorHandler = require("./components/errorHandler");
global.missingPermission = errorHandler.missingPermission;
global.missingArgument = errorHandler.missingArgument;
global.technicalErr = errorHandler.technicalErr;

const db = {};
db.commands = new Collection();

const commandFiles = fs.readdirSync("./cmds").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./cmds/${file}`);
  db.commands.set(command.meta.name, command);
}
log('debug', `Loaded ${commandFiles?.length ?? NaN} commands`)

const Enmap = require('enmap').default;

db.global = new Enmap({name: "global"});
if (!db.global.has("moderators")) {db.global.set("moderators", [])};

db.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep',
  autoEnsure: {
    prefix: bot.prefix,
    announcementChannel: "",
    globalChannel: "",
    honeypotChannel: ""
  }
});
log('debug', "Loaded database");

let status;
if (Math.random() < 0.01) {
  status = "connocting poopies togethor!";
  log('debug', `You just caught an easter egg!`)
} else {
  status = "connecting people together!";
};

client.once('clientReady', () => {
  log('info', `Connected to Discord: ${client.user.tag} (ID: ${client.user.id})`);
  if (!logger) console.log('Discord connected');
  client.user.setPresence({activities: [{ name: bot.status || status }], status: bot.indicator || 'online'});
});

stoatClient.once('ready', () => {
  log('info', `Connected to Stoat: ${stoatClient.user.username}#${stoatClient.user.discriminator} (ID: ${stoatClient.user.id})`);
  if (!logger) console.log('Stoat connected')
  function setPresence(text, presence) {
    stoatClient.api.patch("/users/@me", {status: {text, presence}});
  }
  const indicator = { // gotta love differences between two platforms sometimes
    online: 'Online',
    idle: 'Idle',
    dnd: 'Busy',
    invisible: 'Invisible'
  }
  setPresence(bot.status || status, indicator[bot.indicator] || 'Online');
});

fluxerClient.once(Events.Ready, () => {
  log('info', `Connected to Fluxer: ${fluxerClient.user.username}#${fluxerClient.user.discriminator} (ID: ${fluxerClient.user.id})`);
  if (!logger) console.log('Fluxer connected')
  fluxerClient.user.setPresence({status: bot.indicator || 'online', customStatus: {text: bot.status || status}});
});

const { createCtx: createDiscordCtx, createSlashCtx, getDestinations: getDiscordDestinations } = require("./platforms/discord");
const { createCtx: createStoatCtx, getDestinations: getStoatDestinations } = require("./platforms/stoat");
const { createCtx: createFluxerCtx, getDestinations: getFluxerDestinations } = require("./platforms/fluxer");

const commands = require("./components/commands");
const globalChat = require("./components/globalChat");
const honeypot = require("./components/honeypot");
const slashCommands = require("./components/slashCommands");

client.on("interactionCreate", async (interaction) => {
  const ctx = await createSlashCtx(client, db, interaction);

  if (await slashCommands.handle(client, db, interaction, ctx)) return;
});

client.on("messageCreate", async (message) => {
  const ctx = await createDiscordCtx(client, db, message);

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

stoatClient.on("messageCreate", async (message) => {
  const ctx = await createStoatCtx(stoatClient, db, message);

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

fluxerClient.on(Events.MessageCreate, async (message) => {
  const ctx = await createFluxerCtx(fluxerClient, db, message);

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

function getBridgeChannels(setting) {
  return [
    ...getDiscordDestinations(client, db, setting),
    ...getStoatDestinations(stoatClient, db, setting),
    ...getFluxerDestinations(fluxerClient, db, setting)
  ];
}
db.getBridgeChannels = getBridgeChannels;

log('info', `Press Ctrl+C in this terminal window to shut down.`);