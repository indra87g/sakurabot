module.exports = {
    name: 'addprem',
    permissions: { owner: true },
    code: async (sock, m, { ctx, addPremium }) => {
        const target = await ctx.target(["quoted", "mentioned", "text"]);
        if (!target) return ctx.reply("Silakan tag atau balas pesan user yang ingin dijadikan premium.");

        const success = addPremium(target);
        if (!success) {
            return ctx.reply("User tersebut sudah menjadi premium.");
        }

        ctx.reply(`User @${target.split('@')[0]} berhasil ditambahkan sebagai premium.`, { mentions: [target] });
    }
};
