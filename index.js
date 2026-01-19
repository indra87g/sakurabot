const pkg = require("./package.json");
const CFonts = require("cfonts");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

// Membuat objek consolefy sederhana
const consolefy = {
    log: (text) => console.log(`[${pkg.name}] ${text}`),
    error: (text, error) => console.error(`[${pkg.name}] ${text}`, error),
    warn: (text) => console.warn(`[${pkg.name}] ${text}`),
    success: (text) => console.log(`[${pkg.name}] \x1b[32m${text}\x1b[0m`),
};

Object.assign(global, {
    config: JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json"), "utf8")),
    consolefy,
    formatter: require("./tools/formatter.js"),
    tools: require("./tools/exports.js"),
    botStatus: {
        wa: false,
        tg: false
    }
});

consolefy.log("Starting...");

CFonts.say(pkg.name, {
    colors: ["#00A1E0", "#00FFFF"],
    align: "center"
});
CFonts.say(`${pkg.description} - By ${pkg.author}`, {
    font: "console",
    colors: ["#E0F7FF"],
    align: "center"
});

if (config.system && config.system.useServer) {
    const port = config.system.port;
    http.createServer((_, res) => res.end(`${pkg.name} berjalan di port ${port}`)).listen(port, () => consolefy.success(`${pkg.name} runs on port ${port}`));
}

const isWaBotConfigValid = config.bot && config.bot.phoneNumber && config.bot.phoneNumber !== "YOUR_PHONE_NUMBER";
const isTgBotConfigValid = config.bot && config.bot.botfather_token && config.bot.botfather_token !== "YOUR_BOTFATHER_TOKEN";

if (isWaBotConfigValid) {
    try {
        require("./main.js");
        global.botStatus.wa = true;
    } catch (error) {
        consolefy.error("Failed to start WhatsApp bot:", error);
    }
} else {
    consolefy.warn("WhatsApp bot configuration is missing or invalid. Skipping...");
}

if (isTgBotConfigValid) {
    try {
        const { launchTelegramBot } = require("./tg/index.js");
        launchTelegramBot();
        global.botStatus.tg = true;
    } catch (error) {
        consolefy.error("Failed to start Telegram bot:", error);
    }
} else {
    consolefy.warn("Telegram bot configuration is missing or invalid. Skipping...");
}

if (!isWaBotConfigValid && !isTgBotConfigValid) {
    consolefy.error("Both WhatsApp and Telegram bot configurations are invalid. Exiting...");
}
