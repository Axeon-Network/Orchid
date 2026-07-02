const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "setannounce",
  description: "Set an announcement channel",
  usage: "setannounce <channel>",
  adminOnly: true
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addChannelOption(option =>
    option
      .setName("channel")
      .setDescription("Channel for announcements")
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
              description: `You're not announcing to the moon, right? \nUsage: \`${guildConf.prefix}setannounce <channel>\``,
              footer: {
                text: `<> = Required arguments`
              },
          }],
        });
        }
        client.settings.set(context.guild.id, channel.id, "announcementChannel")
        context.reply({embeds: [{
            color: 0x00ff00,
            title: `:white_check_mark: Success!`,
            description: `Set announcement channel to ${channel} for **${context.guild.name}**.`,
        }],
      });
    }