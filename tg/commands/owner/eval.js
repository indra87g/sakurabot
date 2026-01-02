const { exec } = require('child_process');
const config = require('../../../config.json');

const isOwner = (userId) => {
    return config.bot.tg_owner.includes(userId);
};

module.exports = {
    name: 'eval',
    description: 'Execute a shell command (owner only).',
    code: (ctx) => {
        if (!isOwner(ctx.from.id)) {
            return ctx.reply('This command is for the owner only.');
        }

        const command = ctx.message.text.split(' ').slice(1).join(' ');
        if (!command) {
            return ctx.reply('Please provide a command to execute.');
        }

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return ctx.reply(`Error: ${error.message}`);
            }
            if (stderr) {
                return ctx.reply(`Stderr: ${stderr}`);
            }
            ctx.reply(`Output: ${stdout}`);
        });
    }
};
