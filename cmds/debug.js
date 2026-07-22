const meta = {
  name: "debug",
  description: "View technical/debug bot information",
  usage: "debug",
};
exports.meta = meta;

const { SlashCommandBuilder, version } = require("discord.js");
const bot = require("../config/config.json");
const core = require("../config/core.json");
const { VERSION } = require("../components/version.json");

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, context) => {
    const devStage = core.devStage;

    function format(seconds){
      function pad(s){
        return (s < 10 ? '0' : '') + s;
      }
      var hours = Math.floor(seconds / (60*60));
      var minutes = Math.floor(seconds % (60*60) / 60);
      var seconds = Math.floor(seconds % 60);
    
      return pad(hours) + 'h ' + pad(minutes) + 'm ' + pad(seconds) + 's';
    }
    var uptime = process.uptime();

      context.reply({embeds: [{
          color: color,
          title: `🛠️ Debug`,
          fields: [
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
            {
              name: "🔘 Versions",
              value: `**Orchid Engine:** v${VERSION}\n**Discord.js:** v${version}\n**Node.js:** ${process.version}`,
              inline: false
            },
          ],
          ...(bot.debug_mode && {
           footer: { text: `Debug mode enabled` }
          })
          }]
      });
      };