exports.platform = "Discord";

const { PermissionFlagsBits } = require("discord.js");
function hexToInt(hex) { // discord are we serious-
  if (!hex || typeof hex !== "string") return 0;
  return parseInt(hex.replace('#', ''), 16);
}

exports.createCtx = async function(client, db, message) {
  return {
    reply: (content) => message.channel.send(content),
    dm: (content) => message.author.send(content),
    dmUser: async (user, content) => await user.send(content),
    edit: (content) => message.edit(content),
    member: await message.guild.members.fetch(message.author.id),
    user: message.author,
    clientUser: client.user,
    sender: message.author.username,
    maintainer: auth.discord_ownerID,
    guild: message.guild,
    channel: message.channel,
    attachments: message.attachments,
    mentions: message.mentions,
    content: message.content,
    react: (emoji) => message.react(emoji),
    delete: () => message.delete(),

    isOwner: message.author.id === auth.discord_ownerID,
    isGlobalMod: message.author.id === auth.discord_ownerID || db.global.get("moderators")?.[message.author.id] === true,
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

    platform: exports.platform,
    raw: {client, message}
  };
};

exports.createSlashCtx = async function(client, db, interaction) {
  return {
    reply: (content) => interaction.reply(content),
    dm: (content) => interaction.reply({...content, flags: MessageFlags.Ephemeral}),
    edit: (content) => interaction.editReply(content),
    member: await interaction.guild.members.fetch(interaction.user.id),
    user: interaction.user,
    clientUser: client.user,
    sender: interaction.user.username,
    maintainer: auth.discord_ownerID,
    guild: interaction.guild,
    channel: interaction.channel,
    content: interaction.commandName,
    options: interaction.options,

    isOwner: interaction.user.id === auth.discord_ownerID,
    isGlobalMod: interaction.user.id === auth.discord_ownerID || db.global.get("moderators")?.[interaction.user.id] === true,
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

    platform: exports.platform,
    raw: {client, interaction}
  }
}

exports.getDestinations = function(client, db, setting) {
  const destinations = [];

  for (const guild of client.guilds.cache.values()) {
    const channelId = db.settings.get(guild.id, setting);
    if (!channelId) continue;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    destinations.push({
      platform: exports.platform,
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

  return destinations;
};