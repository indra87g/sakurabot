module.exports = {
    name: "ping",
    aliases: ["p"],
    category: "information",
    code: async (ctx) => {
        try {
            const startTime = performance.now();
            const pongMsg = await ctx.reply(`ⓘ ${formatter.italic("Pong!")}`);
            const responseTime = performance.now() - startTime;
            const tgBotStatus = global.botStatus.tg ? 'Online' : 'Offline';
            await ctx.editMessage(pongMsg.key, `ⓘ ${formatter.italic(`Pong! Merespon dalam ${tools.msg.convertMsToDuration(responseTime)}.`)}\n\nTelegram Bot: ${tgBotStatus}`);
        } catch (error) {
            await tools.cmd.handleError(ctx, error);
        }
    }
};