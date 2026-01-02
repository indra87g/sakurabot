module.exports = {
    name: 'addprem',
    description: 'Add a user to the premium list.',
    code: (ctx, { isOwner, readJsonFile, writeJsonFile }) => {
        if (!isOwner(ctx.from.id)) {
            return ctx.reply('This command is only for the owner.');
        }

        const args = ctx.message.text.split(' ');
        if (args.length !== 2) {
            return ctx.reply('Usage: /addprem {user_id}');
        }

        const userId = parseInt(args[1], 10);
        if (isNaN(userId)) {
            return ctx.reply('Invalid user ID.');
        }

        const users = readJsonFile('users.json');
        if (!users.includes(userId)) {
            return ctx.reply('User has not started the bot yet. They need to start the bot first.');
        }

        const premiumUsers = readJsonFile('premium.json');
        if (premiumUsers.includes(userId)) {
            return ctx.reply('User is already a premium member.');
        }

        premiumUsers.push(userId);
        writeJsonFile('premium.json', premiumUsers);

        ctx.reply(`User ${userId} has been added to the premium list.`);
    }
};
