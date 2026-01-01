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
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Middleware to check for banned users
const banMiddleware = (ctx, next) => {
    if (ctx.from && ctx.from.id) {
        const bannedUsers = readJsonFile('bans.json');
        if (bannedUsers.includes(ctx.from.id)) {
            return ctx.reply('You are banned from using this bot.');
        }
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


const launchTelegramBot = (isWaBotRunning) => {
  const token = config.bot.botfather_token;
  const bot = new Telegraf(token);

  // Use the ban middleware
  bot.use(banMiddleware);

  // Register payment commands, passing the helper functions
  registerPaymentCommands(bot, { isOwner, isPremium });

  bot.start((ctx) => ctx.reply('Welcome!'));
  bot.help((ctx) => ctx.reply('Send /newpayment <amount> to create a payment.'));

  bot.command('cekid', (ctx) => {
    ctx.reply(`Your Telegram ID is: ${ctx.from.id}`);
  });

  bot.command('ping', (ctx) => {
    const startTime = new Date();
    ctx.reply('Pinging...').then((sentMessage) => {
      const endTime = new Date();
      const latency = endTime - startTime;
      const waBotStatus = isWaBotRunning ? 'Online' : 'Offline';
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
