const meta = {
  name: "about",
  description: "Get to know more about the bot!",
  category: "general",
};
exports.meta = meta;

exports.execute = async (client, db, ctx) => {
  const { PTH_MAJOR, PTH_MINOR, PTH_BUILD, PTH_VERSION } = require("../components/version.json");

  const fs = require("fs");
  const path = require("path");

  const { version: discordVersion } = require("discord.js");
  const stoatVersion = JSON.parse(fs.readFileSync(path.join(__dirname, "../node_modules/stoat.js/package.json"),"utf8")).version;
  const fluxerVersion = JSON.parse(fs.readFileSync(path.join(__dirname, "../node_modules/@fluxerjs/core/package.json"),"utf8")).version;

  ctx.reply({embeds: [ctx.embed({
    author: {
      name: `About ${ctx.clientUser.username}`,
      icon_url: typeof ctx.clientUser?.displayAvatarURL === "function" ? ctx.clientUser.displayAvatarURL() : undefined
    },
    description: `**${core.name}**, version ${PTH_MAJOR}.${PTH_MINOR} (Build ${PTH_BUILD}) ${core.devStage ? `(${core.devStage})`: ''}\n` +
                 `(C) 2026 Axeon Network. All Rights Reserved.\n\n` +
                 `Instance maintained by <@${ctx.maintainer}>`,
    fields: [
      {
        name: "🔘 Versions",
        value: `**Node.js:** ${process.version}\n` +
               `**Discord.js:** v${discordVersion}\n` +
               `**Stoat.js:** v${stoatVersion}\n` +
               `**Fluxer.js:** v${fluxerVersion}`,
        inline: true
      },
      {
        name: "🔗 Links",
        value: `**Report bugs/issues:** [github.com/Axeon-Network/Orchid/issues](https://github.com/Axeon-Network/Orchid/issues)\n` + 
               `**Source Code:** [github.com/Axeon-Network/Orchid](https://github.com/Axeon-Network/Orchid)\n` +
               `**More from the Axeon Network:** [axeon-network.github.io](https://axeon-network.github.io)`,
        inline: true
      },
    ],
    ...(isDebug && {footer: {text: `For testing purposes only. Version ${PTH_VERSION}`}})
  })]});
};