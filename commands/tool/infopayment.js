const { Pakasir } = require("pakasir-sdk");
const config = require("../../config.json");

module.exports = {
    name: "infopayment",
    category: "tool",
    code: async (ctx) => {
        try {
            const fullOrderId = ctx.args[0];

            // Validate input
            if (!fullOrderId || !fullOrderId.includes('-')) {
                return await ctx.reply("Format Order ID tidak valid. Harap gunakan Order ID lengkap yang Anda terima. Contoh: /infopayment TRX-12345A-10000");
            }

            // Parse the combined order ID
            const parts = fullOrderId.split('-');
            const amount = parseInt(parts.pop(), 10);
            const orderId = parts.join('-');

            if (isNaN(amount)) {
                return await ctx.reply("Format Order ID tidak valid: nominal tidak ditemukan.");
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

            // Get payment details using the correct method
            const result = await pakasir.detailPayment(orderId, amount);

            // Check for success
            if (result && result.success && result.data) {
                const payment = result.data;
                let replyText = `✅ Informasi Pembayaran Ditemukan\n\n`;
                replyText += `◦  *Order ID*: \`${fullOrderId}\`\n`;
                replyText += `◦  *Nominal*: Rp${payment.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  *Metode*: ${payment.payment_method}\n`;
                replyText += `◦  *Status*: ${payment.status}\n`;
                replyText += `◦  *Dibuat Pada*: ${new Date(payment.created_at).toLocaleString('id-ID')}\n`;
                if (payment.completed_at) {
                    replyText += `◦  *Selesai Pada*: ${new Date(payment.completed_at).toLocaleString('id-ID')}\n`;
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
