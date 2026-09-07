const meta = {
  name: "rmmod",
  description: "Remove an user from global moderators",
  category: "management",
  usage: "<user>",
  ownerOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const target = await ctx.getUser(args[0]);
  if (!target) return missingArgument("Who are you removing from global chat moderators?", ctx, meta);

  const auth = require("../config/auth.json");
  const ownerAccts = [auth.discord_ownerID, auth.stoat_ownerID].filter(Boolean);
  if (ownerAccts.includes(target.id)) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ You cannot remove the bot maintainer from global chat moderators!`})]});

  const moderator = db.global.get("moderators") || {};
  if (!moderator[target.id]) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ That user is not a global chat moderator!`})]});
  delete moderator[target.id];
  db.global.set("moderators", moderator);

  ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Removed ${target.username} from global moderators`})]});
}