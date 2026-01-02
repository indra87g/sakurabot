const { Telegraf, Markup } = require('telegraf');
const config = require('../config.json');
const { registerPaymentCommands } = require('./payment.js');
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

// Helper function to escape markdown characters for safe inclusion in messages
const escapeMarkdown = (text) => {
    if (typeof text !== 'string') {
        return text;
    }
    // Escapes *, _, `, and [
    return text.replace(/([_*`\[])/g, '\\$1');
};


const launchTelegramBot = () => {
  const token = config.bot.botfather_token;
  const bot = new Telegraf(token);

  const helpers = {
      isOwner,
      isPremium,
      getCoins,
      updateCoins,
      readJsonFile,
      writeJsonFile,
      escapeMarkdown
  };

  // Use middlewares
  bot.use(banMiddleware);
  bot.use(addUserMiddleware);

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

  // --- New Start Command with Inline Keyboard ---

  const userCommandsText = `
*User Commands:*
/me - Show your user info
/ping - Check bot latency
/newpayment <amount> - Create a new payment
/broadcastgc <message> - Broadcast to groups (costs coins)
  `;

  const ownerCommandsText = `
*Owner Commands:*
/broadcast <message> - Broadcast to all users
/broadcastgc <message> - Broadcast to groups
/addprem <user_id> - Add a premium user
/ban <user_id> <hours> - Ban a user
/givecoin <user_id> <amount> - Give coins to a user
/eval <command> - Execute shell command
  `;

  const mainMenuKeyboard = (ctx) => {
      const buttons = [Markup.button.callback('User Commands', 'show_user_commands')];
      if (isOwner(ctx.from.id)) {
          buttons.push(Markup.button.callback('Owner Commands', 'show_owner_commands'));
      }
      return Markup.inlineKeyboard(buttons, { columns: 2 });
  };

  const welcomeMessage = (ctx) => {
      const firstName = escapeMarkdown(ctx.from.first_name);
      return `Welcome, ${firstName}! Here are the available commands:`;
  };

  bot.command('start', (ctx) => {
      const randomImageUrl = `https://picsum.photos/1280/720?random=${Date.now()}`;
      ctx.replyWithPhoto(
          { url: randomImageUrl },
          {
              caption: welcomeMessage(ctx),
              parse_mode: 'Markdown',
              reply_markup: mainMenuKeyboard(ctx).reply_markup
          }
      );
  });

  // Action handlers for the buttons
  bot.action('show_user_commands', (ctx) => {
      ctx.editMessageCaption(userCommandsText, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
              Markup.button.callback('⬅️ Back', 'main_menu')
          ]).reply_markup
      });
  });

  bot.action('show_owner_commands', (ctx) => {
      if (!isOwner(ctx.from.id)) {
          return ctx.answerCbQuery('You are not an owner.', { show_alert: true });
      }
      ctx.editMessageCaption(ownerCommandsText, {
          parse_mode: 'Markdown',
          reply_markup: Markup.inlineKeyboard([
              Markup.button.callback('⬅️ Back', 'main_menu')
          ]).reply_markup
      });
  });

  bot.action('main_menu', (ctx) => {
      ctx.editMessageCaption(welcomeMessage(ctx), {
          parse_mode: 'Markdown',
          reply_markup: mainMenuKeyboard(ctx).reply_markup
      });
  });


  bot.launch();

  console.log('Telegram bot is running...');
};

module.exports = { launchTelegramBot };
