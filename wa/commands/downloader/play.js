const axios = require("axios");
const { createUrl } = require("../../../tools/api.js");
const { handleError } = require("../../../tools/cmd.js");
const { Database } = require("simpl.db");
const path = require("path");

// Inisialisasi database di luar execute agar tidak dibuat ulang setiap kali
const db = new Database({
    dataPath: path.join(__dirname, "..", "..", "..", "database", "wa", "users.json"),
    autoSave: true,
    tabSize: 2
});

// Helper function untuk parsing flags
const parseFlags = (args) => {
    const flags = {};
    const remainingArgs = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-i' && args[i + 1] && !isNaN(args[i + 1])) {
            flags.index = parseInt(args[i + 1]) - 1;
            i++; // Lewati value
        } else if (args[i] === '-s' && args[i + 1]) {
            flags.source = args[i + 1].toLowerCase();
            i++; // Lewati value
        } else {
            remainingArgs.push(args[i]);
        }
    }
    return { flags, input: remainingArgs.join(' ') };
};

module.exports = {
    name: "play",
    category: "downloader",
    permissions: {
        coin: 5
    },
    execute: async ({ bot, m, args, isOwner }) => {
        const { flags, input } = parseFlags(args);

        if (!input) {
            return m.reply(
                `Contoh: ${config.bot.prefix}play one last kiss -i 8 -s spotify\n\n` +
                `Flags:\n` +
                `-i <number>: Pilihan pada data indeks\n` +
                `-s <text>: Sumber lagu (spotify, youtube)`
            );
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

        try {
            const searchIndex = flags.index || 0;
            const source = flags.source || 'youtube';
            let initialMsg;

            if (source === "spotify") {
                initialMsg = await m.reply("Mencari lagu di Spotify...");
                const searchApiUrl = createUrl("znx", "/api/search/spotify", { q: input });
                const searchResponse = await axios.get(searchApiUrl);
                const searchResult = searchResponse.data.results.data[searchIndex];

                if (!searchResult) {
                    return bot.sendMessage(m.from, { text: "Lagu tidak ditemukan.", edit: initialMsg.key });
                }

                await bot.sendMessage(m.from, {
                    text: `Ditemukan:\n\n` +
                          `➛ *Judul*: ${searchResult.title}\n` +
                          `➛ *Artis*: ${searchResult.artist}\n` +
                          `➛ *URL*: ${searchResult.track_url}\n\n` +
                          `Mengunduh audio...`,
                    edit: initialMsg.key
                });

                const downloadApiUrl = createUrl("deline", "/downloader/spotify", { url: searchResult.url });
                const downloadResult = (await axios.get(downloadApiUrl)).data.download;

                await bot.sendMessage(m.from, {
                    audio: { url: downloadResult },
                    mimetype: 'audio/mpeg'
                }, { quoted: m });

            } else { // Default to YouTube
                initialMsg = await m.reply("Mencari lagu di YouTube...");
                const searchApiUrl = createUrl("znx", "/api/search/youtube", { q: input });
                const searchResponse = await axios.get(searchApiUrl);
                const searchResult = searchResponse.data.results.filter(res => res.type === "video")[searchIndex];

                if (!searchResult) {
                    return bot.sendMessage(m.from, { text: "Video tidak ditemukan.", edit: initialMsg.key });
                }

                await bot.sendMessage(m.from, {
                    text: `Ditemukan:\n\n` +
                          `➛ *Judul*: ${searchResult.title}\n` +
                          `➛ *Artis*: ${searchResult.author.name}\n` +
                          `➛ *URL*: ${searchResult.url}\n\n` +
                          `Mengunduh audio...`,
                    edit: initialMsg.key
                });

                const downloadApiUrl = createUrl("yp", "/api/downloader/ytmp3", { url: searchResult.url });
                const downloadResult = (await axios.get(downloadApiUrl)).data.data.download_url;

                await bot.sendMessage(m.from, {
                    audio: { url: downloadResult },
                    mimetype: 'audio/mpeg'
                }, { quoted: m });
            }
        } catch (error) {
            // Kembalikan koin jika terjadi error
            if (!isOwner) {
                db.add(userId + ".coin", requiredCoins);
            }
            await handleError(m, bot, error);
        }
    }
};