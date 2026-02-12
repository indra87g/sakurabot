/**
 * Registers user if not already in database.
 * @param {Object} db
 * @param {string} jid
 */
const registerUser = (db, jid) => {
    const users = db.get("users") || [];
    if (!users.includes(jid)) {
        users.push(jid);
        db.set("users", users);
    }
};

module.exports = {
    registerUser
};
