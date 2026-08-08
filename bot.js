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
  console.error('\x1b[31m[ERROR]\x1b[0m Uncaught Exception!!!');
  console.error('\x1b[31m[ERROR]\x1b[0m ' + err.stack);
});
 
const panther = require("./components/panther");
const { MAJOR, MINOR } = require("./components/version.json");

const devStage = core.dev_stage;
const devStageLabel = devStage ? `(${core.dev_stage})` : '';

const { Client: DiscordClient, GatewayIntentBits, PermissionFlagsBits, Partials, ActivityType, Collection } = require('discord.js');
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
const db = {};

db.commands = new Collection();

const commandFiles = fs.readdirSync("./cmds").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);
    db.commands.set(command.meta.name, command);
}

const Enmap = require('enmap').default;

db.global = new Enmap({
  name: "global"
});
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

const commands = require("./components/commands");
const globalChat = require("./components/globalChat");
const honeypot = require("./components/honeypot");
const slashCommands = require("./components/slashCommands");

client.on("messageCreate", async (message) => {
  const context = {
    platform: "discord",

    reply: (content) => {
      if (content?.embeds) {
        for (const embed of content.embeds) {
          if (embed.color && typeof embed.color === "string") {
            embed.color = hexToInt(embed.color);
          } else if (!embed.color) {
            embed.color = hexToInt(bot.color);
          }
        }
      }
      return message.channel.send(content);
    },
    dm: (content) => {
      if (content?.embeds) {
        for (const embed of content.embeds) {
          if (embed.color && typeof embed.color === "string") {
            embed.color = hexToInt(embed.color);
          } else if (!embed.color) {
            embed.color = hexToInt(bot.color);
          }
        }
      }
      return message.author.send(content);
    },
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
    delete: () => message.delete(),

    admin: () => message.member.permissions.has(PermissionFlagsBits.Administrator) || message.member.permissions.has(PermissionFlagsBits.ManageGuild),
    getChannel: (arg) => message.options?.getChannel("channel") || message.guild.channels.cache.get(arg?.replace(/[<#>]/g, "")),
    getUser: async (arg) => message.mentions.users.first() || await client.users.fetch(arg).catch(() => null),

    color: hexToInt(bot.color),
    author: (embed, author) => {embed.author = {name: author.name, icon_url: author.icon_url}},
    fields: (embed, fields) => {embed.fields = fields},
    footer: (embed, footer) => {embed.footer = {text: footer.text, icon: footer.icon_url}},
    image: (embed, url) => {embed.image = {url}},
    fetchReply: async (message) => { 
      if (!message.reference?.messageId) return null; 
      const replied = await message.channel.messages.fetch(message.reference.messageId); 
      const embed = replied.embeds?.[0]; 
      
      let author = embed.author.name ?? "Unknown";
      author = author.split("(@")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].trim();

      return {author, text}; 
    },
    attachmentsToUrl: [...message.attachments.values()].map(a => a.url),

    raw: {client, message}
  };

  if (await commands.handle(client, db, message, context)) return;
  if (await globalChat.handle(client, db, message, context)) return;
  if (await honeypot.handle(client, db, message, context)) return;
});

client.on("interactionCreate", async (interaction) => {
  const context = {
    platform: "discord",

    reply: (content) => {
      if (content?.embeds) {
        for (const embed of content.embeds) {
          if (embed.color && typeof embed.color === "string") {
            embed.color = hexToInt(embed.color);
          } else if (!embed.color) {
            embed.color = hexToInt(bot.color);
          }
        }
      }
      return interaction.reply(content);
    },
    edit: (content) => {
      if (content?.embeds) {
        for (const embed of content.embeds) {
          if (embed.color && typeof embed.color === "string") {
            embed.color = hexToInt(embed.color);
          } else if (!embed.color) {
            embed.color = hexToInt(bot.color);
          }
        }
      }
      return interaction.editReply(content);
    },
    member: await interaction.guild.members.fetch(interaction.user.id),
    user: interaction.user,
    clientUser: client.user,
    sender: interaction.user.username,
    maintainer: login.discord_ownerID,
    guild: interaction.guild,
    channel: interaction.channel,
    content: interaction.commandName,
    options: interaction.options,

    admin: () => interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.permissions.has(PermissionFlagsBits.ManageGuild),
    getChannel: (arg) => interaction.options?.getChannel("channel") || interaction.guild.channels.cache.get(arg?.replace(/[<#>]/g, "")),
    getUser: async (arg) => interaction.mentions.users.first() || await client.users.fetch(arg).catch(() => null),

    color: hexToInt(bot.color),
    author: (embed, author) => {embed.author = {name: author.name, icon: author.icon_url}},
    fields: (embed, fields) => {embed.fields = fields},
    image: (embed, url) => {embed.image = {url}}
  };

  if (await slashCommands.handle(client, db, interaction, context)) return;
});

stoatClient.on("messageCreate", async (message) => {
  const context = {
    platform: "stoat",

    reply: (content) => {
      if (content?.embeds) {
        for (const embed of content.embeds) {
          embed.colour = embed.color ?? bot.color;
          delete embed.color;
        }
      }
    return message.channel.sendMessage(content);
    },
    dm: async (content) => {
      const dm = await message.author.openDM();
      if (content?.embeds) {
        for (const embed of content.embeds) {
          embed.colour = embed.color ?? bot.color;
          delete embed.color;
        }
      }
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
    delete: () => message.delete(),

    admin: () => message.member.permissions.has("ManageServer"),
    getChannel: (arg) => {
      const id = arg?.replace(/[<#>]/g, "");
      return message.server.channels.find(channel => channel.id === id);
    },
    getUser: async (arg) => await stoatClient.users.fetch(arg?.replace(/[<@>]/g, "")).catch(() => null),

    color: bot.color,
    author: (embed, author) => {embed.title = author.name},
    fields: (embed, fields) => {embed.description = [embed.description, fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")].filter(Boolean).join("\n\n")},
    footer: (embed, footer) => {embed.description = (embed.description ?? "") + `\n\n` + footer.text},
    image: (embed, url) => {embed.image = {url}},
    fetchReply: async (message) => { 
      if (!message.replyIds?.length) return null; 
      const replied = await stoatClient.messages.fetch( message.channel.id, message.replyIds[0] ); 
      const embed = replied.embeds?.[0];

      let author = embed.title ?? "Unknown";
      author = author.split("(@")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].split("\n\n**RE:")[0].trim();

      return {author, text};
    },
    attachmentsToUrl: (message.attachments ?? []).map(a => a.previewUrl),

    raw: {stoatClient, message}
  };

  if (await commands.handle(client, db, message, context)) return;
  if (await globalChat.handle(client, db, message, context)) return;
  if (await honeypot.handle(client, db, message, context)) return;
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
      author: (embed, author) => {embed.author = author},
      footer: (embed, footer) => {embed.footer = footer},
      fields: (embed, fields) => {embed.fields = fields},
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
      author: (embed, author) => {
        const [title, id] = author.name.split(" | ");
        embed.title = title;
        if (id) {embed.description = (embed.description ?? "") + `\nID: ${id}`}
      },
      footer: (embed, footer) => {embed.description = (embed.description ?? "") + `\n\n*Sent from ${footer.text}*`},
      fields: (embed, fields) => {embed.description = [
        embed.description, fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")
      ].filter(Boolean).join("\n\n")},
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

process.on("exit", () => {
  if (fluxer) {
    console.warn(`\x1b[33m[WARN]\x1b[0m Fluxer support for Axeon Orchid will be only implemented in Beta 2.`)
  } else {
    console.error(`\x1b[31m[ERROR]\x1b[0m A fatal error has occurred. Process halted.`)
  }
});