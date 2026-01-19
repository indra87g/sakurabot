const { listUrl } = require("../../../tools/api.js");

module.exports = {
    name: "listapis",
    aliases: ["listapi"],
    category: "information",
    execute: async ({ m }) => {
        try {
            const APIs = listUrl();
            let resultText = "Berikut adalah daftar API yang digunakan:\n\n";

            for (const api of Object.values(APIs)) {
                resultText += `➛ ${api.baseURL}\n`;
            }

            await m.reply(resultText.trim());
        } catch (error) {
            console.error("Error di listapis.js:", error);
            m.reply("Terjadi kesalahan saat menampilkan daftar API.");
        }
    }
};