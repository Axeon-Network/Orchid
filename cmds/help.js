const meta = {
  name: "help",
  description: "Display list of commands",
  usage: "help"
};
exports.meta = meta;

const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const bot = require("../config/config.json");
const auth = require("../config/auth.json");

exports.execute = async (client, context) => {
  const config = client.settings.get(context.guild.id);

  const admin = (context.member?.permissions?.has(PermissionFlagsBits.Administrator) || context.member.permissions.has(PermissionFlagsBits.ManageGuild)) ?? false;
  const owner = context.user.id === auth.discord_ownerID;

  const fields = [];

  for (const command of client.commands.values()) {

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
  
  let list = new EmbedBuilder()
    .setColor(color)
    .setTitle(`:grey_question: Help`)
    .setDescription(`My prefix on **${context.guild.name}** is **${config.prefix}** \nMy global prefix is **${bot.prefix}** \n[] = Optional arguments, <> = Required arguments`)
    .addFields(fields)
  context.user.send({embeds: [list]});
  
  let embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('You\'ve got mail! ✉️')
  context.reply({embeds: [embed]})
}