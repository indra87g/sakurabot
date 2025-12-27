const axios = require("axios");

module.exports = {
    name: "mcserverinfo",
    category: "tool",
    code: async (ctx) => {
        try {
            await ctx.reply("Sedang mengambil data server, mohon tunggu...");
            const response = await axios.get("http://veda.hidencloud.com:25234/server");
            const json = response.data;

            if (!json) {
                return await ctx.reply("Gagal mendapatkan data server. Coba lagi nanti.");
            }

            let text = `✦  *S A K U R A - U N I V E R S E*\n\n`;
            text += `◦  *MOTD* : ${json.motd}\n`;
            text += `◦  *Time* : ${json.serverTime}\n`;
            text += `◦  *Players* : ${json.players}\n\n`;
            text += `✦  *S Y S T E M*\n\n`;
            text += `◦  *CPU* : ${json.cpu.processCpuLoad.toFixed(2)}% / 100%\n`;
            text += `◦  *RAM* : ${json.ram.used} / ${json.ram.total}\n`;
            text += `◦  *Storage* : ${json.storage.used} / ${json.storage.total}\n`;

            await ctx.reply(text);
        } catch (error) {
            console.error(error);
            await ctx.reply("Maaf, terjadi kesalahan saat mengambil data server atau server sedang offline.");
        }
    }
};
