module.exports = {
    name: 'delmanager',
    description: 'Remove a manager from the bot.',
    code: async (ctx, { isLeader, removeManager, config }) => {
        if (!isLeader(ctx.from.id)) return ctx.reply(config.msg.notLeader);

        const args = ctx.message.text.split(' ').slice(1);
        const targetId = parseInt(args[0]);

        if (!targetId || isNaN(targetId)) {
            return ctx.reply('Please provide a valid user ID.');
        }

        const success = removeManager(targetId);
        if (!success) {
            return ctx.reply('User is not a manager.');
        }

        ctx.reply(`User ${targetId} has been removed from managers.`);
    }
};
