const fs = require("fs");
const { REST, Routes } = require("discord.js");
const fetch = require("node-fetch");
const bot = require("./config/config.json");
const core = require("./config/core.json");

let displayVersion;

try {
  ({ displayVersion } = require('./components/panther.js'));
displayVersion();

} catch (err) {
  console.log(core.name);
}

const commandFiles = fs.readdirSync("./cmds");

const commands = [];

for (const file of commandFiles) {
  const cmd = require(`./cmds/${file}`);
  if (!cmd.data) continue;

  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(bot.token);

(async () => {
  try {
  await rest.put(
    Routes.applicationCommands(bot.clientID),
    { body: commands }
  );

  console.log(`\n\n\x1b[36m[INFO]\x1b[0m Successfully registered Discord slash commands.`);
  } catch (err) {
    console.log(`\n\n\x1b[31m[ERROR]\x1b[0m Couldn't register Discord slash commands.`);
    console.error(`\x1b[31m[ERROR]\x1b[0m ` + err.stack);
  }
})();