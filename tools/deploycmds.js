const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const auth = require("../config/auth.json");

const panther = require("../components/panther.js");

const commandsPath = path.join(__dirname, "../cmds");
const commandFiles = fs.readdirSync(commandsPath);

const commands = [];

for (const file of commandFiles) {
  const cmd = require(`../cmds/${file}`);
  if (!cmd.data) continue;

  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(auth.discord_token);

(async () => {
  try {
  await rest.put(
    Routes.applicationCommands(auth.discord_clientID),
    { body: commands }
  );

  console.log(`\n\n\x1b[36m[INFO]\x1b[0m Successfully registered Discord slash commands.`);
  } catch (err) {
    console.log(`\n\n\x1b[31m[ERROR]\x1b[0m Couldn't register Discord slash commands.`);
    console.error(`\x1b[31m[ERROR]\x1b[0m ` + err.stack);
  }
})();