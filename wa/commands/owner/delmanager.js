module.exports = {
    name: 'delmanager',
    permissions: { leader: true },
    code: async (sock, m, { ctx, removeManager }) => {
        const target = await ctx.target(["quoted", "mentioned", "text"]);
        if (!target) return ctx.reply("Silakan tag atau balas pesan user yang ingin dihapus dari manager.");

        const success = removeManager(target);
        if (!success) {
            return ctx.reply("User tersebut bukan manager.");
        }

        ctx.reply(`User @${target.split('@')[0]} berhasil dihapus dari manager.`, { mentions: [target] });
    }
};
