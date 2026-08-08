const bot = require("../config/config.json");
const { technicalErr } = require("./errorHandler");

exports.handle = async function (client, db, message, context) {
  if (!context.guild) return;
  if (message.author.bot) return;

  const bans = db.global.get("bans") || {};
  if (bans[context.user.id]) if (bot.debug_mode) return console.debug(`\x1b[33m[WARN]\x1b[0m GlobalChat: Ignoring banned user ${context.sender}`)

  const globalChannel = db.settings.get(context.guild.id, "globalChannel");
  if (!globalChannel || context.channel.id !== globalChannel) return false;
  const destinations = db.getBridgeChannels("globalChannel");

  try {
    for (const destination of destinations) {
      const reply = await context.fetchReply(message);
      const attachment = message.attachments?.first?.();
      const badges = [];

      const auth = require("../config/auth.json");
      const ownerID = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
      if (ownerID.includes(context.user.id)) badges.push(`👑`);

      const moderators = db.global.get("moderators") || [];
      if (moderators.includes(context.user.id)) badges.push(`🛡️`);

      let embed = {timestamp: new Date(), description: message.content};

      if (reply) {
        try {
          destination.fields(embed, [{name: `RE: ${reply.author}`, value: reply.text.slice(0, 1024)}]);
        } catch (err) {
          console.error(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Couldn't process original message`);
          console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
        }
      }

      if (attachment) {
        try {
          if (attachment.contentType?.startsWith("image/")) {
            context.image(embed, attachment.url);
          } else {
            context.fields(embed, [{name: "Attachment", value: attachment.url}]);
          }
        } catch (err) {
          console.error(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Couldn't read attachment`);
          console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
        }
      }

      destination.footer(embed, {
        text: `${context.guild.name} (${context.platform})`,
        icon_url: typeof context.guild?.iconURL === "function" ? context.guild.iconURL() : context.guild?.iconURL
      });

      destination.author(embed, {
        name: `${context.user.displayName} (@${context.sender}) ${badges.join("")} | ${context.user.id}`,
        icon_url: context.user.displayAvatarURL?.() ?? context.user?.avatarURL ?? undefined
      });
    
      await destination.send({embeds: [embed]});
    };
    console.log(`\x1b[36m[INFO]\x1b[0m GlobalChat: Successfully relayed message from ${context.sender} (${context.guild.name}, ${context.platform}) to the global chat`);
    try {
      await context.delete();
    } catch (err) {
      console.error(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Failed to delete originalMessage (${context.guild.name}, ${context.platform})`);
      console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Couldn't relay message`);
    technicalErr(client, context, message, err);
  }

  return true;
};