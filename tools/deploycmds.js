console.log("Axeon Orchid Slash Command Deployment Utility Version 3 (Build 600)");
console.log("Copyright (c) Axeon Network");

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const clientID = process.argv[2];
if (!clientID) {
  console.error("");
  console.error("Missing Discord client ID. Exiting.");
  process.exit(1);
}
if (!/^\d{17,20}$/.test(clientID)) {
  console.error("");
  console.error("Invalid Discord client ID. Exiting.");
  process.exit(1);
}

const commandsPath = path.join(__dirname, "../cmds");
const commandFiles = fs.readdirSync(commandsPath);

const slashCommands = require("../components/slashCommands");
const commands = slashCommands.get(commandFiles);

const { discord_token } = require("../config/auth.json");
const rest = new REST({ version: "10" }).setToken(discord_token);

(async () => {
  try {
    const application = await rest.get(Routes.oauth2CurrentApplication());
    if (application.id !== clientID) {
      console.error("");
      console.error("The supplied client ID does not match the bot token set in auth.json. Exiting.");
      process.exit(1);
    }

    await rest.put(Routes.applicationCommands(clientID), { body: commands });
    console.log("");
    console.log("Successfully registered Discord slash commands.");
  } catch (err) {
    console.error("");
    console.error(err.stack);
  }
})();