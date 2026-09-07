exports.handle = async function (client, db, message, ctx) {
  if (!ctx.guild || ctx.user.bot) return;
  
  if (ctx.content.indexOf(db.settings.get(ctx.guild.id, "prefix")) !== 0) return;
  
  const args = ctx.content.slice(db.settings.get(ctx.guild.id, "prefix").length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  try {
    const commandFile = db.commands.get(command);
    if (!commandFile) return;

    if (
      (commandFile.meta.ownerOnly && !ctx.isOwner) ||
      (commandFile.meta.globalOnly && !ctx.isGlobalMod) ||
      (commandFile.meta.adminOnly && !ctx.isAdmin)
    ) return missingPermission(ctx, commandFile.meta);

    await commandFile.execute(client, db, ctx, args);
    log('info', `${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) ran ${command}`);
  } catch (err) {
    log('error', `Couldn't process ${command} as requested by ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);
    technicalErr(client, ctx, message, err);
  }
  log('debug', `Processed message content: ${ctx.content}`)
  return true;
}