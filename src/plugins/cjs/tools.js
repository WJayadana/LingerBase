const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const handler = async (m, { Linger, text, args, isOwn, isPrem, command, reply }) => {
    switch (command) {
        case 'ping': {
            const start = Date.now();
            await reply('Testing speed...');
            const end = Date.now();
            reply(`Pong! Speed: ${end - start}ms`);
        }
        break;

        case 'sticker':
        case 's': {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';
            if (/image|video/.test(mime)) {
                let media = await q.download();
                reply('Processing sticker...');
                await Linger.sendImageAsSticker(m.chat, media, m, {
                    packname: "Linger Base",
                    author: "Jayadana"
                });
            } else {
                reply(`Reply image/video with caption ${command}`);
            }
        }
        break;

        case 'toimg': {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';
            if (!/webp/.test(mime)) return reply('Reply sticker with command .toimg');
            reply('Processing image...');
            let media = await q.download();
            let rand = `temp/${Math.floor(Math.random() * 10000)}.webp`;
            let out = `temp/${Math.floor(Math.random() * 10000)}.png`;
            if (!fs.existsSync('temp')) fs.mkdirSync('temp');
            fs.writeFileSync(rand, media);
            
            exec(`ffmpeg -i ${rand} ${out}`, async (err) => {
                if (fs.existsSync(rand)) fs.unlinkSync(rand);
                if (err) return reply('Failed to convert sticker.');
                await Linger.sendMessage(m.chat, { image: { url: out }, caption: 'Success convert sticker to image' }, { quoted: m });
                if (fs.existsSync(out)) fs.unlinkSync(out);
            });
        }
        break;

        case 'ai': {
            if (!text) return reply('Mau tanya apa?');
            reply('Thinking...');
            try {
                const res = await axios.get(`https://api.yanzbotz.my.id/api/ai/characterai?text=${encodeURIComponent(text)}&name=yvanna`);
                reply(res.data.result);
            } catch (e) {
                console.error(e);
                reply('Error connecting to AI service.');
            }
        }
        break;

        case 'status': {
            const used = process.memoryUsage();
            const cpus = os.cpus();
            const cpu = cpus[0].model;
            const uptime = process.uptime();
            const { runtime } = require("../../core/message.js");

            let teks = `📊 *BOT STATUS*\n\n`;
            teks += `💻 *CPU*: ${cpu}\n`;
            teks += `📂 *RAM*: ${(used.rss / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\n`;
            teks += `⏳ *Uptime*: ${runtime(uptime)}\n`;
            teks += `🤖 *Mode*: ${Linger.public ? 'Public' : 'Self'}\n`;
            teks += `📱 *Platform*: ${os.platform()} ${os.release()}`;
            
            reply(teks);
        }
        break;

        case 'public': {
            if (!isOwn) return reply('Owner-only!');
            Linger.public = true;
            reply('✅ Bot mode set to *PUBLIC*');
        }
        break;

        case 'self': {
            if (!isOwn) return reply('Owner-only!');
            Linger.public = false;
            reply('✅ Bot mode set to *SELF*');
        }
        break;

        case 'hidetag': {
            if (!m.isGroup) return reply('Hanya bisa di grup!');
            if (!isOwn && !m.isAdmin) return reply('Admin-only!');
            let groupMetadata = await Linger.groupMetadata(m.chat);
            let participants = groupMetadata.participants;
            Linger.sendMessage(m.chat, { text: text ? text : '', mentions: participants.map(a => a.id) }, { quoted: m });
        }
        break;
    }
}

handler.command = ["ping", "sticker", "s", "toimg", "ai", "status", "public", "self", "hidetag"];
module.exports = handler;
