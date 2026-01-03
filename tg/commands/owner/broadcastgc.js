module.exports = {
    name: 'broadcastgc',
    category: 'owner',
    description: 'Broadcast a message to all registered groups.',
    code: async (ctx, { isOwner, db, escapeMarkdown }) => {
        if (!isOwner(ctx.from.id)) {
            return ctx.reply('This command is for owners only.');
        }

        const args = ctx.message.text.split(' ').slice(1);
        const message = args.join(' ');

        if (!message) {
            return ctx.reply('Usage: /broadcastgc {message}');
        }

        const groups = db.get('groups');
        if (!groups || groups.length === 0) {
            return ctx.reply('There are no groups registered for broadcast.');
        }

        let successCount = 0;
        let failureCount = 0;

        await ctx.reply(`Starting broadcast to ${groups.length} groups...`);

        for (const groupId of groups) {
            try {
                const senderName = escapeMarkdown(ctx.from.first_name);
                await ctx.telegram.sendMessage(groupId, `📢 *Broadcast Message* 📢\n\n${escapeMarkdown(message)}\n\n- Sent by ${senderName}`, { parse_mode: 'Markdown' });
                successCount++;
            } catch (error) {
                console.error(`Failed to send message to group ${groupId}:`, error);
                failureCount++;
            }
        }

        let feedback = `Broadcast finished.\n✅ Sent to ${successCount} groups.\n❌ Failed for ${failureCount} groups.`;

        ctx.reply(feedback);
    }
};
