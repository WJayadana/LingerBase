import axios from 'axios'

const handler = async (m, { Linger, text, reply }) => {
    if (!text) return reply('Mana link TikTok-nya?')
    if (!text.includes('tiktok.com')) return reply('Link tidak valid!')
    
    reply('Downloading video...')
    
    try {
        const res = await axios.get(`https://api.yanzbotz.my.id/api/downloader/tiktok?url=${encodeURIComponent(text)}`)
        const data = res.data.result
        
        if (data && data.video) {
            await Linger.sendMessage(m.chat, { 
                video: { url: data.video }, 
                caption: `✅ *TikTok Download Success*\n\n👤 *Author*: ${data.author || 'Unknown'}\n📝 *Desc*: ${data.title || 'No description'}`,
                fileName: `tiktok.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            reply('Gagal mengambil video. Link mungkin private atau API down.')
        }
    } catch (e) {
        console.error(e)
        reply('Error saat mendownload video.')
    }
}

handler.command = ["tt", "tiktok"]
export default handler
