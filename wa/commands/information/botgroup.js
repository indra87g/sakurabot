module.exports = {
    name: "botgroup",
    aliases: ["botgc", "gcbot"],
    category: "information",
    execute: async ({ m }) => {
        await m.reply(config.bot.groupLink);
    }
};