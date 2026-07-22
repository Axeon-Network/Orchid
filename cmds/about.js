const meta = {
  name: "about",
  description: "Get to know more about me!",
  usage: "about",
};
exports.meta = meta;

const { SlashCommandBuilder } = require("discord.js");
const bot = require("../config/config.json");
const core = require("../config/core.json");
const { MAJOR, MINOR } = require("../components/version.json");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, context) => {
    const devStage = core.devStage;
    const devStageLabel = devStage ? `(${core.devStage})` : '';

    const isDebug = bot.debug_mode;
    const label = isDebug ? "Checked" : "Retail";

      context.reply({embeds: [{
          color: color,
          author: {
          		name: `About ` + client.user.username,
	          	icon_url: client.user.displayAvatarURL(),
          	},
          description: `**${core.name}**, version v${MAJOR}.${MINOR} ${devStageLabel} (${label})\n` +
                       `(C) 2026 Axeon Network. All Rights Reserved.`,
          fields: [
            {
              name: "🔗 Links",
              value: "**Source Code:** [github.com/Axeon-Network/Orchid](https://github.com/Axeon-Network/Orchid)\n**More from the Axeon Network:** [axeon-network.github.io](https://axeon-network.github.io)",
              inline: true
            }
          ],
          footer: {
            text: `Made with <3 by AveryEclipse`
          }
          }]
      });
      };