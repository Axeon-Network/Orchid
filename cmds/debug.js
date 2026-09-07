const fs = require("fs");
const path = require("path");

const { PTH_VERSION } = require("../components/version.json");
const { version } = require("discord.js");
const stoatVersion = JSON.parse(fs.readFileSync(path.join(__dirname, "../node_modules/stoat.js/package.json"),"utf8")).version;

const meta = {
  name: "debug",
  description: "View technical/debug bot information",
  category: "general",
};
exports.meta = meta;

exports.execute = async (client, db, ctx) => {
  function format(seconds) {
    function pad(s){return (s < 10 ? '0' : '') + s}

    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);
    
    return pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
  }
  var uptime = process.uptime();

  ctx.reply({embeds: [ctx.embed({
    author: {
      name: ctx.clientUser.username,
      icon_url: typeof ctx.clientUser?.displayAvatarURL === "function" ? ctx.clientUser.displayAvatarURL() : undefined
    },
    fields: [
      {
        name: "🔘 Versions",
        value: `**${core.shortName} Engine:** v${PTH_VERSION}\n**Discord.js:** v${version}\n**Stoat.js:** v${stoatVersion}\n**Node.js:** ${process.version}`,
        inline: false
      },
      {
        name: "🕒 Uptime",
        value: format(uptime),
        inline: true
      },
      {
        name: "🖥️ RAM usage",
        value: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + `MB`,
        inline: true
      },
    ]
  })]});
};