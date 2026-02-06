console.clear();
const { config, init } = require('./config.js')
;

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore,
    jidDecode,
    proto,
    getAggregateVotesInPollMessage
} = require("@whiskeysockets/baileys");

const chalk = require('chalk');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const FileType = require('file-type');
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const path = require('path');
const NodeCache = require("node-cache");
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep } = require('./src/core/message.js');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./src/lib/exif.js');
const MediaHandler = require('./src/core/media.js');

const usePairingCode = true;

function question(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        });
    });
};

//===================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(init.session);
    const Linger = makeWASocket({
        printQRInTerminal: !usePairingCode,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }

            return message;
        },
        version: [99963, 950125916, 0],
        logger: pino({
            level: 'silent' // Set 'fatal' for production
        }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino().child({
                level: 'silent',
                stream: 'store'
            })),
        }
    });

    const media = new MediaHandler(Linger, { getBuffer, getSizeMedia });
    Linger.media = media; // Attach for easy access in handlers

    if (!Linger.authState.creds.registered) {

        const phoneNumber = await question(chalk.blue(`Enter Your Number\nYour Number: `));

        const code = await Linger.requestPairingCode(phoneNumber, init.customPair);
        console.log(chalk.green(`\nCode: ${code}`));
    }

    //===================
    Linger.ev.on('call', async (caller) => {
        console.log("CALL OUTGOING");
    });

    Linger.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    Linger.ev.on('messages.upsert', async chatUpdate => {
        try {
            mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
            if (!Linger.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
            let m = smsg(Linger, mek, null);

            // Loop guard: Skip own messages unless it's a specific owner-only eval command
            if (m.fromMe && !m.body.startsWith('>') && !m.body.startsWith('=>') && !m.body.startsWith('$')) return;

            require("./Linger.js")(Linger, m, chatUpdate, null);
        } catch (error) {
            console.error("Error processing message upsert:", error);
        }
    });

    Linger.getFile = (PATH, save) => media.getFile(PATH, save);
    Linger.downloadMediaMessage = (message) => media.downloadMediaMessage(message);

    Linger.sendText = (jid, text, quoted = '', options) => Linger.sendMessage(jid, { text, ...options }, { quoted });

    Linger.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author) ? await writeExifImg(buff, options) : await imageToWebp(buff);
        await Linger.sendMessage(jid, { sticker: buffer, ...options }, { quoted });
        return buffer;
    };

    Linger.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = options && (options.packname || options.author) ? await writeExifVid(buff, options) : await videoToWebp(buff);
        await Linger.sendMessage(jid, { sticker: buffer, ...options }, { quoted });
        return buffer;
    };

    Linger.downloadAndSaveMediaMessage = (message, filename, attachExtension) =>
        media.downloadAndSaveMediaMessage(message, filename, attachExtension);

    // Tambahan fungsi send media
    Linger.sendMedia = async (jid, path, caption = '', quoted = '', options = {}) => {
        let { mime, data } = await Linger.getFile(path, true);
        let messageType = mime.split('/')[0];
        let messageContent = {};

        if (messageType === 'image') {
            messageContent = { image: data, caption: caption, ...options };
        } else if (messageType === 'video') {
            messageContent = { video: data, caption: caption, ...options };
        } else if (messageType === 'audio') {
            messageContent = { audio: data, ptt: options.ptt || false, ...options };
        } else {
            messageContent = { document: data, mimetype: mime, fileName: options.fileName || 'file' };
        }

        await Linger.sendMessage(jid, messageContent, { quoted });
    };

    Linger.sendPoll = async (jid, question, options) => {
        const pollMessage = {
            pollCreationMessage: {
                name: question,
                options: options.map(option => ({ optionName: option })),
                selectableCount: 1,
            },
        };

        await Linger.sendMessage(jid, pollMessage);
    };

    Linger.public = true;

    Linger.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log("Linger Base Connected!")
        }
    });

    Linger.ev.on('error', (err) => {
        console.error(chalk.red("Error: "), err.message || err);
    });

    Linger.ev.on('creds.update', saveCreds);
}
connectToWhatsApp();