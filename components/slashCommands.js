const { missingPermission, technicalErr } = require("./errorHandler.js");

exports.handle = async function (client, interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const context = {
    reply: (content) => interaction.reply(content),
    edit: (content) => interaction.editReply(content),
    member: await interaction.guild.members.fetch(interaction.user.id),
    user: interaction.user,
    guild: interaction.guild,
    channel: interaction.channel,
    command: interaction.commandName,
    options: interaction.options
  };

  try {
    const commandFile = client.commands.get(command);

    const auth = require("../config/auth.json");
    const { PermissionFlagsBits } = require('discord.js');
    if (
      (commandFile.meta.ownerOnly && context.user.id !== auth.discord_ownerID) ||
      (commandFile.meta.adminOnly && !(context.member.permissions.has(PermissionFlagsBits.Administrator) || context.member.permissions.has(PermissionFlagsBits.ManageGuild)))
    ) return missingPermission(context, commandFile.meta);

    commandFile.execute(client, context, []);
     console.log(`\x1b[36m[INFO]\x1b[0m ${context.user.tag} (${context.guild}) ran ${interaction.commandName}`);
    } catch (err) {
      technicalErr(client, context, null, err); // this was a fucking PAIN it took me 5 hours to get working
    }

    return true;
}