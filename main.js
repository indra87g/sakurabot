// Impor modul dan dependensi yang diperlukan
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@rexxhayanasi/elaina-baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const path = require("node:path");
const fs = require("node:fs");
const util = require("node:util");
const aenpx = require('./tools/aenpx.js')

// Konfigurasi bot
const {
    bot: botConfig,
    system
} = config;
const directory = {
    auth: path.resolve(__dirname, "state"),
    command: path.resolve(__dirname, "wa", "commands")
};

// Fungsi untuk memulai bot
async function startBot() {
    consolefy.log("Connecting...");

    const { state, saveCreds } = await useMultiFileAuthState(directory.auth);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    consolefy.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const bot = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["SakuraBot", "Safari", "1.0.0"],
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
    });

    // Command Handler Sederhana
    bot.commands = new Map();
    const commandFolders = fs.readdirSync(directory.command);
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(directory.command, folder)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            try {
                const command = require(path.join(directory.command, folder, file));
                bot.commands.set(command.name, command);
            } catch (error) {
                consolefy.error(`Error loading command ${file}:`, error);
            }
        }
    }

    // Event listener untuk koneksi
    bot.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            consolefy.error("Connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            consolefy.success("Connection opened!");
        }
    });

    // Menyimpan kredensial
    bot.ev.on("creds.update", saveCreds);

    // Event listener untuk pesan
    bot.ev.on('messages.upsert', async (mek) => {
        try {
            const m = await aenpx(bot, mek)
            if (!m.id.startsWith("BAE5") && !m.id.startsWith("3EB0")) return;
            require('./handler.js')(bot, m)
        } catch (e) {
            console.log(e)
        }
    });

    return bot;
}

// Menjalankan bot
startBot().catch(error => consolefy.error(`Error: ${util.format(error)}`));
