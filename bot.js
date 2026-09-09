const fs = require("fs");

const core = {name: "Axeon Orchid", shortName: "Orchid", devStage: "Beta 2a", idPrefix: "b2"};
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
  console.error(err.stack);
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

const { Client: DiscordClient, GatewayIntentBits, Partials, MessageFlags, Collection, PermissionFlagsBits } = require('discord.js');
const { Client: StoatClient } = require("stoat.js");
const { Client: FluxerClient, Events, PermissionFlags } = require("@fluxerjs/core");

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
const fluxerClient = new FluxerClient();

const login = require("./config/auth.json");
if (discord) client.login(login.discord_token);
if (stoat) stoatClient.loginBot(login.stoat_token);
if (fluxer) fluxerClient.login(login.fluxer_token);
log('debug', "Client(s) initialized")

const { missingPermission, missingArgument, technicalErr } = require("./components/errorHandler");
global.missingPermission = missingPermission;
global.missingArgument = missingArgument;
global.technicalErr = technicalErr;

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

function hexToInt(hex) { // discord are we serious-
  if (!hex || typeof hex !== "string") return 0;
  return parseInt(hex.replace('#', ''), 16);
}

const commands = require("./components/commands");
const globalChat = require("./components/globalChat");
const honeypot = require("./components/honeypot");
const slashCommands = require("./components/slashCommands");

