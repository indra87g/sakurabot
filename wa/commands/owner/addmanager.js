module.exports = {
    name: 'addmanager',
    permissions: { leader: true },
    code: async (sock, m, { ctx, addManager }) => {
        const target = await ctx.target(["quoted", "mentioned", "text"]);
        if (!target) return ctx.reply("Silakan tag atau balas pesan user yang ingin dijadikan manager.");

        const success = addManager(target);
        if (!success) {
            return ctx.reply("User tersebut sudah menjadi manager.");
        }

        ctx.reply(`User @${target.split('@')[0]} berhasil ditambahkan sebagai manager.`, { mentions: [target] });
    }
};
