const { Database } = require('simpl.db');
const path = require('path');
const fs = require('fs');

const getDb = (platform) => {
    const dbPath = path.resolve(__dirname, `../database/${platform}`);
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

    return new Database({
        dataFile: path.join(dbPath, 'database.json'),
        autoSave: true,
        tabSize: 2
    });
};

module.exports = { getDb };
