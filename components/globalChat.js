exports.handle = async function (client, db, message, ctx) {
  if (!ctx.guild) return;
  if (message.author.bot) return;

  const bans = db.global.get("bans") || {};
  if (bans[ctx.user.id]) return log('warn', `GlobalChat: Ignoring banned user ${ctx.sender}`);

  const globalChannel = db.settings.get(ctx.guild.id, "globalChannel");
  if (!globalChannel || ctx.channel.id !== globalChannel) return false;
  const destinations = db.getBridgeChannels("globalChannel");
  log('debug', `GlobalChat: Channel: ${globalChannel}`)

  try {
    for (const destination of destinations) {
      const reply = await ctx.fetchReply(message);
      const attachment = message.attachments?.first?.();
      const badges = [];

      if (ctx.isOwner) {
        log('debug', `GlobalChat: User ${ctx.sender} is a bot maintainer, appending maintainer badge`);
        badges.push(`👑`);
      }

      if (ctx.isGlobalMod) {
        log('debug', `GlobalChat: User ${ctx.sender} is a global moderator, appending moderator badge`);
        badges.push(`🛡️`);
      }

      let embed = {
        author: { // no fluxer for some reason wont fallback to username if no display name is set, so we fallback ourselves
          name: `${ctx.user?.displayName ?? ctx.user?.globalName ?? ctx.user.username} (@${ctx.sender}) ${badges.join("")} | ${ctx.user.id}`,
          icon_url: ctx.user.displayAvatarURL?.() ?? ctx.user?.avatarURL ?? undefined
        },
        description: message.content,
        timestamp: new Date(),
        footer: {
          text: `${ctx.guild.name} (${ctx.platform})`,
          icon_url: typeof ctx.guild?.iconURL === "function" ? ctx.guild.iconURL() : ctx.guild?.iconURL
        }
      };

      if (reply) {
        log('debug', `GlobalChat: Message by user ${ctx.sender} is a reply to message by user ${reply.author}`);
        try {
          embed = ({...embed, fields: [{name: `RE: ${reply.author}`, value: reply.text.slice(0, 1024)}]});
        } catch (err) {
          technicalErr(`GlobalChat: Couldn't process original message`, client, ctx, message, err);
        }
      }

      if (attachment) {
        log('debug', `GlobalChat: Attachment detected: ${attachment.url}`);
        try {
          if (attachment.contentType?.startsWith("image/")) {
            embed = ({...embed, image: {url: attachment.url}});
          } else {
            embed = ({...embed, fields: [{name: "🖼️ Attachment", value: attachment.url}]});
          }
        } catch (err) {
          technicalErr(`GlobalChat: Couldn't read attachment`, client, ctx, message, err);
        }
      }
    
      embed = destination.embed(embed);
      await destination.send({embeds: [embed]});
    };
    log('info', `GlobalChat: Successfully relayed message from ${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) to the global chat`);

    try {
      await ctx.delete();
    } catch (err) {
      technicalErr(`GlobalChat: Failed to delete original message (${ctx.guild.name}, ${ctx.platform})`, client, ctx, message, err);
    }
  } catch (err) {
    technicalErr(`GlobalChat: Couldn't relay message`, client, ctx, message, err);
  }

  return true;
};