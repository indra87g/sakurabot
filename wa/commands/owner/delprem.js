module.exports = {
    name: 'delprem',
    permissions: { owner: true },
    code: async (sock, m, { ctx, removePremium }) => {
        const target = await ctx.target(["quoted", "mentioned", "text"]);
        if (!target) return ctx.reply("Silakan tag atau balas pesan user yang ingin dihapus dari premium.");

        const success = removePremium(target);
        if (!success) {
            return ctx.reply("User tersebut bukan premium.");
        }

        ctx.reply(`User @${target.split('@')[0]} berhasil dihapus dari premium.`, { mentions: [target] });
    }
};
