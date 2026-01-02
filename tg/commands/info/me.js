module.exports = {
    name: 'me',
    description: 'Get your user information.',
    code: (ctx, { isOwner, isPremium, getCoins, escapeMarkdown }) => {
        const user = ctx.from;
        if (!user) {
            return ctx.reply('Could not get user information.');
        }

        const userId = user.id;
        const name = escapeMarkdown(user.first_name + (user.last_name ? ` ${user.last_name}` : ''));
        const username = user.username ? escapeMarkdown(`@${user.username}`) : 'N/A';
        const coins = getCoins(userId);

        let status = 'User';
        if (isOwner(userId)) {
            status = 'Owner';
        } else if (isPremium(userId)) {
            status = 'Premium';
        }

        const message = `
👤 *User Info*

*Name:* ${name}
*Username:* ${username}
*Telegram ID:* \`${userId}\`
*Status:* ${status}
*Coins:* ${coins}
        `;

        ctx.replyWithMarkdown(message);
    }
};
