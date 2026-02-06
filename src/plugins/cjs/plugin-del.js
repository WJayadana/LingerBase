const fs = require("fs");

const handler = async (m, { reply, isOwn, text, command, cmd }) => {
    try {
        if (!isOwn) return reply(mess.owner)
        const Plugin = await fs.readdirSync("./src/plugins/cjs")
        if (Plugin.length < 1) return reply("Tidak ada file plugin")
        if (!text || !text.endsWith(".js")) return reply(`*contoh:* ${command} ping.js`)
        if (!Plugin.includes(text)) return reply("Plugin tidak ditemukan")
        await fs.unlinkSync(`./src/plugins/cjs/${text.toLowerCase().trim()}`)
        return reply(`Berhasil menghapus plugin *${text.toLowerCase().trim()}*`)
    } catch (err) {
        console.log(err)
    }
}

handler.command = ["delp", "dp", "delplugin", "delplugins"]
module.exports = handler