const meta = {
  name: "sethoneypot",
  description: "Set a honeypot channel (for auto-banning anyone sending a message in that channel)",
  usage: "sethoneypot <channel>",
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
      .setDescription("Channel to use as the honeypot channel")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );

exports.execute = async (client, context, args) => {
  const channel = context.options?.getChannel("channel") || context.guild.channels.cache.get(args[0]?.replace(/[<#>]/g, ""));
  if (!channel) return missingArgument("What channel would you like to use as the honeypot channel?", context, meta);
  
  client.settings.set(context.guild.id, channel.id, "honeypotChannel");
  context.reply({embeds: [{
    color: 0x00ff00,
    title: `✅ Success!`,
    description: `Set honeypot channel to ${channel} for **${context.guild.name}**.`,
  }],
  });
}