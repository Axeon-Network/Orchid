const meta = {
  name: "setannounce",
  description: "Set an announcement channel",
  usage: "setannounce <channel>",
  adminOnly: true
};
exports.meta = meta;

const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { missingArgument } = require("../components/errorHandler");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Channel for announcements")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

exports.execute = async (client, db, context, args) => {
  const channel = await context.getChannel(args[0]);
  if (!channel) return missingArgument("What channel would you like to use as the announcement channel?", context, meta);

  db.settings.set(context.guild.id, channel.id, "announcementChannel");
  context.reply({embeds: [{
    color: "#00ff00",
    title: `✅ Success!`,
    description: `Set announcement channel to ${channel} for **${context.guild.name}**.`,
  }],
  });
}