client.on("messageCreate", async (message) => {
  const ctx = {
    platform: "discord",

    reply: (content) => message.channel.send(content),
    dm: (content) => message.author.send(content),
    dmUser: async (user, content) => await user.send(content),
    edit: (content) => message.edit(content),
    member: await message.guild.members.fetch(message.author.id),
    user: message.author,
    clientUser: client.user,
    sender: message.author.username,
    maintainer: login.discord_ownerID,
    guild: message.guild,
    channel: message.channel,
    attachments: message.attachments,
    mentions: message.mentions,
    content: message.content,
    react: (emoji) => message.react(emoji),
    delete: () => message.delete(),

    isOwner: message.author.id === login.discord_ownerID,
    isGlobalMod: message.author.id === login.discord_ownerID || db.global.get("moderators")?.[message.author.id] === true,
    isAdmin: message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.permissions.has(PermissionFlagsBits.ManageGuild),

    getChannel: (arg) => message.options?.getChannel("channel") || message.guild.channels.cache.get(arg?.replace(/[<#>]/g, "")),
    getUser: async (arg) => message.mentions.users.first() || await client.users.fetch(arg).catch(() => null),

    embed: (data = {}) => {
      const embed = { ...data };

      if (embed.color && typeof embed.color === "string") {
        embed.color = hexToInt(embed.color);
      } else if (!embed.color) {
        embed.color = hexToInt(bot.color);
      };

      return embed;
    },
    fetchReply: async (message) => { 
      if (!message.reference?.messageId) return null; 
      const replied = await message.channel.messages.fetch(message.reference.messageId); 
      const embed = replied.embeds?.[0]; 
      
      let author = embed.author.name ?? "Unknown";
      author = author.split("(@")[1]?.split(")")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].trim();

      return {author, text}; 
    },
    attachmentsToUrl: [...message.attachments.values()].map(a => a.url),

    raw: {client, message}
  };

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

client.on("interactionCreate", async (interaction) => {
  const ctx = {
    platform: "discord",

    reply: (content) => interaction.reply(content),
    dm: (content) => interaction.reply({...content, flags: MessageFlags.Ephemeral}),
    edit: (content) => interaction.editReply(content),
    member: await interaction.guild.members.fetch(interaction.user.id),
    user: interaction.user,
    clientUser: client.user,
    sender: interaction.user.username,
    maintainer: login.discord_ownerID,
    guild: interaction.guild,
    channel: interaction.channel,
    content: interaction.commandName,
    options: interaction.options,

    isOwner: interaction.user.id === login.discord_ownerID,
    isGlobalMod: interaction.user.id === login.discord_ownerID || db.global.get("moderators")?.[interaction.user.id] === true,
    isAdmin: interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.permissions.has(PermissionFlagsBits.ManageGuild),

    getChannel: (arg) => interaction.options?.getChannel("channel") || interaction.guild.channels.cache.get(arg?.replace(/[<#>]/g, "")),
    getUser: async (arg) => interaction.mentions.users.first() || await client.users.fetch(arg).catch(() => null),

    embed: (data = {}) => {
      const embed = { ...data };

      if (embed.color && typeof embed.color === "string") {
        embed.color = hexToInt(embed.color);
      } else if (!embed.color) {
        embed.color = hexToInt(bot.color);
      }

      return embed;
    },

    raw: {client, interaction}
  };

  if (await slashCommands.handle(client, db, interaction, ctx)) return;
});

stoatClient.on("messageCreate", async (message) => {
  const ctx = {
    platform: "stoat",

    reply: (content) => message.channel.sendMessage(content),
    dm: async (content) => {
      const dm = await message.author.openDM();
      return await dm.sendMessage(content);
    },
    dmUser: async (user, content) => {
      const dm = await user.openDM();
      return await dm.sendMessage(content);
    },
    edit: (content) => message.channel.edit(content),
    member: message.member,
    user: message.author,
    clientUser: stoatClient.user,
    sender: `${message.author.username}#${message.author.discriminator}`,
    maintainer: login.stoat_ownerID,
    guild: message.server,
    channel: message.channel,
    attachments: message.attachments,
    mentions: message.mentioned,
    content: message.content,
    react: (emoji) => message.react(emoji),
    delete: () => message.delete(),

    isOwner: () => message.author.id === login.stoat_ownerID,
    isGlobalMod: () => message.author.id === login.stoat_ownerID || db.global.get("moderators")?.[message.author.id] === true,
    isAdmin: () => message.member.permissions.has("ManageServer"),

    getChannel: (arg) => {
      const id = arg?.replace(/[<#>]/g, "");
      return message.server.channels.find(channel => channel.id === id);
    },
    getUser: async (arg) => await stoatClient.users.fetch(arg?.replace(/[<@>]/g, "")).catch(() => null),

    embed: (data = {}) => {
      const embed = { ...data };

      embed.colour = embed.color ?? bot.color;
      delete embed.color;

      if (embed.author) {embed.title = embed.author.name; delete embed.author};
      if (embed.fields) {embed.description = [embed.description, embed.fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")].filter(Boolean).join("\n\n"); delete embed.fields};
      if (embed.footer) {embed.description = (embed.description ?? "") + `\n\n` + embed.footer.text; delete embed.footer};
      if (embed.image) {embed.image = { url: embed.image.url }};

      return embed;
    },
    fetchReply: async (message) => { 
      if (!message.replyIds?.length) return null; 
      const replied = await stoatClient.messages.fetch( message.channel.id, message.replyIds[0] ); 
      const embed = replied.embeds?.[0];

      let author = embed.title ?? "Unknown";
      author = author.split("(@")[1]?.split(")")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].split("\n\n**RE:")[0].trim();

      return {author, text};
    },
    attachmentsToUrl: (message.attachments ?? []).map(a => a.previewUrl),

    raw: {stoatClient, message}
  };

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

fluxerClient.on(Events.MessageCreate, async (message) => {
  const ctx = {
   platform: "fluxer",

   reply: (content) => message.reply(content),
   dm: (content) => message.author.send(content),
   dmUser: async (user, content) => await user.send(content),
   edit: (content) => message.edit(content),
   member: message.guild ? await message.guild.members.fetch(message.author.id) : null,
   user: message.author,
   clientUser: fluxerClient.user,
   sender: `${message.author.username}#${message.author.discriminator}`,
   maintainer: login.fluxer_ownerID,
   guild: message.guild,
   channel: message.channel,
   attachments: message.attachments,
   mentions: message.mentions,
   content: message.content,
   react: (emoji) => message.react(emoji),
   delete: () => message.delete(),

   isOwner: message.author.id === login.fluxer_ownerID,
   isGlobalMod: message.author.id === login.fluxer_ownerID || db.global.get("moderators")?.[message.author.id] === true,
   isAdmin: message.member?.permissions.has(PermissionFlags.Administrator) || message.member?.permissions.has(PermissionFlags.ManageGuild),

   getChannel: (arg) => message.guild.channels.cache.get(arg?.replace(/[<#>]/g, "")),
   getUser: async (arg) => message.mentions?.[0] || await fluxerClient.users.fetch(arg).catch(() => null),

   embed: (data = {}) => {
      const embed = { ...data };

      if (embed.color && typeof embed.color === "string") {
        embed.color = hexToInt(embed.color);
      } else if (!embed.color) {
        embed.color = hexToInt(bot.color);
      };

      return embed;
    },
    fetchReply: async (message) => {
      const replied = message.referencedMessage ?? (message.messageReference?.messageId ? await message.channel?.messages.fetch(message.messageReference.messageId) : null);
      if (!replied) return null;

      const embed = replied.embeds?.[0]; 
      
      let author = embed.author.name ?? "Unknown";
      author = author.split("(@")[1]?.split(")")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].trim();

      return {author, text}; 
    },
    attachmentsToUrl: [...message.attachments.values()].map(a => a.url),

    raw: {fluxerClient, message}
  };

  if (await commands.handle(client, db, message, ctx)) return;
  if (await globalChat.handle(client, db, message, ctx)) return;
  if (await honeypot.handle(client, db, message, ctx)) return;
});

function getBridgeChannels(setting) {
  const destinations = [];

  for (const guild of client.guilds.cache.values()) {
    const channelId = db.settings.get(guild.id, setting);
    if (!channelId) continue;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    destinations.push({
      platform: "discord",
      guild,
      channel,
      send: (content) => channel.send(content),
      embed: (data = {}) => {
        const embed = { ...data };

        if (embed.color && typeof embed.color === "string") {
          embed.color = hexToInt(embed.color);
        } else if (!embed.color) {
          embed.color = hexToInt(bot.color);
        };

        return embed;
      },
      fetch: async (message) => {
        const id = message.reference?.messageId;
        if (!id) return null;
        return await message.channel.messages.fetch(id);
      },
    });
  }

  for (const guild of fluxerClient.guilds.cache.values()) {
    const channelId = db.settings.get(guild.id, setting);
    if (!channelId) continue;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    destinations.push({
      platform: "fluxer",
      guild,
      channel,
      send: (content) => channel.send(content),
      embed: (data = {}) => {
        const embed = { ...data };

        if (embed.color && typeof embed.color === "string") {
          embed.color = hexToInt(embed.color);
        } else if (!embed.color) {
          embed.color = hexToInt(bot.color);
        };

        return embed;
      },
      fetch: async (message) => {
        const id = message.reference?.messageId;
        if (!id) return null;
        return await message.channel.messages.fetch(id);
      },
    });
  }

  for (const server of stoatClient.servers.values()) {
    const channelId = db.settings.get(server.id, setting);
    if (!channelId) continue;

    const channel = server.channels.find(c => c.id === channelId);
    if (!channel) continue;

    destinations.push({
      platform: "stoat",
      guild: server,
      channel,
      send: (content) => channel.sendMessage(content),
      embed: (data = {}) => {
        const embed = { ...data };

        embed.colour = embed.color ?? bot.color;
        delete embed.color;

        if (embed.footer) {embed.description = (embed.description ?? "") + `\n\n*Sent from ${embed.footer.text}*`; delete embed.footer};
        if (embed.author) {        
          const [title, id] = embed.author.name.split(" | ");
          embed.title = title;
          if (id) {embed.description = (embed.description ?? "") + `\nID: ${id}`};
          delete embed.author;
        };
        if (embed.fields) {
          embed.description = [embed.description, embed.fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")]
          .filter(Boolean).join("\n\n"); 
          delete embed.fields
        };
        if (embed.image) {embed.image = { url: embed.image.url }};

      return embed;
      },
      fetch: async (message) => {
        const id = message.replyIds?.[0];
        if (!id) return null;
        return await stoatClient.messages.fetch(message.channel.id, id);
      },
    });
  }

  return destinations;
}
db.getBridgeChannels = getBridgeChannels;

log('info', `Press Ctrl+C in this terminal window to shut down.`);