import axios from 'axios'

const handler = async (m, { command, reply }) => {
    try {
        if (command === 'quotes' || command === 'quote') {
            const res = await axios.get('https://api.yanzbotz.my.id/api/quotes/islami')
            const data = res.data.result
            reply(`*Random Quotes*\n\n"${data.hasil}"\n\n- ${data.sender}`)
        } else if (command === 'fakta' || command === 'fact') {
            const res = await axios.get('https://api.yanzbotz.my.id/api/quotes/anime')
            const data = res.data.result
            reply(`*Anime Fact*\n\n"${data.hasil}"\n\n- ${data.sender}`)
        }
    } catch (e) {
        console.error(e)
        reply('Error fetching data.')
    }
}

handler.command = ["quotes", "quote", "fakta", "fact"]
export default handler
