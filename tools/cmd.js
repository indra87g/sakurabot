// Impor modul dan dependensi yang diperlukan
const util = require("node:util");
// const { Baileys, MessageType, Gktw } = require("@itsreimau/gktw"); // DIHAPUS

/*
Fungsi-fungsi berikut dinonaktifkan sementara karena ketergantungan pada @itsreimau/gktw
Akan diadaptasi atau dihapus di masa mendatang.

function checkMedia(type, required) { ... }
function checkQuotedMedia(type, required) { ... }
function fakeQuotedText(text) { ... }
function isCmd(text, ctxBot) { ... }
*/

function delay(ms) {
    if (!ms) return null;
    return new Promise(res => setTimeout(res, ms));
}

function generateUID(id, withBotName = true) {
    if (!id) return null;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const charCode = id.charCodeAt(i);
        hash = (hash * 31 + charCode) % 1000000007;
    }
    const uniquePart = id.split("").reverse().join("").charCodeAt(0).toString(16);
    let uid = `${Math.abs(hash).toString(16).toLowerCase()}-${uniquePart}`;
    if (withBotName) {
        const botName = config.bot.name.toLowerCase().replace(/[aiueo0-9\W_]/g, "");
        uid += `_${botName}-wabot`;
    }
    return uid;
}

function getRandomElement(array) {
    if (!array || !array.length || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

function getReportOwner() {
    const owners = [];
    if (config.owner.report) owners.push(config.owner.id);
    if (config.owner.co && Array.isArray(config.owner.co)) {
        config.owner.co.forEach(co => {
            if (co.report === true) owners.push(co.id);
        });
    }
    return owners.length > 0 ? owners : false;
}

// Ditulis ulang untuk kompatibilitas dengan sistem baru
async function handleError(m, bot, error, reportToOwner = true) {
    const errorText = util.format(error);
    console.error(`Error: ${errorText}`);

    const reportOwnerIds = getReportOwner();
    if (reportToOwner && reportOwnerIds && reportOwnerIds.length > 0) {
        const errorMessage = `Terjadi kesalahan dari: @${m.sender.split('@')[0]}\n\n\`\`\`${errorText}\`\`\``;
        for (const ownerId of reportOwnerIds) {
            try {
                await bot.sendMessage(`${ownerId}@s.whatsapp.net`, {
                    text: errorMessage,
                    mentions: [m.sender]
                });
                await delay(500);
            } catch (e) {
                console.error(`Gagal mengirim laporan error ke owner ${ownerId}:`, e);
            }
        }
    }
    await m.reply(`Terjadi kesalahan: ${error.message}`);
}

function isUrl(url) {
    if (!url) return false;
    return /(https?:\/\/[^\s]+)/g.test(url);
}

module.exports = {
    // checkMedia,
    // checkQuotedMedia,
    delay,
    // fakeQuotedText,
    generateUID,
    getRandomElement,
    getReportOwner,
    handleError,
    // isCmd,
    isUrl
};