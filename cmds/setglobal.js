const meta = {
  name: "setglobal",
  description: "Set a global channel",
  usage: "setglobal <channel>",
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
      .setDescription("Channel to use for the global chat")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

exports.execute = async (client, db, context, args) => {
  const channel = await context.getChannel(args[0]);
  if (!channel) return missingArgument("What channel would you like to use for the global chat?", context, meta);

  db.settings.set(context.guild.id, channel.id, "globalChannel");
  context.reply({embeds: [{
    color: "#00ff00",
    title: `✅ Success!`,
    description: `Set global channel to ${channel} for **${context.guild.name}**.`,
  }],
  });
}