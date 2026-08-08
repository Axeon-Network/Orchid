const meta = {
    name: "eval",
    description: "Run code using the bot",
    usage: "eval <code>",
    ownerOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, context, args) => {
    try {
        const code = args.join(" ");
        let evaled = eval(code);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        context.reply({embeds: [{
                color: "#00ff00",
                title: `✅ Result`,
                description: `\`\`\`xl\n${clean(evaled)}\n\`\`\``,
            }]
        });
    } catch (err) {
        context.reply({embeds: [{
                color: "#ff0000",
                title: `❌ Error!`,
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