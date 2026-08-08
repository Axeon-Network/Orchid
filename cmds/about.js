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

exports.execute = async (client, db, context) => {
  const devStage = core.dev_stage;
  const devStageLabel = devStage ? `(${core.dev_stage})` : '';

  const isDebug = bot.debug_mode;
  const label = isDebug ? "Checked" : "Retail";

  let embed = {
    description: `**${core.name}**, version ${MAJOR}.${MINOR} ${devStageLabel} (${label})\n` +
                 `(C) 2026 Axeon Network. All Rights Reserved.\n\n` +
                 `Instance maintained by <@${context.maintainer}>`
  }

  context.author(embed, {
      name: `About ` + context.clientUser?.username ?? core.name,
      icon_url: context.clientUser.displayAvatarURL?.() ?? context.clientUser?.avatarURL ?? undefined
    });

  context.fields(embed, [{
      name: "🔗 Links",
      value: `**Support Server:** [click here!](${bot.support_server})\n**Source Code:** [github.com/Axeon-Network/Orchid](https://github.com/Axeon-Network/Orchid)\n**More from the Axeon Network:** [axeon-network.github.io](https://axeon-network.github.io)`,
      inline: true
    }])

  context.reply({embeds: [embed]});
};