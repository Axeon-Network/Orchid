const meta = {
  name: "sethoneypotrole",
  description: "Set a honeypot role (for auto-banning anyone assigning this role)",
  usage: "sethoneypotrole <role>",
  adminOnly: true
};
exports.meta = meta;

const { SlashCommandBuilder } = require("discord.js");
const { missingArgument } = require("../components/errorHandler");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addRoleOption(option =>
    option
      .setName("role")
      .setDescription("Role to use as the honeypot role")
      .setRequired(true)
  );

exports.execute = async (client, context, args) => {
  const role = context.options?.getRole("role") || context.guild.roles.cache.get(args[0]?.replace(/[<@&>]/g, ""));
  if (!role) return missingArgument("What role would you like to use as the honeypot role?", context, meta);

  client.settings.set(context.guild.id, role.id, "honeypotRole");
  context.reply({embeds: [{
    color: 0x00ff00,
    title: `✅ Success!`,
    description: `Set honeypot role to ${role} for **${context.guild.name}**.`,
  }],
  });
}