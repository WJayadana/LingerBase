import { exec } from 'child_process'
import util from 'util'

const handler = async (m, { Linger, text, isOwn, command, reply }) => {
    if (!isOwn) return reply('Owner-only command!')
    
    switch (command) {
        case 'restart': {
            await reply('Restarting bot...')
            process.exit()
        }
        break;
        
        case 'setpref': {
            if (!text) return reply('Masukkan prefix baru!')
            // Note: This only changes locally until actual config write logic is added
            const { config } = (await import('../../config.js')).default
            config.prefa = [text]
            reply(`✅ Prefix berhasil diubah ke: ${text}`)
        }
        break;
        
        case 'bc':
        case 'broadcast': {
            if (!text) return reply('Teks mana?')
            let chats = Object.keys(await Linger.groupFetchAllParticipating())
            reply(`Mengirim broadcast ke ${chats.length} grup...`)
            for (let i of chats) {
                await Linger.sendMessage(i, { text: `📢 *BROADCAST OWNER*\n\n${text}` })
            }
            reply('✅ Selesai broadcast.')
        }
        break;
    }
}

handler.command = ["restart", "setpref", "bc", "broadcast"]
export default handler
