

exports.missingPermission = function(ctx, meta) {
  if (meta.ownerOnly || !ctx.isOwner) log('debug', `Missing bot maintainer permission for ${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) while running ${meta.name}`);
  if (meta.globalOnly || !ctx.isGlobalMod) log('debug', `Missing global moderator permission for ${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) while running ${meta.name}`);
  if (meta.adminOnly || !ctx.isAdmin) log('debug', `Missing server administrator permission for ${ctx.sender} (${ctx.guild.name}, ${ctx.platform}) while running ${meta.name}`);
  ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ You don't have permission to use this command!`})]});
}

exports.missingArgument = function(description, ctx, meta) {
  log('debug', `Required arguments for ${meta.name} not passed`);
  ctx.reply({embeds: [ctx.embed({
    color: "#ff0000",
    title: `❓ Missing argument!`,
    description: `${description}\nUsage: \`${meta.name} ${meta.usage}\``,
    footer: {text: `<> = Required arguments`},
  })]});
}

exports.technicalErr = function(client, ctx, message, err) {
  log('error', err.stack);
  if (!logger) console.error(err.stack);
  ctx.reply({embeds: [ctx.embed({
    color: "#ff0000",
    title: `❌ Error!`,
    description: `I couldn't process this for you, due to a technical error!\nPlease contact support/raise a GitHub issue with the error below:\n\`\`\`xl\n${err}\n\`\`\``,
  })]});
}