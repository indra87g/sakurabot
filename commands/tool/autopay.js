const tools = require("../../tools/exports.js");
const config = require("../../config.json");

module.exports = {
    name: "autopay",
    category: "tool",
    code: async (ctx) => {
        try {
            const nominal = parseInt(ctx.args[0]);

            // Validate the input
            if (isNaN(nominal) || nominal <= 0) {
                return await ctx.reply("Silakan masukkan nominal pembayaran yang valid. Contoh: /autopay 1000");
            }

            // Get slug from config
            const slug = config.bot.pakasir_slug;
            if (!slug || slug === "your-slug-here") {
                return await ctx.reply("Fitur pembayaran otomatis belum dikonfigurasi oleh owner.");
            }

            // Generate random Order ID: TRX-{5 random digits}{1 random letter}
            const randomDigits = Math.floor(10000 + Math.random() * 90000);
            const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
            const orderId = `TRX-${randomDigits}${randomLetter}`;

            // Construct the payment URL
            const paymentUrl = `https://app.pakasir.com/pay/${slug}/${nominal}?order_id=${orderId}`;

            // Send the payment link to the user
            await ctx.reply(`Silakan lakukan pembayaran sejumlah ${nominal} melalui link berikut:\n\n${paymentUrl}`);

        } catch (error) {
            await tools.cmd.handleError(ctx, error);
        }
    }
};
