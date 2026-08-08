const { missingPermission, technicalErr } = require("./errorHandler");

exports.handle = async function (client, db, interaction, context) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {
    const commandFile = db.commands.get(command);

    const auth = require("../config/auth.json");
    const ownerID = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
    if (
      (commandFile.meta.adminOnly && !(context.admin))
    ) return missingPermission(context, commandFile.meta);
    if (
      (commandFile.meta.ownerOnly && !ownerID.includes(context.user.id))
    ) return missingPermission(context, commandFile.meta);

    await commandFile.execute(client, db, context, []);
    console.log(`\x1b[36m[INFO]\x1b[0m ${context.sender} (${context.guild.name}, ${context.platform}) ran ${command}`);
  } catch (err) {
    console.log(`\x1b[31m[ERROR]\x1b[0m Failed to process ${command}, ran by ${context.sender} (${context.guild.name}, ${context.platform}).`);
    technicalErr(client, context, null, err); // this was a fucking PAIN it took me 5 hours to get working
  }
  return true;
}