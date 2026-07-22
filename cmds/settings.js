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

exports.execute = async (client, context) => {
    const config = client.settings.get(context.guild.id);

      context.reply({embeds: [{
          color: color,
          author: {
          		name: `Settings for ${context.guild.name}`,
	          	icon_url: context.guild.iconURL(),
          	},
          fields: [
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
            },
            {
              name: "🍯 Honeypot role",
              value: `<@&${config.honeypotRole}>` || "None",
              inline: true
            },
          ],
          }]
      });
      };