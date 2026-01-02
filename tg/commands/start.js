const { Markup } = require('telegraf');

module.exports = {
    name: 'start',
    description: 'Start the bot and see available commands.',
    code: (ctx) => {
        const userCommands = [
            '/start - Start the bot',
            '/help - Show this help message',
            '/ping - Check the bot\'s latency',
            '/cekid - Get your Telegram ID',
            '/newpayment <amount> - Create a new payment'
        ];

        const ownerCommands = [
            '/eval <command> - Execute a shell command',
            '/broadcast <message> - Send a message to all users',
            '/newtesti <text> (reply to an image) - Add a new testimonial'
        ];

        const caption = `
User Commands:
${userCommands.join('\n')}

Owner Commands:
${ownerCommands.join('\n')}
        `;

        const randomImageUrl = `https://picsum.photos/1280/720?random=${Date.now()}`;

        ctx.replyWithPhoto({ url: randomImageUrl }, { caption: caption });
    }
};
