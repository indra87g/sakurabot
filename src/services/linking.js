class LinkingService {
    constructor(dbWa, dbTg) {
        this.dbWa = dbWa;
        this.dbTg = dbTg;
    }

    linkAccounts(waJid, tgId) {
        const waLinks = this.dbWa.get('links') || {};
        waLinks[waJid] = tgId;
        this.dbWa.set('links', waLinks);

        const tgLinks = this.dbTg.get('links') || {};
        tgLinks[tgId] = waJid;
        this.dbTg.set('links', tgLinks);
    }

    getTgFromWa(waJid) {
        const waLinks = this.dbWa.get('links') || {};
        return waLinks[waJid];
    }

    getWaFromTg(tgId) {
        const tgLinks = this.dbTg.get('links') || {};
        return tgLinks[tgId];
    }

    transferSakuraniteTgToWa(tgId, amount, feePercent = 0.1) {
        const waJid = this.getWaFromTg(tgId);
        if (!waJid) throw new Error("Account not linked");

        const currentTg = this.dbTg.get(`sakuranite.${tgId}`) || 0;
        if (currentTg < amount) throw new Error("Insufficient balance");

        const fee = Math.floor(amount * feePercent);
        const received = amount - fee;

        this.dbTg.set(`sakuranite.${tgId}`, currentTg - amount);
        const currentWa = this.dbWa.get(`sakuranite.${waJid}`) || 0;
        this.dbWa.set(`sakuranite.${waJid}`, currentWa + received);

        return { amount, fee, received, waJid };
    }
}

module.exports = LinkingService;
