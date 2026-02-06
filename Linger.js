console.clear();
const { config, init } = require('./config.js')
;
const { description, version, name, main } = require("./package.json")
const {
    default: baileys,
    downloadContentFromMessage,
    proto,
    generateWAMessage,
    getContentType,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    GroupSettingChange,
    areJidsSameUser,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeWaSocket,
    makeInMemoryStore,
    useSingleFileAuthState,
    BufferJSON,
    WAFlag,
    ChatModification,
    ReconnectMode,
    ProxyAgent,
    isBaileys,
    DisconnectReason,
    getStream,
    templateMessage
} = require("@whiskeysockets/baileys");

const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');
const { spawn, exec } = require('child_process');
const logger = require('./src/core/logger.js');

// Message utilities
const {
    smsg,
    tanggal,
    getTime,
    isUrl,
    sleep,
    clockString,
    runtime,
    fetchJson,
    getBuffer,
    jsonformat,
    format,
    parseMention,
    getRandom,
    getGroupAdm,
    generateProfilePicture
} = require('./src/core/message.js');

// Config files
const Case = require("./src/lib/system.js");
const OWNER_PATH = './database/owner.json';
const PREMIUM_PATH = './database/premium.json';
const CreatorOnly = false; // Define or import this if it was intended to be used

module.exports = Linger = async (Linger, m, chatUpdate, store) => {
    try {
        // Body and Prefix detection
        const body = m.body || '';
        const budy = (typeof m.text === 'string' ? m.text : '');
        const prefixPattern = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi;
        const prefixMatch = body.match(prefixPattern);
        const prefix = config.prefa ? (prefixMatch ? prefixMatch[0] : "") : (config.prefa ?? "!");

        // Data loading
        let Owner = [];
        let Premium = [];

        try {
            if (fs.existsSync(OWNER_PATH)) {
                Owner = JSON.parse(fs.readFileSync(OWNER_PATH));
            }
        } catch (error) {
            console.error('Error loading owner data:', error);
        }
        if (!Array.isArray(Owner)) Owner = [];

        try {
            if (fs.existsSync(PREMIUM_PATH)) {
                Premium = JSON.parse(fs.readFileSync(PREMIUM_PATH));
            }
        } catch (error) {
            console.error('Error loading premium data:', error);
        }
        if (!Array.isArray(Premium)) Premium = [];

        // Command parsing
        const CMD = body.startsWith(prefix);
        const command = CMD ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = CMD ? body.slice(prefix.length).trim().split(' ').slice(1) : [];
        const text = args.join(' ');

        // Bot and Sender info
        // Hardcode njir
        const cleanJid = (jid) => {
            if (!jid) return jid;
            if (jid.includes('@s.whatsapp.net')) {
                return jid;
            }

            if (jid.includes('@lid')) {
                if (m.key.remoteJidAlt && m.key.remoteJidAlt.includes('@s.whatsapp.net')) {
                    return m.key.remoteJidAlt;
                }

                const number = jid.split('@')[0];
                return number + '@s.whatsapp.net';
            }

            const numberOnly = jid.replace(/[^0-9]/g, '');
            if (numberOnly) {
                return numberOnly + '@s.whatsapp.net';
            }

            return jid;
        };

        const getCorrectSender = (m) => {
            if (m.key.addressingMode === 'lid' && m.key.remoteJidAlt && m.key.remoteJidAlt.includes('@s.whatsapp.net')) {
                return m.key.remoteJidAlt;
            }

            if (m.key.addressingMode === 'pn' && m.key.remoteJid && m.key.remoteJid.includes('@s.whatsapp.net')) {
                return m.key.remoteJid;
            }

            return cleanJid(m.sender);
        };

        const botJid = cleanJid(Linger.user.id);
        const senderJid = getCorrectSender(m);

        const getCorrectFrom = (m) => {
            if (m.key.addressingMode === 'lid' && m.key.remoteJidAlt && m.key.remoteJidAlt.includes('@s.whatsapp.net')) {
                return m.key.remoteJidAlt;
            }
            return m.key.remoteJid;
        };

        const from = getCorrectFrom(m);

        const sender = m.isGroup ? (m.key.participant ? getCorrectSender({ ...m, sender: m.key.participant }) : getCorrectSender(m)) : senderJid;

        const isOwn = [
            ...Owner,
            ...config.owner
        ].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(senderJid) || botJid === senderJid;

        const isPrem = [
            ...Premium,
            ...config.owner
        ].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(senderJid) || botJid === senderJid;

        let quoted = m.quoted || m;

        if (quoted.mtype === 'buttonsMessage') {
            quoted = quoted[Object.keys(quoted)[1]];
        } else if (quoted.mtype === 'templateMessage') {
            quoted = quoted.hydratedTemplate?.[Object.keys(quoted.hydratedTemplate)[1]];
        } else if (quoted.mtype === 'product') {
            quoted = quoted[Object.keys(quoted)[0]];
        }

        // Sender and group info
        const pushname = m.pushName || "No Name";

        let groupMetadata = null;
        let groupName = "";
        let participants = [];
        let groupAdmin = [];
        let botAdmin = false;
        let isAdmin = false;

        if (m.isGroup) {
            try {
                groupMetadata = await Linger.groupMetadata(from);
                groupName = groupMetadata.subject || "";
                participants = groupMetadata.participants || [];
                groupAdmin = await getGroupAdm(participants);
                botAdmin = groupAdmin.includes(botJid);
                isAdmin = groupAdmin.includes(senderJid);
            } catch (error) {
                console.error('Error fetching group metadata:', error);
            }
        }

        //
        const reply = (teks) => {
            Linger.sendMessage(m.chat, {
                text: teks
            }, { quoted: m })
        }
        // Time and date
        const time = moment().tz("Asia/Jakarta").format("HH:mm:ss");

        const todayDateWIB = new Date().toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Helper functions
        const RunTime = `_${runtime(process.uptime())}_`;

        const pickRandom = (arr) => {
            return arr[Math.floor(Math.random() * arr.length)];
        };

        console.log(util.inspect(m, { colors: true, depth: 1 }));

        const logItems = [
            `📅 ${chalk.cyan('Date')}    : ${todayDateWIB}`,
            `🕐 ${chalk.cyan('Time')}    : ${time}`,
            `💬 ${chalk.cyan('Type')}    : ${m.mtype}`,
            `🗣️ ${chalk.cyan('Sender')}  : ${pushname}`,
            `🤖 ${chalk.cyan('Bot')}     : ${botJid}`,
            `📝 ${chalk.cyan('Command')} : ${chalk.yellow(command)}`,
            `📋 ${chalk.cyan('Args')}    : ${args.length > 0 ? chalk.green(args.join(' ')) : chalk.gray('None')}`
        ];

        if (m.isGroup) {
            logItems.splice(3, 0, `🌐 ${chalk.cyan('Group')}   : ${groupName}`);
            logItems.splice(4, 0, `🔑 ${chalk.cyan('Chat ID')} : ${m.chat}`);
            logger.box(`📱 GROUP MESSAGE • ${groupName}`, '#3498db', logItems);
        } else {
            logger.box(`🔒 PRIVATE MESSAGE • ${pushname}`, '#9b59b6', logItems);
        }
        const loadPluginsCommand = require("./src/lib/handler.js")
        const handleData = { Linger, text, args, isOwn, isPrem, CMD, command, reply }
        if (CMD) {
            await loadPluginsCommand(m, command, handleData)
        }
        const handleDataesm = { Linger, text, args, isOwn, isPrem, CMD, command, reply };

        if (CMD) {
            // Dynamic import ESM
            const { default: handleMessage } = await import("./src/lib/handle.mjs");
            await handleMessage(m, command, handleData);
        }
        // Check if bot is public
        if (!Linger.public && !CreatorOnly) {
            if (!isOwn) return;
        }

        // =============== COMMAND HANDLER ===============
        switch (command) {
            // [START CASES]
            // Standard commands are now handled by plugins in src/plugins/

            default:
                // Eval command for owner (=>)
                if (budy.startsWith('=>') && isOwn) {
                    try {
                        const code = budy.slice(2);
                        const result = await eval(`(async () => { return ${code} })()`);
                        const formattedResult = util.format(result);
                        await m.reply(formattedResult);
                    } catch (error) {
                        await m.reply(`❌ Error:\n${error.message}`);
                    }
                }

                // Eval command for owner (>)
                else if (budy.startsWith('>') && isOwn) {
                    try {
                        const code = budy.slice(1);
                        let evaled = await eval(code);
                        if (typeof evaled !== 'string') {
                            evaled = util.inspect(evaled, { depth: 1 });
                        }
                        await m.reply(evaled);
                    } catch (error) {
                        await m.reply(`❌ Error:\n${error.message}`);
                    }
                }

                // Shell command for owner ($)
                else if (budy.startsWith('$') && isOwn) {
                    exec(budy.slice(1), (error, stdout, stderr) => {
                        if (error) {
                            return m.reply(`❌ Error:\n${error.message}`);
                        }
                        if (stderr) {
                            return m.reply(`⚠️ stderr:\n${stderr}`);
                        }
                        if (stdout) {
                            return m.reply(`📤 stdout:\n${stdout}`);
                        }
                        return m.reply('✅ Command executed (no output)');
                    });
                }
                break;
            // [END CASES]
        }

    } catch (error) {
        console.error(chalk.red.bold('Error in message handler:'), error);

        // Send error message to chat if it's a command error
        if (m && m.chat) {
            try {
                await Linger.sendMessage("0@s.whatsapp.net", {
                    text: `❌ Error occurred:\n${error.message}\n\nPlease contact the bot owner if this persists.`
                }, { quoted: m });
            } catch (sendError) {
                console.error('Failed to send error message:', sendError);
            }
        }
    }
};

// Auto-reload on file changes
const currentFile = __filename;
fs.watchFile(currentFile, () => {
    fs.unwatchFile(currentFile);
    console.log(chalk.green(`✓ ${path.basename(currentFile)} updated! Reloading...`));
    delete require.cache[require.resolve(currentFile)];
});