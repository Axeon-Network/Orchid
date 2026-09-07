const meta = {
  name: "settings",
  description: "View and change bot settings",
  category: "management",
  usage: "[setting] <value/none>"
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
  const settings = {
    globalChannel: {name: "💬 Global channel", type: "channel", required: false},
    announcementChannel: {name: "📣 Announcement channel", type: "channel", required: false},
    honeypotChannel: {name: "🍯 Honeypot channel", type: "channel", required: false},
    prefix: {name: "🤖 Prefix", type: "string", required: true},
  }

  const setting = args[0];
  const value = args[1];
  const definition = settings[setting];

  function displaySetting(setting, value) {
    if (value == null || value === "") return "None";
    if (settings[setting].type === "channel") return `<#${value}>`;
    return value;
  }

  if (!setting) {
    const fields = [];
    for (const [setting, definition] of Object.entries(settings)) {
      fields.push({name: definition.name, value: `\`${setting}\`\n` + displaySetting(setting, db.settings.get(ctx.guild.id)[setting]), inline: true});
    }
    ctx.reply({embeds: [ctx.embed({
      author: {
        name: `Settings for ${ctx.guild.name}`,
        icon_url: typeof ctx.guild?.iconURL === "function" ? ctx.guild.iconURL() : undefined
      },
      description: `To change a setting, run \`${db.settings.get(ctx.guild.id, "prefix")}${exports.meta.name} ${exports.meta.usage}\``,
      fields: fields
    })]});
    return;
  }

  if (!ctx.isAdmin && setting) return missingPermission(ctx, meta);
  if (!definition) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: "❌ Unknown setting"})]});
  if (!value) return missingArgument("Please provide what value you'd like to change this setting to", ctx, meta);

  let newValue = value;
  if (newValue.toLowerCase() === "none" && definition.required) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ This setting cannot be disabled`})]});

  if (value.toLowerCase() === "none") {
    newValue = null;
  } else if (definition.type === "channel") {
    const channel = await ctx.getChannel(value);
    if (!channel) return ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: "❌ Invalid channel"})]});
    newValue = channel.id;
  }

  try {
    db.settings.set(ctx.guild.id, newValue, setting);
    return ctx.reply({embeds: [ctx.embed({
      color: "#00ff00",
      title: `✅ Setting updated`,
      description: `New setting ${displaySetting(setting, newValue)} applied to \`${setting}\` for **${ctx.guild.name}**`})]});
  } catch (err) {
    return technicalErr(null, ctx, null, err);
  }
};