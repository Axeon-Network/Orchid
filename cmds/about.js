const meta = {
  name: "about",
  description: "Get to know more about me!",
  category: "general",
};
exports.meta = meta;

exports.execute = async (client, db, ctx) => {
  const { PTH_MAJOR, PTH_MINOR } = require("../components/version.json");

  ctx.reply({embeds: [ctx.embed({
    author: {
      name: `About ` + ctx.clientUser.username,
      icon_url: typeof ctx.clientUser?.displayAvatarURL === "function" ? ctx.clientUser.displayAvatarURL() : undefined
    },
    description: `**${core.name}**, version ${PTH_MAJOR}.${PTH_MINOR} ${core.devStage ? `(${core.devStage})`: ''} ${process.env.WHD_BUILD_TYPE === 'chk' ? '(Checked)' : ''}\n` +
                 `(C) 2026 Axeon Network. All Rights Reserved.\n\n` +
                 `Instance maintained by <@${ctx.maintainer}>`,
    fields: [{
      name: "🔗 Links",
      value: `**Report bugs/issues:** [github.com/Axeon-Network/Orchid/issues](https://github.com/Axeon-Network/Orchid/issues)\n` + 
             `**Source Code:** [github.com/Axeon-Network/Orchid](https://github.com/Axeon-Network/Orchid)\n` +
             `**More from the Axeon Network:** [axeon-network.github.io](https://axeon-network.github.io)`,
      inline: true
    }],
  })]});
};