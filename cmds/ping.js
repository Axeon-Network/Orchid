const { SlashCommandBuilder } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "ping",
  description: "Pings the bot",
  usage: "ping"
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, context, args) => {
    client.config = bot;
    const guildConf = client.settings.get(context.guild.id);

    const start = Date.now()
    const message = await context.reply({
      embeds: [{
        color: color,
        title: `:ping_pong: Pinging...`,
      }],
      withResponse: true
    });

    const edit =
      message?.edit
        ? (content) => message.edit(content)
        : (content) => context.edit(content);

    edit({embeds: [{
      color: color,
      title: `:ping_pong: Pong!`,
      description: `This took me ${Date.now() - start}ms. The API latency is ${Math.round(client.ws.ping)}ms`,
      ...(bot.debug_mode && {
        footer: { text: `Debug mode enabled` }
      })
    }]
  });
}
