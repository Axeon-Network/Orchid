const { SlashCommandBuilder, version } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "about",
  description: "Get to know more about me!",
  usage: "about",
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description);

exports.execute = async (client, context) => {
    client.config = bot;
    const guildConf = client.settings.get(context.guild.id);

    const devStage = core.dev_stage;
    const devStageLabel = devStage ? `(${core.dev_stage})` : '';

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
          author: {
          		name: `About ${client.user.username} ${devStageLabel}`,
	          	icon_url: client.user.displayAvatarURL(),
          	},
          fields: [
            {
              name: "Links",
              value: "**Source Code:** [github.com/Axeon-Network/orchid](https://github.com/Axeon-Network/orchid)\n**More from the Axeon Network:** [axeon-network.github.io](https://axeon-network.github.io)",
              inline: true
            },
              {
                name: "Versions",
                value: `**Orchid Engine:** v${core.version} *(Build ${core.build})*\n**Discord.js:** v${version}\n**Node.js:** ${process.version}`,
                inline: true
              },
          ],
          footer: {
            text: `Made with <3 by AveryEclipse - Uptime: ${format(uptime)}`
          }
          }]
      });
      };