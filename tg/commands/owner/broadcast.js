const fs = require('fs');
const path = require('path');
const config = require('../../../config.json');

const isOwner = (userId) => {
    return config.bot.tg_owner.includes(userId);
};

const readUsers = () => {
    try {
        const data = fs.readFileSync(path.resolve(__dirname, '../users.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

module.exports = {
    name: 'broadcast',
    description: 'Send a message to all users (owner only).',
    code: (ctx) => {
        if (!isOwner(ctx.from.id)) {
            return ctx.reply('This command is for the owner only.');
        }

        const message = ctx.message.text.split(' ').slice(1).join(' ');
        if (!message) {
            return ctx.reply('Please provide a message to broadcast.');
        }

        const users = readUsers();
        users.forEach(userId => {
            ctx.telegram.sendMessage(userId, message);
        });

        ctx.reply('Broadcast sent to all users.');
    }
};
