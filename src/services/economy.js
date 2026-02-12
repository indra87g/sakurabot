class EconomyService {
    constructor(db, config) {
        this.db = db;
        this.config = config;
    }

    _get(key, id, defaultValue = 0) {
        return this.db.get(`${key}.${id}`) ?? defaultValue;
    }

    _set(key, id, amount) {
        this.db.set(`${key}.${id}`, amount);
    }

    getSakuranite(id) { return this._get('sakuranite', id); }
    updateSakuranite(id, amount) { this._set('sakuranite', id, amount); }

    getCoins(id) { return this._get('coins', id); }
    updateCoins(id, amount) { this._set('coins', id, amount); }

    getGachaTickets(id) { return this._get('gacha_tickets', id); }
    updateGachaTickets(id, amount) { this._set('gacha_tickets', id, amount); }

    getMiningTickets(id) { return this._get('mining_tickets', id); }
    updateMiningTickets(id, amount) { this._set('mining_tickets', id, amount); }

    getMiningRate(id) { return this._get('mining_rate', id, 0.10); }
    updateMiningRate(id, amount) { this._set('mining_rate', id, amount); }

    getInventory(id) {
        return this.db.get(`inventory.${id}`) || {};
    }

    updateInventory(id, item, amount) {
        const inv = this.getInventory(id);
        inv[item] = (inv[item] || 0) + amount;
        if (inv[item] <= 0) delete inv[item];
        this.db.set(`inventory.${id}`, inv);
    }
}

module.exports = EconomyService;
