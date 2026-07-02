const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const Enmap = require('enmap');
const bot = require("../config/config.json");
const core = require("../config/core.json");

const meta = {
  name: "announce",
  description: "Send an announcement to all configured servers",
  usage: "announce <text> [media]",
  adminOnly: true
};
exports.meta = meta;

exports.data = new SlashCommandBuilder()
  .setName(meta.name)
  .setDescription(meta.description)
  .addStringOption(option =>
    option
      .setName("text")
      .setDescription("Announcement message")
      .setRequired(true)
  )
  .addAttachmentOption(option =>
  option
      .setName("media")
      .setDescription("Optional image/video")
      .setRequired(false)
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
          const text =
             context.options?.getString("text") ||
             args.join(" ");
          const attachment =
            context.options?.getAttachment?.("media") ||
            context.attachments?.first?.();
          
        if (!text) {
            return context.reply({embeds: [{
              color: 0xff0000,
              title: `:question: Missing argument!`,
              description: `What do YOU wanna announce? \nUsage: \`${guildConf.prefix}announce <text>\``,
              footer: {
                text: `<> = Required arguments`
              },
          }],
        });
        }
          const guilds = client.guilds.cache;

  for (const guild of guilds.values()) {
    try {
      const channelId = client.settings.get(
        guild.id,
        "announcementChannel"
      );

      if (!channelId) continue;

      const channel = guild.channels.cache.get(channelId);
      if (!channel) continue;

      let embed = {
            color: color,
            author: {
          		name: `Global announcement from ${context.user.displayName}`,
	          	icon_url: context.user.displayAvatarURL(),
          	},
            timestamp: new Date(),
            description: text,
        }

        if (attachment) {
     if (attachment.contentType?.startsWith("image/")) {
    embed.image = {
      url: attachment.url
    };
  } else {
    embed.fields = [
      {
        name: "Attachment",
        value: attachment.url
      }
    ];
  }
}

      await channel.send({embeds: [embed],
      });

    } catch (err) {
                return context.reply({embeds: [{
            color: 0xff0000,
            title: `:x: Error!`,
            description: `Couldn't send announcement`,
        }],
      });
    }
  }

        context.reply({embeds: [{
            color: 0x00ff00,
            title: `:white_check_mark: Success!`,
            description: `Sent global announcement.`,
        }],
      });
    }