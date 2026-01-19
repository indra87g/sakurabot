const fs = require("node:fs");
const path = require("node:path");
const pkg = require("../../../package.json");

module.exports = {
    name: "about",
    aliases: ["bot", "infobot"],
    category: "information",
    execute: async ({ m }) => {
        try {
            const uptime = process.uptime();
            const uptimeString = `${Math.floor(uptime / 3600)} jam, ${Math.floor((uptime % 3600) / 60)} menit, ${Math.floor(uptime % 60)} detik`;

            const dbPath = path.resolve(__dirname, "..", "..", "..", "database", "wa");
            const dbSize = fs.existsSync(dbPath) ? fs.readdirSync(dbPath).reduce((total, file) => total + fs.statSync(path.join(dbPath, file)).size, 0) : 0;
            const dbSizeString = `${(dbSize / 1024).toFixed(2)} KB`;

            const mode = config.system?.mode || "public";
            const modeCapitalized = mode.charAt(0).toUpperCase() + mode.slice(1);

            const aboutText = `— Halo! Saya adalah bot WhatsApp bernama ${config.bot.name}, dimiliki oleh ${config.owner.name}. Saya bisa melakukan banyak perintah, seperti membuat stiker, menggunakan AI untuk pekerjaan tertentu, dan beberapa perintah berguna lainnya. Saya di sini untuk menghibur dan menyenangkan Anda!\n\n` +
                `➛ *Bot*: ${config.bot.name}\n` +
                `➛ *Versi*: ${pkg.version}\n` +
                `➛ *Owner*: ${config.owner.name}\n` +
                `➛ *Mode*: ${modeCapitalized}\n` +
                `➛ *Uptime*: ${uptimeString}\n` +
                `➛ *Database*: ${dbSizeString} (Simpl.DB with JSON)\n` +
                `➛ *Library*: @rexxhayanasi/elaina-baileys`;

            await m.reply(aboutText);
        } catch (error) {
            console.error("Error di about.js:", error);
            m.reply("Terjadi kesalahan saat menampilkan info bot.");
        }
    }
};