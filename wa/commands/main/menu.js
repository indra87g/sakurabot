const moment = require("moment-timezone");
const fs = require("node:fs");
const path = require("node:path");
const os = require("os");
const { proto, generateWAMessageFromContent } = require("@rexxhayanasi/elaina-baileys");

module.exports = {
    name: "menu",
    aliases: ["allmenu", "help", "list", "listmenu"],
    category: "main",
    execute: async ({ bot, m, args }) => {
        try {
            const commands = bot.commands;
            const categoryArg = args[0]?.toLowerCase();
            const prefix = config.bot.prefix || "/";
            const tag = {
                "ai-chat": "AI (Chat)",
                "ai-generate": "AI (Generate)",
                "ai-misc": "AI (Miscellaneous)",
                converter: "Converter",
                downloader: "Downloader",
                game: "Game",
                group: "Group",
                maker: "Maker",
                profile: "Profile",
                search: "Search",
                tool: "Tool",
                owner: "Owner",
                information: "Information",
                misc: "Miscellaneous"
            };

            if (categoryArg && tag[categoryArg]) {
                const cmds = Array.from(commands.values()).filter(c => c.category === categoryArg);
                if (cmds.length === 0) {
                    return m.reply(`Tidak ada perintah dalam kategori "${tag[categoryArg]}".`);
                }
                let categoryText = `╭┈┈┈┈┈┈ ♡\n┊ ✿ — *${tag[categoryArg]}*\n`;
                cmds.forEach(c => {
                    categoryText += `┊ ➛ ${prefix}${c.name}\n`;
                });
                categoryText += "╰┈┈┈┈┈┈\n";
                return m.reply(categoryText.trim());
            }

            const senderName = m.sender.split("@")[0];
            const uptime = process.uptime();
            const uptimeString = `${Math.floor(uptime / 3600)} jam, ${Math.floor((uptime % 3600) / 60)} menit, ${Math.floor(uptime % 60)} detik`;
            const dbPath = path.resolve(__dirname, "..", "..", "..", "database", "wa");
            const dbSize = fs.existsSync(dbPath) ? fs.readdirSync(dbPath).reduce((total, file) => total + fs.statSync(path.join(dbPath, file)).size, 0) : 0;
            const dbSizeString = `${(dbSize / 1024).toFixed(2)} KB`;

            let fullMenuText = `— Halo, @${senderName}! Saya adalah bot WhatsApp bernama ${config.bot.name}, dimiliki oleh ${config.owner.name}.\n\n` +
                `➛ *Tanggal*: ${moment.tz(config.system.timeZone).locale("id").format("dddd, DD MMMM YYYY")}\n` +
                `➛ *Waktu*: ${moment.tz(config.system.timeZone).format("HH.mm.ss")}\n\n` +
                `➛ *Uptime*: ${uptimeString}\n` +
                `➛ *Database*: ${dbSizeString} (Simpl.DB with JSON)\n` +
                `➛ *Library*: @rexxhayanasi/elaina-baileys\n\n` +
                `☆ _Jangan lupa berdonasi agar bot tetap online._\n`;

            if (categoryArg) {
                fullMenuText += `\nKategori "${categoryArg}" tidak ditemukan.\n`;
            }

            fullMenuText += `\nBerikut adalah daftar kategori perintah. Ketik ${prefix}menu <kategori> untuk melihat daftar perintah.\n\n` +
                "╭┈┈┈┈┈┈ ♡\n" +
                `┊ ✿ — *Kategori Perintah*\n`;
            Object.keys(tag).forEach(t => {
                fullMenuText += `┊ ➛ ${t}\n`;
            });
            fullMenuText += "╰┈┈┈┈┈┈\n";

            // Membuat pesan interaktif dengan tombol
            const interactiveMessage = {
                body: { text: fullMenuText.trim() },
                footer: { text: `_${config.msg.footer}_` },
                header: {
                    title: config.bot.name,
                    subtitle: "Menu Utama",
                    hasMediaAttachment: true,
                    imageMessage: {
                        url: "https://picsum.photos/536/354"
                    }
                },
                nativeFlowMessage: {
                    buttons: [
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Hubungi Owner", id: `${prefix}owner` }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Donasi", id: `${prefix}donate` }) }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(m.from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        interactiveMessage,
                    },
                },
            }, {
                mentions: [m.sender]
            });

            await bot.relayMessage(m.from, msg.message, { messageId: msg.key.id });

        } catch (error) {
            console.error("Error di menu.js:", error);
            m.reply("Terjadi kesalahan saat menampilkan menu.");
        }
    }
};