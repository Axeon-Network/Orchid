const meta = {
  name: "settings",
  description: "View bot settings",
  usage: "settings"
};
exports.meta = meta;

const { SlashCommandBuilder } = require("discord.js");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, db, context) => {
  const config = db.settings.get(context.guild.id);

  let embed = {};

  context.author(embed, {
    name: `Settings for ${context.guild.name}`,
    icon_url: typeof context.guild?.iconURL === "function" ? context.guild.iconURL() : undefined
  });

  context.fields(embed, [
    {
      name: "🤖 Prefix",
      value: config.prefix,
      inline: true
    },
    {
      name: "💬 Global channel",
      value: `<#${config.globalChannel}>` || "None",
      inline: true
    },
    {
      name: "📣 Announcement channel",
      value: `<#${config.announcementChannel}>` || "None",
      inline: true
    },
    {
      name: "🍯 Honeypot channel",
      value: `<#${config.honeypotChannel}>` || "None",
      inline: true
    }
  ]),

  context.reply({embeds: [embed]});
};