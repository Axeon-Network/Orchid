exports.get = function (commandFiles) {
  const commands = [];
  
  const { SlashCommandBuilder } = require("discord.js");
  for (const file of commandFiles) {
    const command = require(`../cmds/${file}`);

    if (command.meta.ownerOnly || command.meta.globalOnly) continue;

    const data = command.data ?? new SlashCommandBuilder()
      .setName(command.meta.name)
      .setDescription(command.meta.description);

    commands.push(data.toJSON());
  }
  return commands;
}

exports.handle = async function (client, db, interaction, ctx) {
  if (!interaction.isChatInputCommand()) return;

  try {
    const commandFile = db.commands.get(interaction.commandName);

    if (
      (commandFile.meta.ownerOnly && !ctx.isOwner) ||
      (commandFile.meta.globalOnly && !ctx.isGlobalMod) ||
      (commandFile.meta.adminOnly && !ctx.isAdmin)
    ) return missingPermission(ctx, commandFile.meta);

    await commandFile.execute(client, db, ctx, []);
    log('info', `${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) ran ${interaction.commandName}`);
  } catch (err) {
    log('error', `Couldn't process ${interaction.commandName} as requested by ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);
    technicalErr(client, ctx, null, err); // this was a fucking PAIN it took me 5 hours to get working
  }
  log('debug', 'Processed slash command')
  return true;
}