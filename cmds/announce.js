const meta = {
  name: "announce",
  description: "Send an announcement to all configured servers",
  category: "management",
  usage: "<text> [media]",
  globalOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const text = ctx.options?.getString("text") || args.join(" ");
  const attachment = ctx.options?.getAttachment?.("media") || ctx.attachments?.first?.();
  if (!text) return missingArgument("What do you wanna announce?", ctx, meta);

  const destinations = db.getBridgeChannels("announcementChannel");

  try {
    for (const destination of destinations) {
      let embed = {
        author: {
          name: `Global announcement from ${ctx.user?.displayName ?? ctx.user?.globalName ?? ctx.user.username}`,
	        icon_url: ctx.user.displayAvatarURL?.() ?? ctx.user?.avatarURL ?? undefined
        },
        description: text,
        timestamp: new Date(),
      };
      
      if (attachment) {
        try {
          if (attachment.contentType?.startsWith("image/")) {
            embed = ({...embed, image: {url: attachment.url}});
          } else {
            embed = ({...embed, fields: [{name: "Attachment", value: attachment.url}]});
          }
        } catch (err) {
          technicalErr(client, ctx, null, err);
        }
      }

      embed = destination.embed(embed);
      await destination.send({embeds: [embed]});
    }
    return ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Sent global announcement`})]});
  } catch (err) {
    return technicalErr(client, ctx, null, err);
  }
}