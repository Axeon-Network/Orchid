const { missingPermission, technicalErr } = require("./errorHandler");

exports.handle = async function (client, db, message, context) {
  if (!context.guild || context.author.bot) return;
  const config = db.settings.get(context.guild.id);
  if (context.content.indexOf(config.prefix) !== 0) return;
  
  const args = context.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  try {
    const commandFile = db.commands.get(command);
    if (!commandFile) return;

    const auth = require("../config/auth.json");
    const ownerID = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
    if (
      (commandFile.meta.adminOnly && !(context.admin))
    ) return missingPermission(context, commandFile.meta);
    if (
      (commandFile.meta.ownerOnly && !ownerID.includes(context.user.id))
    ) return missingPermission(context, commandFile.meta);

    await commandFile.execute(client, db, context, args);
    console.log(`\x1b[36m[INFO]\x1b[0m ${context.sender} (${context.guild.name}, ${context.platform}) ran ${command}`);
  } catch (err) {
    console.log(`\x1b[31m[ERROR]\x1b[0m Failed to process ${context.content}, ran by ${context.sender} (${context.guild.name}, ${context.platform}).`);
    technicalErr(client, context, message, err);
  }

  return true;
}