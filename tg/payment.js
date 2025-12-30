const { Pakasir } = require("pakasir-sdk");
const config = require("../config.json");

const registerPaymentCommands = (bot) => {
    bot.command('newpayment', async (ctx) => {
        try {
            const args = ctx.message.text.split(' ');
            const nominal = parseInt(args[1]);

            // Validate input
            if (isNaN(nominal) || nominal < 500) {
                return await ctx.reply("Silakan masukkan nominal pembayaran yang valid (minimal Rp500). Contoh: /newpayment 10000");
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

            // Generate a random part for the Order ID
            const randomPart = `TRX-${Math.floor(10000 + Math.random() * 90000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
            const orderId = `${randomPart}-${nominal}`; // Embed amount in the order ID

            // Create payment
            const result = await pakasir.createPayment('qris', randomPart, nominal);

            // Check for success and the correct URL property
            if (result && result.payment_url) {
                let replyText = `✅ Pembayaran berhasil dibuat!\n\n`;
                replyText += `◦  Order ID: ${orderId}\n`; // Show the full ID to the user
                replyText += `◦  Nominal: Rp${result.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  Status: ${result.status}\n\n`;
                replyText += `Gunakan Order ID di atas untuk memeriksa status (/infopayment) atau membatalkan (/cancelpayment) pembayaran.\n\n`;
                replyText += `Silakan selesaikan pembayaran melalui tautan berikut:\n${result.payment_url}`;

                await ctx.reply(replyText);

            } else {
                await ctx.reply(`Gagal membuat pembayaran. Pastikan konfigurasi benar dan coba lagi.`);
            }

        } catch (error) {
            console.error(error);
            await ctx.reply(`Maaf, terjadi kesalahan saat memproses permintaan pembayaran: ${error.message}`);
        }
    });

    bot.command('infopayment', async (ctx) => {
        try {
            const args = ctx.message.text.split(' ');
            const fullOrderId = args[1];

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

            if (result) {
                let replyText = `✅ Informasi Pembayaran Ditemukan\n\n`;
                replyText += `◦  Order ID: ${fullOrderId}\n`;
                replyText += `◦  Nominal: Rp${result.amount.toLocaleString('id-ID')}\n`;
                replyText += `◦  Metode: ${result.payment_method}\n`;
                replyText += `◦  Status: ${result.status}\n`;
                if (result.expired_at) {
                    replyText += `◦  Kedaluwarsa: ${new Date(result.expired_at).toLocaleString('id-ID')}\n`;
                }
                if (result.completed_at) {
                    replyText += `◦  Selesai Pada: ${new Date(result.completed_at).toLocaleString('id-ID')}\n`;
                }
                await ctx.reply(replyText);
            } else {
                await ctx.reply('Gagal mendapatkan informasi pembayaran. Order ID tidak ditemukan.');
            }

        } catch (error) {
            console.error(error);
            await ctx.reply(`Maaf, terjadi kesalahan saat memproses permintaan: ${error.message}`);
        }
    });

    bot.command('cancelpayment', async (ctx) => {
        try {
            const args = ctx.message.text.split(' ');
            const fullOrderId = args[1];

            if (!fullOrderId || !fullOrderId.includes('-')) {
                return await ctx.reply("Format Order ID tidak valid. Harap gunakan Order ID lengkap yang Anda terima. Contoh: /cancelpayment TRX-12345A-10000");
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

            await ctx.reply(`Mengirim permintaan pembatalan untuk Order ID: ${orderId}...`);

            const pakasir = new Pakasir({ slug, apikey });
            const result = await pakasir.cancelPayment(orderId, amount);

            if (result && result.status === 'canceled') {
                await ctx.reply(`✅ Pembayaran untuk Order ID ${fullOrderId} berhasil dibatalkan.`);
            } else {
                await ctx.reply(`Gagal membatalkan pembayaran. Status saat ini: ${result.status || 'Tidak Diketahui'}.`);
            }

        } catch (error) {
            console.error(error);
            await ctx.reply(`Maaf, terjadi kesalahan saat memproses permintaan pembatalan: ${error.message}`);
        }
    });
};

module.exports = { registerPaymentCommands };
