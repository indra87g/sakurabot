const { Pakasir } = require("pakasir-sdk");
const config = require("../../config.json");

module.exports = {
    name: "newpayment",
    category: "tool",
    code: async (ctx) => {
        try {
            const nominal = parseInt(ctx.args[0]);

            // Validate input
            if (isNaN(nominal) || nominal <= 0) {
                return await ctx.reply("Silakan masukkan nominal pembayaran yang valid. Contoh: /newpayment 10000");
            }

            // Check for configuration
            const slug = config.bot.pakasir_slug;
            const apikey = config.bot.pakasir_apikey;
            if (!slug || slug === "your-slug-here" || !apikey || apikey === "your-api-key-here") {
                return await ctx.reply("Fitur pembayaran belum dikonfigurasi oleh owner.");
            }

            await ctx.reply("Membuat permintaan pembayaran baru...");

            // Initialize Pakasir SDK
            const pakasir = new Pakasir({ slug, apikey });

            // Generate a random Order ID
            const randomDigits = Math.floor(10000 + Math.random() * 90000);
            const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
            const orderId = `TRX-${randomDigits}${randomLetter}`;

            // Create payment
            const result = await pakasir.createPayment('qris', orderId, nominal);

            // Check for success
            if (result && result.success && result.data) {
                let replyText = `✅ Pembayaran berhasil dibuat!\n\n`;
                replyText += `◦  *Order ID*: \`${result.data.order_id}\`\n`;
                replyText += `◦  *Nominal*: Rp${result.data.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  *Status*: ${result.data.status}\n\n`;
                replyText += `Silakan selesaikan pembayaran dengan memindai kode QRIS di atas.`;

                // Send QRIS image
                await ctx.replyWithPhoto({ url: result.data.qris_url }, { caption: replyText });

            } else {
                await ctx.reply(`Gagal membuat pembayaran. Respon dari server: ${result.message || 'Tidak ada pesan'}`);
            }

        } catch (error) {
            console.error(error);
            await ctx.reply("Maaf, terjadi kesalahan internal saat memproses permintaan pembayaran.");
        }
    }
};
