module.exports = {
    name: 'addmanager',
    description: 'Add a manager to the bot.',
    code: async (ctx, { isLeader, addManager, config }) => {
        if (!isLeader(ctx.from.id)) return ctx.reply(config.msg.notLeader);

        const args = ctx.message.text.split(' ').slice(1);
        const targetId = parseInt(args[0]);

        if (!targetId || isNaN(targetId)) {
            return ctx.reply('Please provide a valid user ID.');
        }

        const success = addManager(targetId);
        if (!success) {
            return ctx.reply('User is already a manager.');
        }

        ctx.reply(`User ${targetId} has been added as a manager.`);
    }
};
