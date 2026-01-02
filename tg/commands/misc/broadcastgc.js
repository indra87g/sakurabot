module.exports = {
    name: 'broadcastgc',
    description: 'Broadcast a message to all registered groups.',
    code: async (ctx, { isOwner, isPremium, getCoins, updateCoins, readJsonFile }) => {
        const userId = ctx.from.id;
        const args = ctx.message.text.split(' ').slice(1);
        const message = args.join(' ');

        if (!message) {
            return ctx.reply('Usage: /broadcastgc {message}');
        }

        const groups = readJsonFile('groups.json');
        if (groups.length === 0) {
            return ctx.reply('There are no groups registered for broadcast.');
        }

        const costPerGroup = isPremium(userId) ? 1 : 2;
        const totalCost = groups.length * costPerGroup;
        const userCoins = getCoins(userId);

        if (!isOwner(userId)) {
            if (userCoins < totalCost) {
                return ctx.reply(`You don't have enough coins. You need ${totalCost} coins, but you only have ${userCoins}.`);
            }
            updateCoins(userId, userCoins - totalCost);
        }

        let successCount = 0;
        let failureCount = 0;

        await ctx.reply(`Starting broadcast to ${groups.length} groups...`);

        for (const groupId of groups) {
            try {
                await ctx.telegram.sendMessage(groupId, `📢 *Broadcast Message* 📢\n\n${message}\n\n- Sent by ${ctx.from.first_name}`, { parse_mode: 'Markdown' });
                successCount++;
            } catch (error) {
                console.error(`Failed to send message to group ${groupId}:`, error);
                failureCount++;
            }
        }

        let feedback = `Broadcast finished.\n✅ Sent to ${successCount} groups.\n❌ Failed for ${failureCount} groups.`;
        if (!isOwner(userId)) {
            feedback += `\n\nYou were charged ${totalCost} coins. Your new balance is ${getCoins(userId)}.`;
        }

        ctx.reply(feedback);
    }
};
