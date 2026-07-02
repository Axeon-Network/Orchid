const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "prefix",
  description: "Set a custom server-wide prefix",
  usage: "prefix <prefix>",
  adminOnly: true
};
exports.meta = meta;

exports.execute = async (client, context, args) => {
    client.config = bot;
    const guildConf = client.settings.get(context.guild.id);

        const admin = context.member.permissions.has(PermissionsBitField.Flags.Administrator) ?? false;
        if(!admin) return context.reply({embeds: [{
          color: 0xff0000,
          title: `:x: Error!`,
          description: `You don't have permission to use this command!`,
      }],
    });
        let prefix = args[0];
        if (!prefix) {
            return context.reply({embeds: [{
              color: 0xff0000,
              title: `:question: Missing argument!`,
              description: `Please tell me what prefix you want to use with this bot. \nUsage: \`${guildConf.prefix}prefix <prefix>\``,
              footer: {
                text: `<> = Required arguments`
              },
          }],
        });
        }
        client.settings.set(context.guild.id, prefix, "prefix")
        context.reply({embeds: [{
            color: 0x00ff00,
            title: `:white_check_mark: Success!`,
            description: `My prefix on this server is now \`${prefix}\``,
        }],
      });
    }