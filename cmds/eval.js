const bot = require ("../config/config.json");
const Enmap = require('enmap');
const core = require("../config/core.json");

const meta = {
    name: "eval",
    description: "Run code using the bot",
    usage: "eval <code>",
    ownerOnly: true
};
exports.meta = meta;

exports.execute = async (client, context, args) => {
    client.config = bot;
    const guildConf = client.settings.get(context.guild.id);

    let code = args.join(" ").slice(1);

    if(context.user.id !== bot.ownerID) return context.reply({embeds: {
        color: 0xff0000,
        title: `:x: Error!`,
        description: `You don't have permission to use this command!`,
    }
});
    try {
        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        context.reply({embeds: [{
                color: 0x00ff00,
                title: `:white_check_mark: Result`,
                description: `\`\`\`xl\n${clean(evaled)}\n\`\`\``,
            }]
        });

    } catch (err) {
        context.reply({embeds: [{
                color: 0xff0000,
                title: `:x: Error!`,
                description: `\`\`\`xl\n${clean(err)}\n\`\`\``,
            }]
        });
    };

    function clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }
}