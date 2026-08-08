const meta = {
  name: "globalunban",
  description: "Unban an user from global chat",
  usage: "globalunban <user>",
  ownerOnly: true
};
exports.meta = meta;

const { missingArgument } = require("../components/errorHandler");

exports.execute = async (client, db, context, args) => {
  const target = await context.getUser(args[0]);
  if (!target) return missingArgument("Who are you unbanning from the global chat?", context, meta);

  const bans = db.global.get("bans") || {};
  if (!bans[target.id]) return context.reply("❌ That user is not banned from the global chat.");
  delete bans[target.id];

  db.global.set("bans", bans);

  context.reply({embeds: [{
    color: "#00ff00",
    title: `✅ Success!`,
    description: `Unbanned **${target.username}** from global chat.`,
  }],
  });
}