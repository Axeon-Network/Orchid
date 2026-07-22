exports.handle = async function (client, message) {

  if (!message.guild) return;
  if (message.author.bot) return;

  const globalChannel = client.settings.get(message.guild.id, "globalChannel");
  if (!globalChannel || message.channel.id !== globalChannel) return false;

  try {
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

      const badges = [];

      const auth = require("../config/auth.json");
      if (message.author.id === auth.discord_ownerID) badges.push(`👑`);

      const moderators = client.global.get("moderators") || [];
      if (moderators.includes(message.author.id)) badges.push(`🛡️`);

      let embed = {
        color: color,
        author: {
          name: `${message.author.displayName} (@${message.author.username}) ${badges.join("")} | ${message.author.id}`,
          icon_url: message.author.displayAvatarURL()
        },
        timestamp: new Date(),
        description: message.content,
        footer: {
          text: `${message.guild.name}`,
          icon_url: message.guild.iconURL()
        }
      }

        const bot = require("../config/config.json");

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
        try {
        await message.delete();
        } catch (err) {
           if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Failed to delete originalMessage; missing permissions in ${message.guild.name}`);
        }
        console.log(`\x1b[36m[INFO]\x1b[0m GlobalChat: Successfully relayed message from ${message.author.tag} (${message.guild.name}) to the global chat`);
    };
    } catch (err) {
        console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
    return true;
};