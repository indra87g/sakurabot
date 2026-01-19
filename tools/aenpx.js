const { downloadContentFromMessage, getDevice } = require("@rexxhayanasi/elaina-baileys");
const { writeFile } = require("fs/promises");
const path = require("path");

module.exports = async (bot, mek) => {
    try {
        let m = mek.messages[0];

        if (m.key) {
            m.id = m.key.id;
            m.isBaileys = m.id.startsWith("BAE5") || m.id.startsWith("3EB0");
            m.isGroup = m.key.remoteJid.endsWith("@g.us");
            m.from = m.key.remoteJid;
            m.fromMe = m.key.fromMe;
            m.sender = m.fromMe ? bot.user.id.split(":")[0] + "@s.whatsapp.net" : m.key.participant ? m.key.participant : m.from;
        }

        if (m.message) {
            m.type = Object.keys(m.message)[0];
            m.msg = m.message[m.type];

            if (m.type === "conversation") {
                m.body = m.message.conversation;
            } else if (m.type === "extendedTextMessage") {
                m.body = m.message.extendedTextMessage.text;
            } else if (m.type === "imageMessage") {
                m.body = m.message.imageMessage.caption;
            } else if (m.type === "videoMessage") {
                m.body = m.message.videoMessage.caption;
            } else {
                m.body = "";
            }

            m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
            m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];

            if (m.quoted) {
                m.quoted.type = Object.keys(m.quoted)[0];
                m.quoted.id = m.msg.contextInfo.stanzaId;
                m.quoted.sender = m.msg.contextInfo.participant;
                m.quoted.msg = m.quoted[m.quoted.type];
                m.quoted.fromMe = m.quoted.sender === bot.user.id.split(":")[0] + "@s.whatsapp.net";

                m.quoted.download = async () => {
                    const stream = await downloadContentFromMessage(m.quoted.msg, m.quoted.type.replace("Message", ""));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                };
            }
        }

        m.reply = (text) => {
            bot.sendMessage(m.from, { text }, { quoted: m });
        };

        m.device = getDevice(m.id)

        return m;
    } catch (e) {
        console.log(e);
    }
};
