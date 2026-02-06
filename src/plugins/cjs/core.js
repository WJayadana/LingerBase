const Case = require("../../lib/system.js");
const config = require("../../../config.js");
const util = require("util");
const { exec } = require("child_process");

const handler = async (m, { Linger, text, args, isOwn, isPrem, command, reply }) => {
    const { name, version } = require("../../../package.json");
    const { tanggal, getTime, runtime } = require("../../core/message.js");

    switch (command) {
        case "menu": {
            const time = getTime('HH:mm:ss');
            const date = tanggal(new Date());
            const run = runtime(process.uptime());
            
            const teks = `╭───〈 *${name.toUpperCase()}* 〉────
│
│ 🤖 *Bot Name* : ${name}
│ 🌿 *Version*  : ${version}
│ 📅 *Date*     : ${date}
│ 🕐 *Time*     : ${time}
│ ⏳ *Runtime*  : ${run}
│ 👤 *Owner*    : Jayadana
│
╰───────────────────

╭───〈 *CORE TOOLS* 〉────
│ ↝ .plugin
│ ↝ .addplugin
│ ↝ .delplugin
│ ↝ .listplugin
│ ↝ .getplugin
╰───────────────────

╭───〈 *CORE CASES* 〉────
│ ↝ .addcase
│ ↝ .delcase
│ ↝ .listcase
│ ↝ .getcase
│ ↝ .case2plugin
╰───────────────────

╭───〈 *CONVERTERS* 〉────
│ ↝ .sticker
│ ↝ .toimg
│ ↝ .esm2cjs
│ ↝ .cjs2esm
╰───────────────────

╭───〈 *UTILS & AI* 〉────
│ ↝ .ai [query]
│ ↝ .ai-img [query]
│ ↝ .pin [query]
│ ↝ .tt [url]
│ ↝ .quote / .fact
│ ↝ .info / .status
│ ↝ .ping
╰───────────────────

╭───〈 *OWNER ONLY* 〉────
│ ↝ .restart
│ ↝ .setpref
│ ↝ .bc [text]
│ ↝ .public / .self
│ ↝ => [eval]
│ ↝ > [eval]
│ ↝ $ [exec]
╰───────────────────

*Note:* Use prefix [ ${config.prefa[0] || 'none'} ] before command.`;

            Linger.sendMessage(m.chat, {
                text: teks,
                contextInfo: {
                    externalAdReply: {
                        title: `Linger Multi Device Beta`,
                        body: `Simple WhatsApp Bot Base by Jayadana`,
                        thumbnailUrl: config.thumbnail,
                        sourceUrl: "https://github.com/WJayadana/LingerBase",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        }
            break;

        case "getcase": {
            if (!isOwn) return reply("owner-only");
            if (!text) return reply("namaCase");
            try {
                let hasil = Case.get(text);
                reply(hasil);
            } catch (e) {
                reply(e.message);
            }
        }
            break;

        case "addcase": {
            if (!isOwn) return reply("owner-only");
            if (!text) return reply(`case "namacase":{ ... }`);
            try {
                Case.add(text);
                reply("✅ Case berhasil ditambahkan.");
            } catch (e) {
                reply(e.message);
            }
        }
            break;

        case "delcase": {
            if (!isOwn) return reply("owner-only");
            if (!text) return reply("namaCase");
            try {
                Case.delete(text);
                reply(`✅ Case "${text}" berhasil dihapus.`);
            } catch (e) {
                reply(e.message);
            }
        }
            break;

        case "listcase": {
            if (!isOwn) return reply("owner-only");
            try {
                reply("📜 List Case:\n\n" + Case.list());
            } catch (e) {
                reply(e.message);
            }
        }
            break;

        case "case2plugin": {
            let code = text || (m.quoted && m.quoted.text);
            if (!code) return reply("Kirim code case atau reply case!");

            const convertCaseToHandler = (code) => {
                let nameMatch = code.match(/case\s+["'](.+?)["']:/);
                let cmd = nameMatch ? nameMatch[1] : "cmd";
                let body = code
                    .replace(/case\s+["'](.+?)["']:\s*/g, "")
                    .replace(/break/g, "")
                    .trim();

                return `const handler = async (m, { text, args, reply, sock }) => {\n${body}\n}\nhandler.help = ['${cmd}']\nhandler.tags = ['tools']\nhandler.command = ["${cmd}"]\nmodule.exports = handler`;
            };

            let result = convertCaseToHandler(code);
            await reply(`✅ *CASE → HANDLER CJS*\n\n\`\`\`js\n${result}\n\`\`\``);
        }
            break;

        case "cjs2esm": {
            let code = text || (m.quoted && m.quoted.text);
            if (!code) return reply("Kirim kode CJS atau reply file JS!");

            const convertCJS = (code) => {
                let result = code
                    .replace(/const\s+(\w+)\s*=\s*require\(['"](.+?)['"]\)/g, "import $1 from '$2'")
                    .replace(/module\.exports\s*=\s*/g, "export default ")
                    .replace(/exports\.(\w+)\s*=\s*/g, "export const $1 = ");
                return result;
            };

            let esmCode = convertCJS(code);
            await reply(`✅ *CJS → ESM Converted*\n\n\`\`\`js\n${esmCode}\n\`\`\``);
        }
            break;

        case 'esm2cjs': {
            const q = m.quoted ? m.quoted : m;
            const code = (q.msg && (q.msg.text || q.msg.caption)) || q.text || '';
            if (!code) return reply('Kirim/quote kode ESM yang ingin di-convert.');

            try {
                const convertEsmToCjs = (code) => {
                    return code
                        .replace(/import\s+(\w+)\s+from\s+['"](.+?)['"]/g, "const $1 = require('$2')")
                        .replace(/export\s+default\s+/g, "module.exports = ")
                        .replace(/export\s+const\s+(\w+)\s*=\s*/g, "exports.$1 = ");
                };
                let converted = convertEsmToCjs(code);
                const buffer = Buffer.from(converted, 'utf8');
                await Linger.sendMessage(m.chat, {
                    document: buffer,
                    fileName: 'converted.cjs',
                    mimetype: 'text/javascript'
                }, { quoted: m });
            } catch (err) {
                reply('Gagal convert: ' + err.message);
            }
        }
            break;
    }
};

handler.command = ["menu", "getcase", "addcase", "delcase", "listcase", "case2plugin", "cjs2esm", "esm2cjs"];
module.exports = handler;
