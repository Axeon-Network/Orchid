const meta = {
  name: "globalban",
  description: "Ban an user from global chat",
  category: "management",
  usage: "<user> <reason>",
  globalOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const target = await ctx.getUser(args[0]);
  if (!target) return missingArgument("Who are you banning from the global chat?", ctx, meta);

  const auth = require("../config/auth.json");
  const ownerAccts = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
  if (ownerAccts.includes(target.id)) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ You cannot globally ban the bot maintainer!`})]});

  const moderators = db.global.get("moderators") || [];
  if (moderators.includes(target.id)) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ You cannot globally ban a global moderator!`})]});

  const reason = args.slice(1).join(" ");
  if (!reason) return missingArgument("Please explain why you are banning this user from the global chat.", ctx, meta);

  const bans = db.global.get("bans") || {};
  bans[target.id] = {reason, moderator: ctx.user.id, timestamp: Date.now()};
  db.global.set("bans", bans);

  let embed = ctx.embed({
    color: "#ff0000",
    title: `🚫 You've been banned from the global chat.`,
    description:  `An ${ctx.clientUser.username} global moderator has banned you from the Global Chat.\n\n` +
                  `If you believe this was a wrong decision, contact a global moderator to appeal.`,
    fields: [{name: "❓ Reason", value: reason.slice(0, 1024)}]
  });

  try {
    await ctx.dmUser(target, {embeds: [embed]});
  } catch (err) {
    log('debug', `GlobalChat: Failed to DM banned user ${target.username}`);
    log('debug', err)
  }

  ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Banned ${target.username} from global chat`})]});
}