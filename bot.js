const fs = require("fs");

const { displayErr } = require('./components/errorHandler.js')

process.on('uncaughtException', function (err) {
  console.error('\x1b[31m[ERROR]\x1b[0m ' + err.stack);
});

const corePath = "./config/core.json";
const core = require(corePath);
const bot = require("./config/config.json");

let incrementBuildNumber, displayVersion;
try {
  ({ incrementBuildNumber, displayVersion } = require('./components/panther.js'));
if (bot.debug_mode) {
  incrementBuildNumber(core, corePath)
}
displayVersion();
} catch (err) {
  console.log(core.name);
}

const { Client, GatewayIntentBits, Partials, ActivityType, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel] }); 
client.login(bot.token);

client.commands = new Collection();

const commandFiles = fs.readdirSync("./cmds")
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./cmds/${file}`);
    client.commands.set(command.meta.name, command);
}

const Enmap = require('enmap').default;

client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep',
  autoEnsure: {
    prefix: bot.prefix,
    announcementChannel: "",
    globalChannel: "",
  }
});

client.once('ready', () => { 	
    console.log(`\n\n\x1b[36m[INFO]\x1b[0m Connected to Discord: ${client.user.tag} (ID: ${client.user.id})`);
    console.log(`\x1b[36m[INFO]\x1b[0m Press Ctrl+C in this terminal window to shut down.`);
    client.user.setStatus(bot.indicator || `online`);
    client.user.setActivity(bot.status || `${bot.prefix}help for commands! ~ v${core.version}.${core.build}`, { type: ActivityType.Playing });
});

function hexToInt(hex) { // discord are we serious-
  if (!hex || typeof hex !== "string") return 0;
  return parseInt(hex.replace('#', ''), 16);
}
color = hexToInt(bot.color);

// global chat mechanism
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const globalChannel = client.settings.get(
    message.guild.id,
    "globalChannel"
  );
  if (globalChannel && message.channel.id === globalChannel) {

    for (const guild of client.guilds.cache.values()) {
      const targetChannelId = client.settings.get(guild.id, "globalChannel");
      if (!targetChannelId) continue;

      const targetChannel = guild.channels.cache.get(targetChannelId);
      if (!targetChannel) continue;

      const attachment = message.attachments?.first?.();
      let repliedTo = null;

      if (message.reference?.messageId) {
        try {
          repliedTo = await message.channel.messages.fetch(message.reference.messageId);
        } catch {}
      }

      let embed = {
        color: color,
        author: {
          name: `${message.author.displayName} (@${message.author.username}) | ${message.author.id}`,
          icon_url: message.author.displayAvatarURL()
        },
        timestamp: new Date(),
        description: message.content,
        footer: {
          text: `${message.guild.name}`,
          icon_url: message.guild.iconURL()
        }
      }

      try {
        if (attachment) {
          if (attachment.contentType?.startsWith("image/")) {
            embed.image = {url: attachment.url};
          } else {
            embed.fields = [{name: "Attachment", value: attachment.url}];
          }
        }
        if (repliedTo) {
          const re = repliedTo.embeds?.[0];
          const originalMessage = re?.description || "No text";
          embed.fields = [{name: `RE: ${re?.author.name}`, value: originalMessage.slice(0, 1024)}];
        }
    
        await targetChannel.send({embeds: [embed]});
        await message.delete().catch(() => {});
      } catch (err) {
        console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
      }
    }
  return;
  }
});

// prefix command mechanism
client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    const guildConf = client.settings.get(message.guild.id);
    if (message.content.indexOf(guildConf.prefix) !== 0) return;
  
    const args = message.content.slice(guildConf.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const context = {
      reply: (content) => message.channel.send(content),
      edit: (content) => message.edit(content),
      member: await message.guild.members.fetch(message.author.id),
      user: message.author,
      guild: message.guild,
      channel: message.channel,
      attachments: message.attachments
    };
  
    try {
      const commandFile = client.commands.get(command);

      commandFile.execute(client, context, args);
      console.log(`\x1b[36m[INFO]\x1b[0m ${context.user.tag} (${context.guild}) ran ${message.content}`);
    } catch (err) {
      displayErr(client, context, message, err);
    }
      
  });

// slash command mechanism for the discord side  
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const context = {
    reply: (content) => interaction.reply(content),
    edit: (content) => interaction.editReply(content),
    member: await interaction.guild.members.fetch(interaction.user.id),
    user: interaction.user,
    guild: interaction.guild,
    channel: interaction.channel,
    command: interaction.commandName,
    options: interaction.options
  };

  try {
    const commandFile = client.commands.get(command);

    commandFile.execute(client, context, []);
     console.log(`\x1b[36m[INFO]\x1b[0m ${context.user.tag} (${context.guild}) ran ${interaction.commandName}`);
    } catch (err) {
      displayErr(client, context, null, err); // this was a fucking PAIN it took me 5 hours to get working
    }
});

process.on("exit", () => {
  console.log(`\x1b[31m[ERROR]\x1b[0m A fatal error has occurred. Process halted.`)
});