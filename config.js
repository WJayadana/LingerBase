const fs = require('fs');

const config = {
    prefa: ['','!','.',',','🐤','🗿'],
    owner: ['6285162822778','6287822118865'],
    thumbnail: "https://raw.githubusercontent.com/WJayadana/WJayadana/refs/heads/main/Thumbnail.png",
    name: "Linger Base",
    version: "1.0"
};

const init = {
    session: "./session",
    customPair: "LINGERMD"
}

// Auto-reload on file changes
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
});

module.exports = {
    config,
    init
};

