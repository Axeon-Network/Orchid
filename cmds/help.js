const meta = {
  name: "help",
  description: "Display list of commands",
  usage: "help"
};
exports.meta = meta;

const bot = require("../config/config.json");
const auth = require("../config/auth.json");

exports.execute = async (client, db, context) => {
  const config = db.settings.get(context.guild.id);

  const admin = context.admin;
  const ownerID = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
  const owner = ownerID.includes(context.user.id);

  const fields = [];

  for (const command of db.commands.values()) {

    const meta = command.meta;
    if (!meta) continue;

    if (meta.adminOnly && !admin) continue;
    if (meta.ownerOnly && !owner) continue;

    fields.push({
      name: meta.name,
      value: `${meta.description}\n**Usage:** \`${meta.usage}\``,
      inline: true
    });
  }

  let list = {
    title: `❔ Help`,
    description: `My prefix on **${context.guild.name}** is **${config.prefix}** \nMy global prefix is **${bot.prefix}** \n[] = Optional arguments, <> = Required arguments`
  }
  context.fields(list, fields);
  context.dm({embeds: [list]});
  
  let embed = {title: `✉️ You've got mail!`}
  context.reply({embeds: [embed]})
}