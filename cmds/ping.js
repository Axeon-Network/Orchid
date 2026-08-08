const meta = {
  name: "ping",
  description: "Pings the bot",
  usage: "ping"
};
exports.meta = meta;

const { SlashCommandBuilder } = require("discord.js");
const bot = require("../config/config.json");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, db, context) => {
    const start = Date.now()
    const message = await context.reply({
      embeds: [{
        title: `🏓 Pinging...`,
      }],
      withResponse: true
    });
    
    const response = {
      embeds: [{
      title: `🏓 Pong!`,
      description: `This took me ${Date.now() - start}ms. The API latency is ${Math.round(client.ws.ping)}ms`,
      ...(bot.debug_mode && {
        footer: { text: `Debug mode enabled` }
      })}]
    }

if (response.embeds) {
  // temporary until this is refactored this into a single embed generator function
  for (const embed of response.embeds) {
    if (context.platform === "discord") {
      function hexToInt(hex) { // ditto with bot.js
         if (!hex || typeof hex !== "string") return 0;
        return parseInt(hex.replace('#', ''), 16);
      }
      embed.color = hexToInt(bot.color);
    }
    else if (context.platform === "stoat") {
      embed.colour = embed.color ?? bot.color;
      delete embed.color;
    }
  }
}

    await message.edit(response);
}
