const { Telegraf } = require('telegraf');
const config = require('../config.json');
const { registerPaymentCommands } = require('./payment.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

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

  // Store commands in a map
  bot.cmd = new Map();

  // Dynamically load commands from subdirectories
  const loadCommands = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
              loadCommands(fullPath);
          } else if (file.name.endsWith('.js')) {
              const command = require(fullPath);
              if (command.name) {
                  // Add category to the command object
                  const category = path.basename(dir);
                  command.category = category;
                  bot.cmd.set(command.name, command);
                  // Also register aliases
                  if (command.aliases && Array.isArray(command.aliases)) {
                      command.aliases.forEach(alias => bot.cmd.set(alias, command));
                  }
                  // Register the command with Telegraf
                  const commandCodeWithHelpers = (ctx) => command.code(ctx, helpers);
                  bot.command(command.name, commandCodeWithHelpers);
              }
          }
      }
  };
  loadCommands(path.resolve(__dirname, 'commands'));

  // --- New /start command based on WA Bot's /menu ---
  bot.command('start', async (ctx) => {
      const startTime = Date.now();
      const args = ctx.message.text.split(' ').slice(1);
      const categoryArg = args[0]?.toLowerCase();

      const tag = {
          "information": "Information",
          "tool": "Tool",
          "misc": "Miscellaneous",
          "owner": "Owner"
      };

      // Category-specific view
      if (categoryArg && tag[categoryArg]) {
          let categoryText = "";
          const cmds = Array.from(bot.cmd.values()).filter(c => c.category === categoryArg);
          // Remove duplicates
          const uniqueCmds = [...new Map(cmds.map(item => [item['name'], item])).values()];

          if (uniqueCmds.length > 0) {
              categoryText += `*${tag[categoryArg]} Commands*\n\n`;
              uniqueCmds.forEach(c => {
                  categoryText += `➡️ /${c.name}\n`;
              });
          } else {
              categoryText = `No commands found in category: ${tag[categoryArg]}`;
          }
          return await ctx.reply(categoryText);
      }

      // Full menu view
      const waBotStatus = global.botStatus.wa ? 'Online' : 'Offline';
      const latency = Date.now() - startTime;
      const firstName = escapeMarkdown(ctx.from.first_name);

      let fullMenuText = `Hello, ${firstName}!\nI am the Telegram counterpart to ${config.bot.name}.\n\n`;
      fullMenuText += `*Bot Status*\n`;
      fullMenuText += `Latency: ${latency}ms\n`;
      fullMenuText += `WhatsApp Bot: ${waBotStatus}\n\n`;

      if (categoryArg) {
          fullMenuText += `Category "${categoryArg}" not found.\n\n`;
      }

      fullMenuText += `Here are the available command categories. Type \`/start <category>\` to see the commands.\n\n`;
      Object.keys(tag).forEach(t => {
          fullMenuText += `➡️ ${t}\n`;
      });

      await ctx.replyWithMarkdown(fullMenuText);
  });


  bot.launch();

  console.log('Telegram bot is running...');
};

module.exports = { launchTelegramBot };
