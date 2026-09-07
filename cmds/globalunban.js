const meta = {
  name: "globalunban",
  description: "Unban an user from global chat",
  category: "management",
  usage: "<user>",
  globalOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const target = await ctx.getUser(args[0]);
  if (!target) return missingArgument("Who are you unbanning from the global chat?", ctx, meta);

  const bans = db.global.get("bans") || {};
  if (!bans[target.id]) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ That user is not banned from the global chat!`})]});
  delete bans[target.id];

  db.global.set("bans", bans);

  ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Unbanned ${target.username} from global chat`})]});
}