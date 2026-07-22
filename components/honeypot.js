const { PermissionFlagsBits } = require('discord.js');
const bot = require("../config/config.json");

function getIgnoredUserType(member) {
  if (member.user.bot) return "bot account";
  if (member.id === member.guild.ownerId) return "server owner";
  if (member.permissions.has(PermissionFlagsBits.Administrator) || member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return "staff member";
  }
  return null;
}

// handling mechanism on the channel side
exports.handle = async function (client, message) {
  const honeypotChannel = client.settings.get(message.guild.id, "honeypotChannel");
  if (!honeypotChannel || message.channel.id !== honeypotChannel) return false;

  const userType = getIgnoredUserType(message.member);
  if (userType) {
    if (bot.debug_mode) console.debug(`\x1b[36m[INFO]\x1b[0m Honeypot: Ignored ${userType} ${message.author.tag} (${message.guild.name})`);
    return;
  }

  const lines = [];
  if (message.content) lines.push(message.content);
  for (const attachment of message.attachments.values()) lines.push(attachment.url);

  const date = message.createdAt;
  const today = new Date();

  let sentAt;

  if (date.toDateString() === today.toDateString()) {
    sentAt = `Today at ${date.toLocaleTimeString([], {hour: "numeric", minute: "2-digit"})}`;
  } else {
    sentAt = date.toLocaleString([], {dateStyle: "medium", timeStyle: "short"});
  }

  const messageContent = [
    `> *${message.member.displayName} • ${sentAt}*`,
    "> ", ...lines.map(line => `> ${line}`)
  ].join("\n");

  let embed = {
    color: 0xff0000,
    title: `🚫 You've been banned from ${message.guild.name}`,
    description:  `Your Discord account has been detected to be sending in **${message.guild.name}**'s \`#${message.channel.name}\` channel.\n` +
                  `If this wasn't you, **your account may have been compromised.**\n\n` +
                  `Before contacting the server staff, you are advised to review your Authorized Devices and apps and remove any suspicious entries, and change your account password.\n\n` +
                  `As a general rule of thumb, **NEVER** click any links you don't trust.`,
    fields: [{name: "💬 Message Content", value: messageContent.slice(0, 1024)}],
    footer: {text: `Message ID: ${message.id}`}
  }

  try {
    await message.author.send({embeds: [embed]});
  } catch (err) {
    if (bot.debug_mode) {
      console.debug(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to DM ${message.author.tag}`);
      console.debug(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
  }

  try {
    await message.member.ban({deleteMessageSeconds: 60 * 60, reason: "Honeypot trigger (via channel)"});
    console.log(`\x1b[36m[INFO]\x1b[0m Honeypot: Banned ${message.author.tag} from ${message.guild.name}`)
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to ban ${message.author.tag}`);
    console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
  }
  return true;
};

// handling mechanism on the role side
exports.handleMemberUpdate = async function(client, oldMember, newMember) {
  const honeypotRole = client.settings.get(newMember.guild.id, "honeypotRole");
  if (!honeypotRole) return false;
  if (oldMember.roles.cache.has(honeypotRole) || !newMember.roles.cache.has(honeypotRole)) return false;

  const userType = getIgnoredUserType(newMember);
  if (userType) {
    if (bot.debug_mode) console.debug(`\x1b[36m[INFO]\x1b[0m Honeypot: Ignored ${userType} ${newMember.user.tag} (${newMember.guild.name})`);
    return;
  }

  const role = newMember.guild.roles.cache.get(honeypotRole);
  if (bot.debug_mode) {
    if (role) console.debug(`\x1b[36m[INFO]\x1b[0m Honeypot: ${newMember.user.tag} selected ${role.name} in ${newMember.guild.name}, attempting to ban`);
  }
  let embed = {
    color: 0xff0000,
    title: `🚫 You've been banned from ${newMember.guild.name}`,
    description:  `Your Discord account has been detected to have selected the \`@${role.name}\` role, which has been configured as the honeypot role for this server.\n` +
                  `If you believe this was a mistake, contact the server staff.\n\n` +
                  `If you believe your account was compromised, you are advised to review your Authorized Devices and apps and remove any suspicious entries, and change your account password.\n\n` +
                  `As a general rule of thumb, **NEVER** click any links you don't trust.`
  }

  try {
    await newMember.send({embeds: [embed]});
  } catch (err) {
    if (bot.debug_mode) {
      console.debug(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to DM ${newMember.user.tag}`);
      console.debug(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
  }

  try {
    await newMember.ban({deleteMessageSeconds: 60 * 60, reason: "Honeypot trigger (via role)"});
    console.log(`\x1b[36m[INFO]\x1b[0m Honeypot: Banned ${newMember.user.tag} from ${newMember.guild.name}`)
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Honeypot: Failed to ban ${newMember.author.tag}`);
    console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
  }
  return true;
};