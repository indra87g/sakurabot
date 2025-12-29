const { Telegraf } = require('telegraf');
const config = require('../config.json');
const { registerPaymentCommands } = require('./payment.js');

const launchTelegramBot = () => {
  const token = config.bot.botfather_token;
  if (!token || token === 'YOUR_BOTFATHER_TOKEN') {
    console.log('Telegram bot token not found or not configured. Skipping launch.');
    return;
  }

  const bot = new Telegraf(token);

  // Register payment commands
  registerPaymentCommands(bot);

  bot.start((ctx) => ctx.reply('Welcome!'));
  bot.help((ctx) => ctx.reply('Send /newpayment <amount> to create a payment.'));

  bot.launch();

  console.log('Telegram bot is running...');
};

module.exports = { launchTelegramBot };
