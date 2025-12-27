const { Pakasir } = require("pakasir-sdk");
const config = require("../../config.json");

module.exports = {
    name: "infopayment",
    category: "tool",
    code: async (ctx) => {
        try {
            const orderId = ctx.args[0];

            // Validate input
            if (!orderId) {
                return await ctx.reply("Silakan masukkan Order ID yang ingin diperiksa. Contoh: /infopayment TRX-12345A");
            }

            // Check for configuration
            const slug = config.bot.pakasir_slug;
            const apikey = config.bot.pakasir_apikey;
            if (!slug || slug === "your-slug-here" || !apikey || apikey === "your-api-key-here") {
                return await ctx.reply("Fitur pembayaran belum dikonfigurasi oleh owner.");
            }

            await ctx.reply(`Mencari informasi untuk Order ID: ${orderId}...`);

            // Initialize Pakasir SDK
            const pakasir = new Pakasir({ slug, apikey });

            // Get payment details
            const result = await pakasir.getPaymentDetails(orderId);

            // Check for success
            if (result && result.success && result.data) {
                const payment = result.data;
                let replyText = `✅ Informasi Pembayaran Ditemukan\n\n`;
                replyText += `◦  *Order ID*: \`${payment.order_id}\`\n`;
                replyText += `◦  *Nominal*: Rp${payment.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  *Metode*: ${payment.payment_method}\n`;
                replyText += `◦  *Status*: ${payment.status}\n`;
                replyText += `◦  *Dibuat Pada*: ${new Date(payment.created_at).toLocaleString('id-ID')}\n`;
                if (payment.paid_at) {
                    replyText += `◦  *Dibayar Pada*: ${new Date(payment.paid_at).toLocaleString('id-ID')}\n`;
                }

                await ctx.reply(replyText);
            } else {
                await ctx.reply(`Gagal mendapatkan informasi pembayaran. Pesan: ${result.message || 'Order ID tidak ditemukan.'}`);
            }

        } catch (error) {
            console.error(error);
            await ctx.reply("Maaf, terjadi kesalahan internal saat memproses permintaan.");
        }
    }
};
