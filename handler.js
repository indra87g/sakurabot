const {
    bot: botConfig,
    owner
} = config;

module.exports = async (bot, m) => {
    try {
        const body = m.body;
        const prefix = botConfig.prefix || "/";
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(" ");

        if (!isCmd) return;

        const cmd = bot.commands.get(command);
        if (!cmd) return;

        // Cek pemilik
        const isOwner = [owner.id, ...owner.co.map(co => co.id)].includes(m.sender.split("@")[0]);

        if (cmd.owner && !isOwner) {
            return m.reply("Perintah ini hanya untuk pemilik bot.");
        }

        // Jalankan perintah
        try {
            await cmd.execute({
                bot,
                m,
                args,
                text,
                isOwner
            });
        } catch (error) {
            console.error(`Error executing command ${command}:`, error);
            m.reply("Terjadi kesalahan saat menjalankan perintah.");
        }

    } catch (e) {
        console.log(e);
    }
};
