const bot = require("../config/config.json");

exports.missingPermission = function(context, meta) {
  if (meta.adminOnly) if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m Missing Administrator or Manage Server permission for ${context.sender} while running ${meta.name}`);
  if (meta.ownerOnly) if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m Failed to run ${meta.name} for ${context.sender}; not a bot maintainer.`);
  context.reply({embeds: [{
    color: "#ff0000",
    title: `❌ Error!`,
    description: `You don't have permission to use this command!`,
    }],
  });
}

exports.missingArgument = function(description, context, meta) {
  if (bot.debug_mode) console.debug(`\x1b[31m[ERROR]\x1b[0m Required arguments for ${meta.name} not passed`);
  context.reply({embeds: [{
    color: "#ff0000",
    title: `❓ Missing argument!`,
    description: `${description}\nUsage: \`${meta.usage}\``,
    footer: {text: `<> = Required arguments`},
    }],
  });
}

exports.technicalErr = function(client, context, message, err) {
  console.error(`\x1b[31m[ERROR]\x1b[0m ` + err.stack)
  context.reply({embeds: [{
    color: "#ff0000",
    title: `❌ Error!`,
    description: `I couldn't process this for you, due to a technical error!\nPlease contact support/raise a GitHub issue with the error below:\n\`\`\`xl\n${err}\n\`\`\``,
  }]});
}