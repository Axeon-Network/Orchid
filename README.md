<span><h1><img src="https://axeon-network.github.io/media/etc/orchid.png" style="width:5%;"> Orchid</h1></span>
Making the Axeon Network a ...network!\
Cross-platform bot bridging Discord, Stoat, and (soon) Fluxer built specifically for the Axeon Network.

Currently in Beta, current features include cross-server chatting and other utility features for server management (such as sending announcements to all servers or an anti-scam honeypot feature). More features planned soon.

# Setup
First off you'll want to download and install the appropriate Node.js w/ NPM for your operating system (the bot is currently *guaranteed* to work with at least Node 26 and NPM version 11, but if you're using an slightly older version feel free to test).

Afterwards, clone this repository (`git clone https://github.com/Axeon-Network/Orchid && cd Orchid` for Git) then install the dependencies (`npm install`).

You'll then want to modify `auth.json` in the `config` directory. This is where you'll be storing your bot token and your user account ID for each platform, as well as the bot/client ID on the Discord side (required to deploy Slash Commands).\
Optionally you may also modify `config.json` which lets you change various bot-wide settings.

Once ready, start the bot using `run.bat` (Windows) or `./run.sh` (macOS/Linux).\
By default this currently starts both the Discord and Stoat bots, but you can pass either the `--discord` or `--stoat` command-line arguments in the terminal so you can start either only the Discord or the Stoat bot.

# Contributing & Support
If you find any issues or just have any suggestion, feel free to open a new issue over on the [Issues page](https://github.com/Axeon-Network/Orchid/issues).\
Or, if you prefer chatting back-and-forth, feel free to join the [Axeon Network](https://discord.gg/wDxDKJU2sj) Discord server!

# License
Copyright © 2026 Axeon Network\
Licensed under the [MIT License](https://github.com/Axeon-Network/Orchid/blob/main/LICENSE)
