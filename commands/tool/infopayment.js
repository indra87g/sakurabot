const { Pakasir } = require("pakasir-sdk");
const config = require("../../config.json");

module.exports = {
    name: "infopayment",
    category: "tool",
    code: async (ctx) => {
        try {
            const fullOrderId = ctx.args[0];

            if (!fullOrderId || !fullOrderId.includes('-')) {
                return await ctx.reply("Format Order ID tidak valid. Harap gunakan Order ID lengkap yang Anda terima. Contoh: /infopayment TRX-12345A-10000");
            }

            const parts = fullOrderId.split('-');
            const amount = parseInt(parts.pop(), 10);
            const orderId = parts.join('-');

            if (isNaN(amount)) {
                return await ctx.reply("Format Order ID tidak valid: nominal tidak ditemukan.");
            }

            const slug = config.bot.pakasir_slug;
            const apikey = config.bot.pakasir_apikey;
            if (!slug || slug === "your-slug-here" || !apikey || apikey === "your-api-key-here") {
                return await ctx.reply("Fitur pembayaran belum dikonfigurasi oleh owner.");
            }

            await ctx.reply(`Mencari informasi untuk Order ID: ${orderId}...`);

            const pakasir = new Pakasir({ slug, apikey });
            const result = await pakasir.detailPayment(orderId, amount);

            // Corrected: The SDK returns the payload directly on success or throws on error.
            if (result) {
                let replyText = `✅ Informasi Pembayaran Ditemukan\n\n`;
                replyText += `◦  *Order ID*: \`${fullOrderId}\`\n`;
                replyText += `◦  *Nominal*: Rp${result.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  *Metode*: ${result.payment_method}\n`;
                replyText += `◦  *Status*: ${result.status}\n`;
                // Corrected: The property is expired_at, not created_at
                if (result.expired_at) {
                    replyText += `◦  *Kedaluwarsa*: ${new Date(result.expired_at).toLocaleString('id-ID')}\n`;
                }
                if (result.completed_at) {
                    replyText += `◦  *Selesai Pada*: ${new Date(result.completed_at).toLocaleString('id-ID')}\n`;
                }
                await ctx.reply(replyText);
            } else {
                 // This case might not be reached if SDK throws, but as a fallback:
                await ctx.reply('Gagal mendapatkan informasi pembayaran. Order ID tidak ditemukan.');
            }

        } catch (error) {
            console.error(error);
            await ctx.reply(`Maaf, terjadi kesalahan saat memproses permintaan: ${error.message}`);
        }
    }
};
