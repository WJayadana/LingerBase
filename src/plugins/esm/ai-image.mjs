import axios from 'axios'

const handler = async (m, { Linger, text, reply }) => {
    if (!text) return reply('Mau buat gambar apa? Masukkan prompt!')
    reply('Generating image... please wait.')
    
    try {
        const res = await axios.get(`https://api.yanzbotz.my.id/api/ai/dalle?query=${encodeURIComponent(text)}`)
        const data = res.data.result
        
        if (data) {
            await Linger.sendMessage(m.chat, { image: { url: data }, caption: `AI Image: ${text}` }, { quoted: m })
        } else {
            reply('Gagal membuat gambar.')
        }
    } catch (e) {
        console.error(e)
        reply('Error connecting to AI Image generator.')
    }
}

handler.command = ["ai-img", "dalle"]
export default handler
