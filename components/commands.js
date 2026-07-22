const { missingPermission, technicalErr } = require("./errorHandler.js");

exports.handle = async function (client, message) {
  if (!message.guild || message.author.bot) return;
  const config = client.settings.get(message.guild.id);
  if (message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const context = {
    reply: (content) => message.channel.send(content),
    edit: (content) => message.edit(content),
    member: await message.guild.members.fetch(message.author.id),
    user: message.author,
    guild: message.guild,
    channel: message.channel,
    attachments: message.attachments
  };
  
  try {
    const commandFile = client.commands.get(command);

    const auth = require("../config/auth.json");
    const { PermissionFlagsBits } = require('discord.js');
    if (
      (commandFile.meta.ownerOnly && context.user.id !== auth.discord_ownerID) ||
      (commandFile.meta.adminOnly && !(context.member.permissions.has(PermissionFlagsBits.Administrator) || context.member.permissions.has(PermissionFlagsBits.ManageGuild)))
    ) return missingPermission(context, commandFile.meta);

    commandFile.execute(client, context, args);
    console.log(`\x1b[36m[INFO]\x1b[0m ${context.user.tag} (${context.guild}) ran ${command}`);
  } catch (err) {
    technicalErr(client, context, message, err);
  }

  return true;
}