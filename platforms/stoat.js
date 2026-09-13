exports.platform = "Stoat";

exports.createCtx = async function(stoatClient, db, message) {
  return {
    reply: (content) => message.channel.sendMessage(content),
    dm: async (content) => {
      const dm = await message.author.openDM();
      return await dm.sendMessage(content);
    },
    dmUser: async (user, content) => {
      const dm = await user.openDM();
      return await dm.sendMessage(content);
    },
    edit: (content) => message.channel.edit(content),
    member: message.member,
    user: message.author,
    clientUser: stoatClient.user,
    sender: `${message.author.username}#${message.author.discriminator}`,
    maintainer: auth.stoat_ownerID,
    guild: message.server,
    channel: message.channel,
    attachments: message.attachments,
    mentions: message.mentioned,
    content: message.content,
    react: (emoji) => message.react(emoji),
    delete: () => message.delete(),

    isOwner: () => message.author.id === auth.stoat_ownerID,
    isGlobalMod: () => message.author.id === auth.stoat_ownerID || db.global.get("moderators")?.[message.author.id] === true,
    isAdmin: () => message.member.permissions.has("ManageServer"),

    getChannel: (arg) => {
      const id = arg?.replace(/[<#>]/g, "");
      return message.server.channels.find(channel => channel.id === id);
    },
    getUser: async (arg) => await stoatClient.users.fetch(arg?.replace(/[<@>]/g, "")).catch(() => null),

    embed: (data = {}) => {
      const embed = { ...data };

      embed.colour = embed.color ?? bot.color;
      delete embed.color;

      if (embed.author) {embed.title = embed.author.name; delete embed.author};
      if (embed.fields) {embed.description = [embed.description, embed.fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")].filter(Boolean).join("\n\n"); delete embed.fields};
      if (embed.footer) {embed.description = (embed.description ?? "") + `\n\n` + embed.footer.text; delete embed.footer};
      if (embed.image) {embed.image = { url: embed.image.url }};

      return embed;
    },
    fetchReply: async (message) => { 
      if (!message.replyIds?.length) return null; 
      const replied = await stoatClient.messages.fetch( message.channel.id, message.replyIds[0] ); 
      const embed = replied.embeds?.[0];

      let author = embed.title ?? "Unknown";
      author = author.split("(@")[1]?.split(")")[0].trim();

      let text = embed.description ?? "*No text*";
      text = text.split("\n\n*Sent from")[0].split("\n\n**RE:")[0].trim();

      return {author, text};
    },
    attachmentsToUrl: (message.attachments ?? []).map(a => a.previewUrl),

    platform: exports.platform,
    raw: {stoatClient, message}
  };
};

exports.getDestinations = function(stoatClient, db, setting) {
  const destinations = [];

  for (const server of stoatClient.servers.values()) {
    const channelId = db.settings.get(server.id, setting);
    if (!channelId) continue;

    const channel = server.channels.find(c => c.id === channelId);
    if (!channel) continue;

    destinations.push({
      platform: exports.platform,
      guild: server,
      channel,
      send: (content) => channel.sendMessage(content),
      embed: (data = {}) => {
        const embed = { ...data };

        embed.colour = embed.color ?? bot.color;
        delete embed.color;

        if (embed.fields) {
          embed.description = [embed.description, embed.fields.map(f => `**${f.name}**\n${f.value}`).join("\n\n")]
          .filter(Boolean).join("\n\n"); 
          delete embed.fields
        };
        if (embed.image) {embed.image = { url: embed.image.url }};
        if (embed.footer) {embed.description = (embed.description ?? "") + `\n\n*Sent from ${embed.footer.text}*`; delete embed.footer};
        if (embed.author) {        
          const [title, id] = embed.author.name.split(" | ");
          embed.title = title;
          if (id) {embed.description = (embed.description ?? "") + `\nID: ${id}`};
          delete embed.author;
        };
        // these HAVE to be in a specific order so that the global chat embed doesnt show weird on stoat.

      return embed;
      },
      fetch: async (message) => {
        const id = message.replyIds?.[0];
        if (!id) return null;
        return await stoatClient.messages.fetch(message.channel.id, id);
      },
    });
  }

  return destinations;
};