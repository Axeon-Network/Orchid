const meta = {
  name: "debug",
  description: "View technical/debug bot information",
  usage: "debug",
};
exports.meta = meta;

const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, version } = require("discord.js");
const core = require("../config/core.json");
const { VERSION } = require("../components/version.json");
const stoatVersion = JSON.parse(fs.readFileSync(path.join(__dirname, "../node_modules/stoat.js/package.json"),"utf8")).version;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, db, context) => {
  function format(seconds) {
    function pad(s){return (s < 10 ? '0' : '') + s}

    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);
    
    return pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
  }
  var uptime = process.uptime();

  let embed = {};

  context.author(embed, {
    name: context.clientUser?.username ?? core.name,
    icon_url: context.clientUser.displayAvatarURL?.() ?? context.clientUser?.avatarURL ?? undefined
  });

  context.fields(embed, [
    {
      name: "🔘 Versions",
      value: `**${core.short_name} Engine:** v${VERSION}\n**Discord.js:** v${version}\n**Stoat.js:** v${stoatVersion}\n**Node.js:** ${process.version}`,
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
  ]);


  context.reply({embeds: [embed]});
};