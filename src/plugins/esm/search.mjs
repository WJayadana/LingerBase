import axios from 'axios'

const handler = async (m, { Linger, text, reply }) => {
    if (!text) return reply('Mau cari gambar apa di Pinterest?')
    reply('Searching for images...')
    
    try {
        // Using a public API for demonstration
        const res = await axios.get(`https://api.yanzbotz.my.id/api/search/pinterest?query=${encodeURIComponent(text)}`)
        const data = res.data.result
        
        if (data && data.length > 0) {
            // Pick a random image from results
            const img = data[Math.floor(Math.random() * data.length)]
            await Linger.sendMessage(m.chat, { image: { url: img }, caption: `Result for: ${text}` }, { quoted: m })
        } else {
            reply('Gambar tidak ditemukan.')
        }
    } catch (e) {
        console.error(e)
        reply('Error mencari gambar.')
    }
}

handler.command = ["pin", "pinterest"]
export default handler
