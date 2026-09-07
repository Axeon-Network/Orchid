const meta = {
  name: "help",
  description: "Display list of commands",
  category: "general"
};
exports.meta = meta;

exports.execute = async (client, db, ctx) => {
  const categories = {};
  const embeds = [];

  for (const command of db.commands.values()) {
    const category = command.meta.category ?? "Other";
    if (!categories[category]) categories[category] = [];

    if (command.meta.ownerOnly && !ctx.isOwner) continue;
    if (command.meta.globalOnly && !ctx.isGlobalMod) continue;
    if (command.meta.adminOnly && !ctx.isAdmin) continue;

    categories[category].push(command);
  };

  const main = ctx.embed({
    title: `❔ Help`,
    description: `My prefix on **${ctx.guild.name}** is **${db.settings.get(ctx.guild.id, "prefix")}**\n` +
                 `My global prefix is **${bot.prefix}**\n` +
                 `<> = Required arguments, [] = Optional arguments`
  });
  embeds.push(main);

  for (const [category, commands] of Object.entries(categories)) {
    const categoryNames = {
      general: "🤖 General",
      management: "🛠️ Management",
    };

    const list = ctx.embed({
      title: categoryNames[category] ?? category,
      fields: commands.map(command => ({
        name: command.meta.name,
        value: `${command.meta.description}\n**Usage:** \`${command.meta.name}${command?.meta?.usage ? ` ${command.meta.usage}` : ''}\``,
        inline: true
      }))
    });
    embeds.push(list);
  };

  ctx.dm({embeds});
  try {ctx.react('✉️')} catch {};
};