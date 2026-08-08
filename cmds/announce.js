const meta = {
  name: "announce",
  description: "Send an announcement to all configured servers",
  usage: "announce <text> [media]",
  adminOnly: true
};
exports.meta = meta;

const { missingArgument } = require("../components/errorHandler");

const { SlashCommandBuilder } = require("discord.js");
exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addStringOption(option =>
    option
      .setName("text")
      .setDescription("Announcement message")
      .setRequired(true)
  )
  .addAttachmentOption(option =>
  option
    .setName("media")
    .setDescription("Optional image/video")
    .setRequired(false)
  );

exports.execute = async (client, db, context, args) => {
  const text = context.options?.getString("text") || args.join(" ");
  const attachment = context.options?.getAttachment?.("media") || context.attachments?.first?.();
  if (!text) return missingArgument("What do you wanna announce?", context, meta);

  const destinations = db.getBridgeChannels("announcementChannel");

  for (const destination of destinations) {
    try {
      let embed = {timestamp: new Date(), description: text};

      destination.author(embed, {
        name: `Global announcement from ${context.user.displayName}`,
	      icon_url: context.user.displayAvatarURL?.() ?? context.user?.avatarURL ?? undefined
      });
      
      if (attachment) {
        try {
          if (attachment.contentType?.startsWith("image/")) {
            context.image(embed, attachment.url);
          } else {
            context.fields(embed, [{name: "Attachment", value: attachment.url}]);
          }
        } catch (err) {
          console.error(`\x1b[31m[ERROR]\x1b[0m Announce: Couldn't read attachment`);
          console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
        }
      }

      await destination.send({embeds: [embed]});
    } catch (err) {
      context.reply({embeds: [{
        color: "#ff0000",
        title: `❌ Error!`,
        description: `Couldn't send announcement`,
      }]});
      console.error(`\x1b[31m[ERROR]\x1b[0m Announce: Couldn't send announcement`);
      console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
      return;
    }
  }

  context.reply({embeds: [{
    color: "#00ff00",
    title: `✅ Success!`,
    description: `Sent global announcement.`,
  }]});
}