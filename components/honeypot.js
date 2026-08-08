const bot = require("../config/config.json");

function getIgnoredUserType(context, member) {
  if (member?.user?.bot) return "bot account";
  if (member?.id === context?.guild?.ownerId) return "server owner";
  if (context.admin) return "staff member";
  return null;
}

exports.handle = async function (client, db, message, context) {
  if (context.user.id === context.clientUser.id && !context.guild) return false; // the bot on its way to find a mystery honeypot inside stoat dms

  const honeypotChannel = db.settings.get(context.guild.id, "honeypotChannel");
  if (!honeypotChannel || context.channel.id !== honeypotChannel) return false;

  const userType = getIgnoredUserType(context.member);
  if (userType) if (bot.debug_mode) return console.debug(`\x1b[36m[INFO]\x1b[0m Honeypot: Ignored ${userType} ${context.sender} (${context.guild.name}, ${context.platform})`);

  if (!context.member?.bannable ?? !context.clientUser?.permissions?.has("BanMembers")) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Honeypot: Missing permission to ban ${context.sender} (${context.guild.name}, ${context.platform})`)
    return false; 
  }

  const lines = [];
  if (context.content) lines.push(context.content);
  for (const url of context.attachmentsToUrl) lines.push(url);

  const date = context?.createdAt ?? message.createdAt;
  const today = new Date();

  let sentAt;

  if (date.toDateString() === today.toDateString()) {
    sentAt = `Today at ${date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}`;
  } else {
    sentAt = date.toLocaleString([], {dateStyle: "medium", timeStyle: "short"});
  }

  const messageContent = [
    `> *${context.member.displayName} • ${sentAt}*`,
    "> ", ...lines.map(line => `> ${line}`)
  ].join("\n");

  let embed = {
    color: "#ff0000",
    title: `🚫 You've been banned from ${context.guild.name}`,
    description:  `Your user account has been detected to be sending in **${context.guild.name}**'s \`#${context.channel.name}\` channel.\n` +
                  `If this wasn't you, **your account may have been compromised.**\n\n` +
                  `Before contacting the server staff, you are advised to review your Authorized Devices/Sessions and apps and remove any suspicious entries, and change your account password.\n\n` +
                  `As a general rule of thumb, **NEVER** click any links you don't trust.`
  }

  context.fields(embed, [{name: "💬 Message Content", value: messageContent.slice(0, 1024)}]);
  context.footer(embed, {text: `Message ID: ${message.id}`});

  try {
    await context.dm({embeds: [embed]});
  } catch (err) {
    if (bot.debug_mode) {
      console.debug(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to DM ${context.sender} (${context.guild.name}, ${context.platform})`);
      console.debug(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
  }

  try {
    await context.member.ban({deleteMessageSeconds: 60 * 60, reason: "Honeypot trigger"});
    console.log(`\x1b[36m[INFO]\x1b[0m Honeypot: Banned ${context.sender} from ${context.guild.name} (${context.platform})`)
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to ban ${context.sender} (${context.guild.name}, ${context.platform})`);
    console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
  }
  return true;
};