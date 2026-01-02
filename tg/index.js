const { Telegraf } = require('telegraf');
const config = require('../config.json');
const { registerPaymentCommands } = require('./payment.js');
const fs = require('fs');
const path = require('path');

// Helper function to read JSON files
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error(`Error reading ${filePath}:`, error);
        return [];
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
    const bannedUsers = readJsonFile('bans.json');
    if (ctx.from && bannedUsers.includes(ctx.from.id)) {
        return ctx.reply('You are banned from using this bot.');
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


const launchTelegramBot = () => {
  const token = config.bot.botfather_token;
  const bot = new Telegraf(token);

  // Use middlewares
  bot.use(banMiddleware);
  bot.use(addUserMiddleware);

  // Register payment commands, passing the helper functions
  registerPaymentCommands(bot, { isOwner, isPremium });

  // Dynamically load commands
  const commandsDir = path.resolve(__dirname, 'commands');
  fs.readdirSync(commandsDir).forEach(file => {
      if (file.endsWith('.js')) {
          const command = require(path.join(commandsDir, file));
          bot.command(command.name, command.code);
      }
  });


  bot.command('cekid', (ctx) => {
    ctx.reply(`Your Telegram ID is: ${ctx.from.id}`);
  });

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

  bot.launch();

  console.log('Telegram bot is running...');
};

module.exports = { launchTelegramBot };
