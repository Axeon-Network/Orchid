const meta = {
    name: "eval",
    description: "Run code using the bot",
    category: "general",
    usage: "<code>",
    ownerOnly: true
};
exports.meta = meta;

exports.execute = async (client, db, ctx, args) => {
    try {
        const code = args.join(" ");
        let evaled = eval(code);
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

        ctx.reply({embeds: [ctx.embed({color: "#00ff00", title: `✅ Result`, description: `\`\`\`xl\n${clean(evaled)}\n\`\`\``})]});
    } catch (err) {
        ctx.reply({embeds: [ctx.embed({color: "#ff0000", title: `❌ Error!`, description: `\`\`\`xl\n${clean(err)}\n\`\`\``})]});
    };

    function clean(text) {
        if (typeof(text) === "string")
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
    }
}