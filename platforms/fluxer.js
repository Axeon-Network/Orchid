exports.platform = "Fluxer";

const { PermissionFlags } = require("@fluxerjs/core");
function hexToInt(hex) { // ditto with discord
  if (!hex || typeof hex !== "string") return 0;
  return parseInt(hex.replace('#', ''), 16);
}

exports.createCtx = async function(fluxerClient, db, message) {
  return {
    reply: (content) => message.reply(content),
    dm: (content) => message.author.send(content),
    dmUser: async (user, content) => await user.send(content),
    edit: (content) => message.edit(content),
    member: message.guild ? await message.guild.members.fetch(message.author.id) : null,
    user: message.author,
    clientUser: fluxerClient.user,
    sender: `${message.author.username}#${message.author.discriminator}`,
    maintainer: auth.fluxer_ownerID,
    guild: message.guild,
    channel: message.channel,
    attachments: message.attachments,
    mentions: message.mentions,
    content: message.content,
    react: (emoji) => message.react(emoji),
    delete: () => message.delete(),

    isOwner: message.author.id === auth.fluxer_ownerID,
    isGlobalMod: message.author.id === auth.fluxer_ownerID || db.global.get("moderators")?.[message.author.id] === true,
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

    platform: exports.platform,
    raw: {fluxerClient, message}
  };
};

exports.getDestinations = function(fluxerClient, db, setting) {
  const destinations = [];

  for (const guild of fluxerClient.guilds.cache.values()) {
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

  