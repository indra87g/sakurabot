const { Pakasir } = require("pakasir-sdk");
const config = require("../../config.json");

module.exports = {
    name: "cancelpayment",
    category: "tool",
    code: async (ctx) => {
        try {
            const orderId = ctx.args[0];

            // Validate input
            if (!orderId) {
                return await ctx.reply("Silakan masukkan Order ID yang ingin dibatalkan. Contoh: /cancelpayment TRX-12345A");
            }

            // Check for configuration
            const slug = config.bot.pakasir_slug;
            const apikey = config.bot.pakasir_apikey;
            if (!slug || slug === "your-slug-here" || !apikey || apikey === "your-api-key-here") {
                return await ctx.reply("Fitur pembayaran belum dikonfigurasi oleh owner.");
            }

            await ctx.reply(`Mengirim permintaan pembatalan untuk Order ID: ${orderId}...`);

            // Initialize Pakasir SDK
            const pakasir = new Pakasir({ slug, apikey });

            // Cancel the payment
            const result = await pakasir.cancelPayment(orderId);

            // Check for success
            if (result && result.success) {
                await ctx.reply(`✅ Permintaan pembatalan untuk Order ID \`${orderId}\` berhasil dikirim.`);
            } else {
                await ctx.reply(`Gagal membatalkan pembayaran. Pesan: ${result.message || 'Order ID tidak ditemukan atau pembayaran tidak dapat dibatalkan.'}`);
            }

        } catch (error) {
            console.error(error);
            await ctx.reply("Maaf, terjadi kesalahan internal saat memproses permintaan pembatalan.");
        }
    }
};
