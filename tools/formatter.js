// File ini dibuat untuk kompatibilitas mundur selama migrasi.
// Ia mereplikasi fungsionalitas dasar dari objek formatter lama
// menggunakan sintaks Markdown standar.

const formatter = {
    bold: (text) => `*${text}*`,
    italic: (text) => `_${text}_`,
    monospace: (text) => `\`\`\`${text}\`\`\``,
    strikethrough: (text) => `~${text}~`
};

module.exports = formatter;
