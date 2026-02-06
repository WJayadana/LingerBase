import os from 'os'

const handler = async (m, { Linger, reply }) => {
    const used = process.memoryUsage()
    const cpus = os.cpus()
    const cpu = cpus[0].model
    const uptime = process.uptime()
    
    // Using a simpler runtime for ESM to avoid complex imports for now,
    // or I can import the commonjs one if needed
    const runtime = (seconds) => {
        seconds = Number(seconds)
        var d = Math.floor(seconds / (3600 * 24))
        var h = Math.floor(seconds % (3600 * 24) / 3600)
        var m = Math.floor(seconds % 3600 / 60)
        var s = Math.floor(seconds % 60)
        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
        return dDisplay + hDisplay + mDisplay + sDisplay
    }

    let teks = `🌟 *LINGER BASE - ESM INFO* 🌟\n\n`
    teks += `📅 *OS*: ${os.type()} ${os.release()}\n`
    teks += `💻 *CPU*: ${cpu}\n`
    teks += `📂 *RAM State*: ${(used.rss / 1024 / 1024).toFixed(2)} MB\n`
    teks += `⏳ *Uptime*: ${runtime(uptime)}\n`
    teks += `📡 *Platform*: ${os.platform()}\n`
    teks += `🔗 *Total Memory*: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\n\n`
    teks += `*LingerBase v1.0 • ESM Powered*`
    
    await reply(teks)
}

handler.command = ["info"]
export default handler
