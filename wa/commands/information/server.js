const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Helper function to format bytes into KB, MB, etc.
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format seconds into a readable duration
const formatDuration = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d} hari, ${h} jam, ${m} menit, ${s} detik`;
};

module.exports = {
    name: "server",
    category: "information",
    execute: async ({ m }) => {
        try {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const cpus = os.cpus();
            const uptime = process.uptime();

            const dbPath = path.resolve(__dirname, "..", "..", "..", "database", "wa");
            const dbSize = fs.existsSync(dbPath) ? fs.readdirSync(dbPath).reduce((total, file) => total + fs.statSync(path.join(dbPath, file)).size, 0) : 0;

            const serverInfoText =
                `➛ *OS*: ${os.type()} (${os.platform()})\n` +
                `➛ *Arch*: ${os.arch()}\n` +
                `➛ *Release*: ${os.release()}\n` +
                `➛ *Host*: ${os.hostname()}\n\n` +
                `➛ *Memori*: ${formatSize(usedMem)}\n` +
                `➛ *Bebas*: ${formatSize(freeMem)}\n` +
                `➛ *Total*: ${formatSize(totalMem)}\n\n` +
                `➛ *Model CPU*: ${cpus[0].model}\n` +
                `➛ *Kecepatan CPU*: ${cpus[0].speed} MHz\n` +
                `➛ *Cores CPU*: ${cpus.length}\n` +
                `➛ *Muat Rata-Rata*: ${os.loadavg().map(avg => avg.toFixed(2)).join(", ")}\n\n` +
                `➛ *Versi NodeJS*: ${process.version}\n` +
                `➛ *Jalur Exec*: ${process.execPath}\n` +
                `➛ *PID*: ${process.pid}\n\n` +
                `➛ *Uptime*: ${formatDuration(uptime)}\n` +
                `➛ *Database*: ${formatSize(dbSize)} (Simpl.DB with JSON)\n` +
                `➛ *Library*: @rexxhayanasi/elaina-baileys`;

            await m.reply(serverInfoText);
        } catch (error) {
            console.error("Error di server.js:", error);
            m.reply("Terjadi kesalahan saat menampilkan info server.");
        }
    }
};