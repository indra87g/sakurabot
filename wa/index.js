const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const path = require("path");
const fs = require("fs");
const handler = require("./handler");
const { UserAccessService, EconomyService } = require("../src/services");

const startWaBot = async (deps) => {
    const { db, config, consolefy, tools, linkingService } = deps;

    // Initialize platform services
    const userAccess = new UserAccessService(db, config, 'wa');
    const economy = new EconomyService(db, config);

    const waBot = {
        cmd: new Map(),
        games: new Map(),
        sessions: new Map(),
        services: {
            userAccess,
            economy,
            linking: linkingService
        }
    };

    // Items definition
    const { items_erekir: items } = require('../tools/items');

    // Helper function to load commands
    const loadCommands = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                loadCommands(fullPath);
            } else if (file.name.endsWith('.js')) {
                try {
                    const command = require(fullPath);
                    if (command.name) {
                        const category = path.basename(dir);
                        command.category = category;
                        waBot.cmd.set(command.name, command);
                        if (command.aliases && Array.isArray(command.aliases)) {
                            command.aliases.forEach(alias => waBot.cmd.set(alias, command));
                        }
                    }
                } catch (e) {
                    consolefy.error(`Error loading command from ${fullPath}:`, e);
                }
            }
        }
    };

    loadCommands(path.resolve(__dirname, 'commands'));

    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, '../state'));
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: !config.system.usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (config.system.usePairingCode && !sock.authState.creds.registered) {
        const phoneNumber = config.bot.phoneNumber;
        if (phoneNumber) {
            setTimeout(async () => {
                let code = await sock.requestPairingCode(phoneNumber, config.system.customPairingCode);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                consolefy.info(`Pairing Code: ${code}`);
            }, 3000);
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            consolefy.error(`Connection closed due to ${lastDisconnect.error}, reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) startWaBot(deps);
        } else if (connection === "open") {
            consolefy.success("WhatsApp bot connected!");
            global.botStatus.wa = true;
            global.waSock = sock;
            global.waBot = waBot;
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            if (m.key.fromMe) return;

            // Call message handler
            await handler(sock, m, db, waBot, items, deps);
        } catch (err) {
            consolefy.error(err);
        }
    });

    return sock;
};

module.exports = startWaBot;
