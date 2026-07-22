const bot = require("../config/config.json");
const auth = require("../config/auth.json");

exports.missingPermission = function(context, meta) {
  if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m Missing Administrator or Manage Server permission for ${context.user.tag} while running ${meta.name}`);
  context.reply({embeds: [{
    color: 0xff0000,
    title: `❌ Error!`,
    description: `You don't have permission to use this command!`,
    }],
  });
}

exports.missingArgument = function(description, context, meta) {
  if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m Required arguments for ${meta.name} not passed`);
  context.reply({embeds: [{
    color: 0xff0000,
    title: `❓ Missing argument!`,
    description: `${description}\nUsage: \`${meta.usage}\``,
    footer: {text: `<> = Required arguments`},
    }],
  });
}

exports.technicalErr = function(client, context, message, err) {
  const messageContent = context.command || message.content;

  console.log(`\x1b[31m[ERROR]\x1b[0m Failed to process ${messageContent}, ran by ${context.user.tag} (${context.guild}).`);
  console.error(`\x1b[31m[ERROR]\x1b[0m` + err)
    context.reply({embeds: [{
      color: 0xff0000,
      title: `❌ Error!`,
      description: `I couldn't process this for you, due to a technical error!`,
      footer: {
        text: `My maintainers have been notified.`
      }
      }],
    });
    client.users.fetch(auth.discord_ownerID, false).then((user) => {
      user.send({embeds: [{
          color: 0xff0000,
          title: `❌ There's a problem!`,
          description: `**${context.user.tag}** (${context.guild}) tried to run \`${messageContent}\`, but I was unable to process it for them! \n\`\`\`xl\n${err}\n\`\`\``,
      }],
    });
    });
}