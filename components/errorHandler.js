const fs = require('fs');

const bot = require("../config/config.json");
const core = require("../config/core.json");

function displayErr(client, context, message, err) {
  const messageContent = context.command || message.content;

  console.log(`\x1b[31m[ERROR]\x1b[0m Failed to process ${messageContent}, ran by ${context.user.tag} (${context.guild}).`);
  console.error(`\x1b[31m[ERROR]\x1b[0m` + err)
    context.reply({embeds: [{
      color: 0xff0000,
      title: `:x: Error!`,
      description: `I couldn't process this for you, due to a technical error!`,
      footer: {
        text: `My maintainers have been notified.`
      }
      }],
    });
    client.users.fetch(bot.ownerID, false).then((user) => {
      user.send({embeds: [{
          color: 0xff0000,
          title: `:x: There's a problem!`,
          description: `**${context.user.tag}** (${context.guild}) tried to run \`${messageContent}\`, but I was unable to process it for them! \n\`\`\`xl\n${err}\n\`\`\``,
      }],
    });
      });
  }

module.exports = {
    displayErr
}