const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu');
const config = require('../config.json');

const isOwner = (ctx) => {
    if (!ctx.from) return false;
    return config.bot.tg_owner.includes(ctx.from.id);
};

const userCommands = {
    '/me': 'Show your user info',
    '/ping': 'Check bot latency',
    '/newpayment <amount>': 'Create a new payment',
};

const ownerCommands = {
    '/broadcast <message>': 'Broadcast to all users',
    '/broadcastgc <message>': 'Broadcast to groups (costs coins)',
    '/addprem <user_id>': 'Add a premium user',
    '/ban <user_id> <hours>': 'Ban a user',
    '/givecoin <user_id> <amount>': 'Give coins to a user',
    '/eval <command>': 'Execute shell command',
};

const menu = new MenuTemplate(ctx => `Welcome, ${ctx.from.first_name}! Here are the available commands:`);

const userMenu = new MenuTemplate('User Commands');
for (const [command, description] of Object.entries(userCommands)) {
    userMenu.interact(command, `cmd_${command.split(' ')[0].slice(1)}`, {
        do: async ctx => {
            await ctx.answerCbQuery(`Use the command: ${command}`);
            return false;
        },
        joinLastRow: true
    });
}

const ownerMenu = new MenuTemplate('Owner Commands');
for (const [command, description] of Object.entries(ownerCommands)) {
    ownerMenu.interact(command, `cmd_${command.split(' ')[0].slice(1)}`, {
        do: async ctx => {
            await ctx.answerCbQuery(`Use the command: ${command}`);
            return false;
        },
        joinLastRow: true
    });
}


menu.submenu('User Commands', 'user-commands', userMenu);
menu.submenu('Owner Commands', 'owner-commands', ownerMenu, {
    hide: ctx => !isOwner(ctx)
});

const menuMiddleware = new MenuMiddleware('start/', menu);

module.exports = { menuMiddleware, isOwner };
