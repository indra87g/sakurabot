module.exports = {
    name: 'broadcast',
    category: 'owner',
    description: 'Send a message to all users (owner only).',
    code: async (ctx, { isOwner, db }) => {
        if (!isOwner(ctx.from.id)) {
            return ctx.reply('This command is for the owner only.');
        }

        const message = ctx.message.text.split(' ').slice(1).join(' ');
        if (!message) {
            return ctx.reply('Please provide a message to broadcast.');
        }

        const users = db.get('users');
        if (!users || users.length === 0) {
            return ctx.reply('There are no users to broadcast to.');
        }

        let successCount = 0;
        let failureCount = 0;

        await ctx.reply(`Starting broadcast to ${users.length} users...`);

        for (const userId of users) {
            try {
                // Avoid sending to the owner who initiated the broadcast
                if (userId !== ctx.from.id) {
                    await ctx.telegram.sendMessage(userId, message);
                }
                successCount++;
            } catch (error) {
                console.error(`Failed to send message to user ${userId}:`, error.description);
                failureCount++;
            }
        }

        ctx.reply(`Broadcast finished.\n✅ Sent to ${successCount} users.\n❌ Failed for ${failureCount} users.`);
    }
};
