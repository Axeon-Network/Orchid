const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "setglobal",
  description: "Set a global channel",
  usage: "setglobal <channel>",
  adminOnly: true
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Channel to use for the global chat")
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  );


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
        const channel =
          context.options?.getChannel("channel") || 
          context.guild.channels.cache.get(args[0]?.replace(/[<#>]/g, ""));
        if (!channel) {
            return context.reply({embeds: [{
              color: 0xff0000,
              title: `:question: Missing argument!`,
              description: `What channel would you like to use for the global chat? \nUsage: \`${guildConf.prefix}setglobal <channel>\``,
              footer: {
                text: `<> = Required arguments`
              },
          }],
        });
        }
        client.settings.set(context.guild.id, channel.id, "globalChannel")
        context.reply({embeds: [{
            color: 0x00ff00,
            title: `:white_check_mark: Success!`,
            description: `Set global channel to ${channel} for **${context.guild.name}**.`,
        }],
      });
    }