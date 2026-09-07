const meta = {
  name: "ping",
  description: "Pings the bot",
  category: "general"
};
exports.meta = meta;

exports.execute = async (client, db, ctx) => {
  const start = Date.now()
  const message = await ctx.reply({embeds: [ctx.embed({title: `🏓 Pinging...`,})], withResponse: true});

  const response = {embeds: [ctx.embed({title: `🏓 This took me ${Date.now() - start}ms`})]};

  const edit = message?.edit ? (content) => message.edit(content) : (content) => ctx.edit(content);
  await edit(response);
}
