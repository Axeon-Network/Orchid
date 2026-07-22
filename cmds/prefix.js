const meta = {
  name: "prefix",
  description: "Set a custom server-wide prefix",
  usage: "prefix <prefix>",
  adminOnly: true
};
exports.meta = meta;

const { SlashCommandBuilder } = require("discord.js");
const { missingArgument } = require("../components/errorHandler");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addStringOption(option =>
    option
      .setName("prefix")
      .setDescription("Custom prefix")
      .setRequired(true)
  );

exports.execute = async (client, context, args) => {
  const prefix = args[0];
  if (!prefix) return missingArgument("What prefix do you want to use with this bot?", context, meta);

  client.settings.set(context.guild.id, prefix, "prefix");
  context.reply({embeds: [{
    color: 0x00ff00,
    title: `✅ Success!`,
    description: `Set prefix to \`${prefix}\` for **${context.guild.name}**`,
  }],
  });
}