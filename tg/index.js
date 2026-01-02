const { Telegraf } = require('telegraf');
const config = require('../config.json');
const { registerPaymentCommands } = require('./payment.js');
const { menuMiddleware } = require('./menu.js');
const fs = require('fs');
const path = require('path');

// Helper function to read JSON files
const readJsonFile = (filePath) => {
    const fullPath = path.resolve(__dirname, filePath);
    try {
        if (!fs.existsSync(fullPath)) {
            // For lists like users, bans, premium, return array
            if (filePath.endsWith('s.json') && !filePath.endsWith('coins.json')) {
                return [];
            }
            // For objects like coins, return object
            return {};
        }
        const data = fs.readFileSync(fullPath, 'utf8');
        // Handle empty file case
        if (data.trim() === '') {
            if (filePath.endsWith('s.json') && !filePath.endsWith('coins.json')) {
                return [];
            }
            return {};
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        if (filePath.endsWith('s.json') && !filePath.endsWith('coins.json')) {
            return [];
        }
        return {};
    }
};

// Helper function to write JSON files
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
    }
};

// Middleware to save user IDs
const addUserMiddleware = (ctx, next) => {
    if (ctx.from && ctx.from.id) {
        const users = readJsonFile('users.json');
        if (!users.includes(ctx.from.id)) {
            users.push(ctx.from.id);
            writeJsonFile('users.json', users);
        }
    }
    return next();
};

// Middleware to check for banned users
const banMiddleware = (ctx, next) => {
    if (!ctx.from) {
        return next();
    }

    const userId = ctx.from.id;
    let bans = readJsonFile('bans.json');
    const now = new Date();

    // Filter out expired bans
    const activeBans = bans.filter(ban => {
        const until = new Date(ban.until);
        return until > now;
    });

    // If the list of bans changed, write it back
    if (activeBans.length < bans.length) {
        writeJsonFile('bans.json', activeBans);
    }

    const userBan = activeBans.find(ban => ban.id === userId);

    if (userBan) {
        const until = new Date(userBan.until);
        return ctx.reply(`You are banned from using this bot. Your ban will be lifted on ${until.toUTCString()}.`);
    }

    return next();
};

// Helper function to check for owner
const isOwner = (userId) => {
    return config.bot.tg_owner.includes(userId);
};

// Helper function to check for premium
const isPremium = (userId) => {
    const premiumUsers = readJsonFile('premium.json');
    return premiumUsers.includes(userId);
};

// --- Coin System Helpers ---
const getCoins = (userId) => {
    const coins = readJsonFile('coins.json');
    return coins[userId] || 0;
};

const updateCoins = (userId, amount) => {
    const coins = readJsonFile('coins.json');
    coins[userId] = amount;
    writeJsonFile('coins.json', coins);
};
// -------------------------


const launchTelegramBot = () => {
  const token = config.bot.botfather_token;
  const bot = new Telegraf(token);

  const helpers = {
      isOwner,
      isPremium,
      getCoins,
      updateCoins,
      readJsonFile,
      writeJsonFile
  };

  // Use middlewares
  bot.use(banMiddleware);
  bot.use(addUserMiddleware);
  bot.use(menuMiddleware);

  // Register payment commands, passing the helper functions
  registerPaymentCommands(bot, helpers);

  // Dynamically load commands from subdirectories
  const loadCommands = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
              loadCommands(fullPath);
          } else if (file.name.endsWith('.js')) {
              const command = require(fullPath);
              if (command.name && command.name !== 'start') {
                  // Pass helpers to the command code
                  const commandCodeWithHelpers = (ctx) => command.code(ctx, helpers);
                  bot.command(command.name, commandCodeWithHelpers);
              }
          }
      }
  };
  loadCommands(path.resolve(__dirname, 'commands'));


  bot.command('ping', (ctx) => {
    const startTime = new Date();
    ctx.reply('Pinging...').then((sentMessage) => {
      const endTime = new Date();
      const latency = endTime - startTime;
      const waBotStatus = global.botStatus.wa ? 'Online' : 'Offline';
      ctx.telegram.editMessageText(
        ctx.chat.id,
        sentMessage.message_id,
        null,
        `Pong! Latency: ${latency}ms\nWhatsApp Bot: ${waBotStatus}`
      );
    });
  });

  bot.command('start', (ctx) => menuMiddleware.replyToContext(ctx));

  bot.launch();

  console.log('Telegram bot is running...');
};

module.exports = { launchTelegramBot };
