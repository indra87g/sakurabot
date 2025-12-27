const moment = require("moment-timezone");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    name: "menu",
    aliases: ["allmenu", "help", "list", "listmenu"],
    category: "main",
    code: async (ctx) => {
        try {
            const { cmd } = ctx.bot;
            const categoryArg = ctx.args[0]?.toLowerCase();
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

            // If a specific, valid category is requested, show only the command list.
            if (categoryArg && tag[categoryArg]) {
                let categoryText = "";
                const cmds = Array.from(cmd.values()).filter(c => c.category === categoryArg).map(c => ({
                    name: c.name,
                    aliases: c.aliases,
                    permissions: c.permissions || {}
                }));

                if (cmds.length > 0) {
                    categoryText += "╭┈┈┈┈┈┈ ♡\n" +
                                  `┊ ✿ — ${formatter.bold(tag[categoryArg])}\n`;

                    cmds.forEach(c => {
                        let permissionsText = "";
                        if (c.permissions.coin) permissionsText += "ⓒ";
                        if (c.permissions.group) permissionsText += "Ⓖ";
                        if (c.permissions.owner) permissionsText += "Ⓞ";
                        if (c.permissions.premium) permissionsText += "Ⓟ";
                        if (c.permissions.private) permissionsText += "ⓟ";

                        categoryText += `┊ ➛ ${ctx.used.prefix + c.name} ${permissionsText}\n`;
                    });
                    categoryText += "╰┈┈┈┈┈┈\n";
                } else {
                    categoryText = `Tidak ada perintah yang tersedia dalam kategori "${tag[categoryArg]}".`;
                }
                // Reply with just the list, "to the point".
                return await ctx.reply(categoryText.trim());
            }

            // If no category or an invalid one is provided, show the full menu.
            let fullMenuText = `— Halo, @${ctx.getId(ctx.sender.jid)}! Saya adalah bot WhatsApp bernama ${config.bot.name}, dimiliki oleh ${config.owner.name}. Saya bisa melakukan banyak perintah, seperti membuat stiker, menggunakan AI untuk pekerjaan tertentu, dan beberapa perintah berguna lainnya.\n` +
                "\n" +
                `➛ ${formatter.bold("Tanggal")}: ${moment.tz(config.system.timeZone).locale("id").format("dddd, DD MMMM YYYY")}\n` +
                `➛ ${formatter.bold("Waktu")}: ${moment.tz(config.system.timeZone).format("HH.mm.ss")}\n` +
                "\n" +
                `➛ ${formatter.bold("Uptime")}: ${tools.msg.convertMsToDuration(Date.now() - ctx.me.readyAt)}\n` +
                `➛ ${formatter.bold("Database")}: ${fs.existsSync(ctx.bot.databaseDir) ? tools.msg.formatSize(fs.readdirSync(ctx.bot.databaseDir).reduce((total, file) => total + fs.statSync(path.join(ctx.bot.databaseDir, file)).size, 0) / 1024) : "N/A"} (Simpl.DB with JSON)\n` +
                `➛ ${formatter.bold("Library")}: @itsreimau/gktw (Fork of @mengkodingan/ckptw)\n` +
                "\n" +
                `☆ ${formatter.italic("Jangan lupa berdonasi agar bot tetap online.")}\n`;

            if (categoryArg) { // Invalid category was provided
                fullMenuText += `\nKategori "${categoryArg}" tidak ditemukan.\n`;
            }

            fullMenuText += `\nBerikut adalah daftar kategori perintah yang tersedia. Ketik ${ctx.used.prefix}menu <kategori> untuk melihat daftar perintah.\n\n` +
                "╭┈┈┈┈┈┈ ♡\n" +
                `┊ ✿ — ${formatter.bold("Kategori Perintah")}\n`;

            Object.keys(tag).forEach(t => {
                fullMenuText += `┊ ➛ ${t}\n`;
            });
            fullMenuText += "╰┈┈┈┈┈┈\n";

            await ctx.core.sendMessage(ctx.id, {
                image: {
                    url: "https://picsum.photos/536/354"
                },
                mimetype: tools.mime.lookup("png"),
                caption: fullMenuText.trim(),
                contextInfo: {
                    mentionedJid: [ctx.sender.jid],
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.bot.newsletterJid,
                        newsletterName: config.msg.footer
                    },
                    externalAdReply: {
                        title: config.bot.name,
                        body: config.msg.note,
                        mediaType: 1,
                        thumbnailUrl: config.bot.thumbnail,
                        sourceUrl: config.bot.groupLink,
                        renderLargerThumbnail: true
                    }
                },
                footer: formatter.italic(config.msg.footer),
                buttons: [{
                    buttonId: `${ctx.used.prefix}owner`,
                    buttonText: {
                        displayText: "Hubungi Owner"
                    }
                }, {
                    buttonId: `${ctx.used.prefix}donate`,
                    buttonText: {
                        displayText: "Donasi"
                    }
                }]
            }, {
                quoted: tools.cmd.fakeQuotedText(config.msg.note)
            });
        } catch (error) {
            await tools.cmd.handleError(ctx, error);
        }
    }
};