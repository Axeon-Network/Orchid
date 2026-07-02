const { SlashCommandBuilder } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "settings",
  description: "View bot settings",
  usage: "settings"
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, context, args) => {
    client.config = bot;
    const guildConf = client.settings.get(context.guild.id);

      context.reply({embeds: [{
          color: color,
          author: {
          		name: `Settings for ${context.guild.name}`,
	          	icon_url: context.guild.iconURL(),
          	},
          fields: [
            {
              name: "Prefix",
              value: guildConf.prefix,
              inline: true
            },
            {
              name: "Global channel",
              value: guildConf.globalChannel || "None",
              inline: true
            },
            {
              name: "Announcement channel",
              value: guildConf.announcementChannel || "None",
              inline: true
            },
          ],
          }]
      });
      };