module.exports = {
    name: "ping",
    aliases: ["p"],
    category: "information",
    execute: async ({ bot, m }) => {
        try {
            const startTime = performance.now();
            const sentMsg = await m.reply("ⓘ _Pong!_");
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            const tgBotStatus = global.botStatus.tg ? 'Online' : 'Offline';

            await bot.sendMessage(m.from, {
                text: `ⓘ _Pong! Merespon dalam ${responseTime.toFixed(2)} ms._\n\nTelegram Bot: ${tgBotStatus}`,
                edit: sentMsg.key
            });
        } catch (error) {
            console.error("Error di ping.js:", error);
            m.reply("Terjadi kesalahan saat menjalankan ping.");
        }
    }
};