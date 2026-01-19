// Fungsi untuk membuat vCard string
const createVCard = (name, org, number) => {
    return `BEGIN:VCARD\n` +
           `VERSION:3.0\n` +
           `FN:${name}\n` +
           `ORG:${org}\n` +
           `TEL;type=CELL;type=VOICE;waid=${number}:${number}\n` +
           `END:VCARD`;
};

module.exports = {
    name: "owner",
    aliases: ["creator", "developer"],
    category: "information",
    execute: async ({ bot, m }) => {
        try {
            const owner = config.owner;
            const ownerVCard = createVCard(owner.name, owner.organization, owner.id);

            const coOwners = (owner.co && Array.isArray(owner.co)) ? owner.co.map(co => ({
                vcard: createVCard(co.name, co.organization || owner.organization, co.id)
            })) : [];

            const contactsToSend = [
                { vcard: ownerVCard },
                ...coOwners
            ];

            const displayName = contactsToSend.length > 1 ? `${contactsToSend.length} Kontak Owner` : owner.name;

            await bot.sendMessage(m.from, {
                contacts: {
                    displayName: displayName,
                    contacts: contactsToSend
                }
            });
        } catch (error) {
            console.error("Error di owner.js:", error);
            m.reply("Terjadi kesalahan saat mengirim kontak owner.");
        }
    }
};