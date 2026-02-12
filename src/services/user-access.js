class UserAccessService {
    constructor(db, config, platform = 'tg') {
        this.db = db;
        this.config = config;
        this.platform = platform;
    }

    isLeader(id) {
        if (!id) return false;
        const idStr = id.toString();
        if (this.platform === 'tg') {
            return this.config.owner.id_tele === idStr;
        } else {
            return this.config.owner.id === idStr.split('@')[0];
        }
    }

    getManagers() {
        return this.db.get('managers') || [];
    }

    isManager(id) {
        return this.getManagers().includes(id);
    }

    addManager(id) {
        const managers = this.getManagers();
        if (!managers.includes(id)) {
            managers.push(id);
            this.db.set('managers', managers);
            return true;
        }
        return false;
    }

    removeManager(id) {
        let managers = this.getManagers();
        if (managers.includes(id)) {
            managers = managers.filter(m => m !== id);
            this.db.set('managers', managers);
            return true;
        }
        return false;
    }

    isOwner(id) {
        return this.isLeader(id) || this.isManager(id);
    }

    getPremiumUsers() {
        return this.db.get('premium') || [];
    }

    isPremium(id) {
        return this.getPremiumUsers().includes(id);
    }

    addPremium(id) {
        const premium = this.getPremiumUsers();
        if (!premium.includes(id)) {
            premium.push(id);
            this.db.set('premium', premium);
            return true;
        }
        return false;
    }

    removePremium(id) {
        let premium = this.getPremiumUsers();
        if (premium.includes(id)) {
            premium = premium.filter(u => u !== id);
            this.db.set('premium', premium);
            return true;
        }
        return false;
    }
}

module.exports = UserAccessService;
