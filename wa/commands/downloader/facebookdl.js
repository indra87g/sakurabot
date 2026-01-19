const axios = require("axios");
const { createUrl } = require("../../../tools/api.js");
const { isUrl, handleError } = require("../../../tools/cmd.js");
const { Database } = require("simpl.db");
const path = require("path");

const db = new Database({
    dataPath: path.join(__dirname, "..", "..", "..", "database", "wa", "users.json"),
    autoSave: true,
    tabSize: 2
});

module.exports = {
    name: "facebookdl",
    aliases: ["facebook", "fb", "fbdl"],
    category: "downloader",
    permissions: {
        coin: 5
    },
    execute: async ({ bot, m, args, isOwner }) => {
        const url = args[0];

        if (!url) {
            return m.reply(`Contoh: ${config.bot.prefix}fb https://www.facebook.com/reel/1112151989983701`);
        }

        if (!isUrl(url)) {
            return m.reply("URL yang kamu berikan tidak valid.");
        }

        const userId = m.sender.split('@')[0];
        const requiredCoins = module.exports.permissions.coin;

        if (!isOwner) {
            const userCoins = db.get(userId)?.coin || 0;
            if (userCoins < requiredCoins) {
                return m.reply(`Koin tidak cukup. Kamu butuh ${requiredCoins} koin, tapi hanya punya ${userCoins}.`);
            }
            db.sub(userId + ".coin", requiredCoins);
        }

        let initialMsg;
        try {
            initialMsg = await m.reply("Mengunduh video dari Facebook...");

            const apiUrl = createUrl("deline", "/downloader/facebook", { url });
            const result = (await axios.get(apiUrl)).data.result.download;

            if (!result) {
                return bot.sendMessage(m.from, { text: "Gagal mengunduh video. Mungkin URL tidak didukung.", edit: initialMsg.key });
            }

            await bot.sendMessage(m.from, {
                video: { url: result },
                mimetype: 'video/mp4',
                caption: `➛ *URL*: ${url}`
            }, { quoted: m });

            // Hapus pesan "Mengunduh..." jika berhasil
            await bot.sendMessage(m.from, { delete: initialMsg.key });

        } catch (error) {
            if (!isOwner) {
                db.add(userId + ".coin", requiredCoins);
            }
            if (initialMsg) {
                 await bot.sendMessage(m.from, { text: "Terjadi kesalahan saat mengunduh video.", edit: initialMsg.key });
            }
            await handleError(m, bot, error);
        }
    }
};