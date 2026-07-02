const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "help",
  description: "Display list of commands",
  usage: "help"
};
exports.meta = meta;

exports.execute = async (client, context, args) => {
  client.config = bot;
  const guildConf = client.settings.get(context.guild.id);

  const admin = context.member?.permissions?.has(PermissionsBitField.Flags.Administrator) ?? false;
  const owner = context.user.id === bot.ownerID;

  const fields = [];

  for (const command of client.commands.values()) {

    const meta = command.meta;
    if (!meta) continue;

    if (meta.adminOnly && !admin) continue;
    if (meta.ownerOnly && !owner) continue;

    fields.push({
      name: meta.name,
      value: `${meta.description}\n**Usage:** \`${guildConf.prefix}${meta.usage}\``,
      inline: true
    });
  }
  
  let list = new EmbedBuilder()
    .setColor(color)
    .setTitle(`:grey_question: Help`)
    .setDescription(`My prefix on **${context.guild.name}** is **${guildConf.prefix}** \nMy global prefix is **${bot.prefix}** \n[] = Optional arguments, <> = Required arguments`)
    .addFields(fields)
  context.user.send({embeds: [list]});
  
  let embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('You\'ve got mail! ✉️')
  context.reply({embeds: [embed]})
}