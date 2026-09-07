const meta = {
  name: "addmod",
  description: "Add an user to global moderators",
  category: "management",
  usage: "<user>",
  ownerOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const target = await ctx.getUser(args[0]);
  if (!target) return missingArgument("Who are you adding as a global chat moderator?", ctx, meta);

  const auth = require("../config/auth.json");
  const ownerAccts = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
  if (ownerAccts.includes(target.id)) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ That user is already a bot maintainer!`})]});

  const moderator = db.global.get("moderators") || {};
  if (moderator[target.id]) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ That user is already a global chat moderator!`})]});
  moderator[target.id] = true;
  db.global.set("moderators", moderator);

  ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Added ${target.username} to global moderators`})]});
}