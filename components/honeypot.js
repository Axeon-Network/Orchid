function defineUserTypes(ctx, member) {
  if (member?.user?.bot) return "bot account";
  if (member?.id === ctx?.guild?.ownerId) return "server owner";
  if (ctx.isAdmin) return "staff member";
  return null;
}

exports.handle = async function (client, db, message, ctx) {
  if (ctx.user.id === ctx.clientUser.id && !ctx.guild) return; // the bot on its way to find a mystery honeypot inside stoat dms
  
  const honeypotChannel = db.settings.get(ctx.guild.id, "honeypotChannel");
  if (!honeypotChannel || ctx.channel.id !== honeypotChannel) return false;

  const privilegedUserType = defineUserTypes(ctx, ctx.member);
  if (privilegedUserType) return log('warn', `Honeypot: Ignoring ${privilegedUserType} ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);

  if (!ctx.member?.bannable ?? !ctx.clientUser?.permissions?.has("BanMembers")) return log('error', `Honeypot: Missing permission to ban ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);

  const lines = [];
  if (ctx.content) lines.push(ctx.content);
  for (const url of ctx.attachmentsToUrl) lines.push(url);

  const date = ctx?.createdAt ?? message.createdAt;
  const today = new Date();

  let sentAt;
  if (date.toDateString() === today.toDateString()) {
    sentAt = `Today at ${date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}`;
  } else {
    sentAt = date.toLocaleString([], {dateStyle: "medium", timeStyle: "short"});
  }

  const messageContent = [
    `> *${ctx.user?.displayName ?? ctx.user?.globalName ?? ctx.user.username} • ${sentAt}*`,
    "> ", ...lines.map(line => `> ${line}`)
  ].join("\n");
  log('debug', `Honeypot: Caught message sent by ${ctx.sender} (${ctx.channel.name}, ${ctx.guild.name}, ${ctx.platform})`);
  log('debug', `Honeypot: Message content: ${ctx.content}`);

  try {
    await ctx.dm({embeds: [ctx.embed({
      color: "#ff0000",
      title: `🚫 You've been banned from ${ctx.guild.name}`,
      description:  `Your user account has been detected to be sending in **${ctx.guild.name}**'s \`#${ctx.channel.name}\` channel.\n` +
                    `If this wasn't you, **your account may have been compromised.**\n\n` +
                    `Before contacting the server staff, you are advised to review your Authorized Devices/Sessions and apps and remove any suspicious entries, and change your account password.\n\n` +
                    `As a general rule of thumb, **NEVER** click any links you don't trust.`,
      fields: [{name: "💬 Message Content", value: messageContent.slice(0, 1024)}],
      footer: {text: `Message ID: ${message.id}`}
    })]});
  } catch (err) {
      log('error', `Honeypot: Failed to DM ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);
      log('error', err);
  }

  try {
    await ctx.member.ban({deleteMessageSeconds: 60 * 60, reason: "Honeypot trigger"});
    log('info', `Honeypot: Banned ${ctx.sender} from ${ctx.guild.name} (${ctx.platform})`);
  } catch (err) {
    log('error', `Honeypot: Failed to ban ${ctx.sender} (${ctx.guild.name}, ${ctx.platform})`);
    log('error', err);
  }
  return true;
};