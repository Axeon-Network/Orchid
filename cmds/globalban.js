const meta = {
  name: "globalban",
  description: "Ban an user from global chat",
  usage: "globalban <user> <reason>",
  ownerOnly: true
};
exports.meta = meta;

const bot = require("../config/config.json")
const { missingArgument } = require("../components/errorHandler");

exports.execute = async (client, db, context, args) => {
  const target = await context.getUser(args[0]);
  if (!target) return missingArgument("Who are you banning from the global chat?", context, meta);

  const moderators = db.global.get("moderators") || [];
  if (moderators.includes(target.id)) return context.reply("❌ You cannot globally ban a global moderator.");

  const reason = args.slice(1).join(" ");
  if (!reason) return missingArgument("Please explain why you are banning this user from the global chat.", context, meta);

  const bans = db.global.get("bans") || {};
  bans[target.id] = {reason, moderator: context.user.id, timestamp: Date.now()};
  db.global.set("bans", bans);

  let embed = {
    color: "#ff0000",
    title: `🚫 You've been banned from the global chat.`,
    description:  `An Orchid global moderator has banned you from the Global Chat.\n\n` +
                  `If you believe this was a wrong decision, [contact support](${bot.support_server}) to appeal.`,
    fields: [{name: "❓ Reason", value: reason.slice(0, 1024)}]
  }

  try {
    await target.send({embeds: [embed]});
  } catch (err) {
    if (bot.debug_mode) {
      console.debug(`\x1b[31m[ERROR]\x1b[0m GlobalChat: Failed to DM banned user ${target.username}`);
      console.debug(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
  }

  context.reply({embeds: [{
    color: "#00ff00",
    title: `✅ Success!`,
    description: `Banned **${target.username}** from global chat.`,
  }],
  });
}