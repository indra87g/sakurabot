const axios = require("axios");

// Helper function to format bytes per second into a readable speed string
const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
    name: "speedtest",
    aliases: ["speed"],
    category: "information",
    execute: async ({ bot, m }) => {
        let initialMsg;
        try {
            initialMsg = await m.reply("Menguji kecepatan jaringan, mohon tunggu...");

            // Ping (Latency) Test
            const latencyStart = performance.now();
            await axios.get('https://www.google.com');
            const latency = performance.now() - latencyStart;

            // Download Test
            const downloadStart = performance.now();
            const downloadUrl = 'https://raw.githubusercontent.com/itsreimau/gaxtawu/master/README.md';
            const downloadResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const downloadTime = (performance.now() - downloadStart) / 1000; // in seconds
            const downloadSize = downloadResponse.data.length; // in bytes
            const downloadSpeed = downloadSize / downloadTime; // bytes per second

            // Upload Test
            const uploadStart = performance.now();
            const uploadData = Buffer.alloc(1 * 1024 * 1024); // 1 MB
            await axios.post('https://httpbin.org/post', uploadData, {
                headers: { 'Content-Type': 'application/octet-stream' }
            });
            const uploadTime = (performance.now() - uploadStart) / 1000; // in seconds
            const uploadSpeed = uploadData.length / uploadTime; // bytes per second

            const resultText = `*Hasil Speedtest:*\n\n` +
                `➛ *Latency*: ${latency.toFixed(2)} ms\n` +
                `➛ *Download*: ${formatSpeed(downloadSpeed)}\n` +
                `➛ *Upload*: ${formatSpeed(uploadSpeed)}`;

            await bot.sendMessage(m.from, {
                text: resultText,
                edit: initialMsg.key
            });

        } catch (error) {
            console.error("Error di speedtest.js:", error);
            // If the initial message was sent, edit it with an error message
            if (initialMsg && initialMsg.key) {
                 await bot.sendMessage(m.from, {
                    text: "Terjadi kesalahan saat menjalankan speedtest.",
                    edit: initialMsg.key
                });
            } else {
                m.reply("Terjadi kesalahan saat menjalankan speedtest.");
            }
        }
    }
};