export class Player {
    constructor(initialMoney) {
        this.money = initialMoney;
        this.exp = 0; 
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        this.notify();
    }

    notify() {
     
        this.listeners.forEach(callback => callback({
            money: this.money,
            exp: this.exp,
            level: this.getLevel(),
            rank: this.getRankName()
        }));
    }

    bet(amount) {
        if (amount <= 0 || isNaN(amount)) throw new Error('無効なベット額です');
        if (this.money < amount) throw new Error('所持金が足りません');
        
        this.money -= amount;
        
        this.exp += Math.floor(amount / 10); 
        this.notify();
    }

    win(amount) {
        this.money += amount;
        this.notify();
    }


    getLevel() {
        return Math.floor(Math.sqrt(this.exp / 50)) + 1;
    }

   
    getRankName() {
        const lv = this.getLevel();
        if (lv < 5) return '🥉ブロンズ';
        if (lv < 15) return '🥈シルバー';
        if (lv < 30) return '🥇ゴールド';
        if (lv < 50) return '💎プラチナ';
        return '👑ダイヤモンド';
    }

    generateSaveData() {
        const data = { m: this.money, e: this.exp };
        return btoa(JSON.stringify(data));
    }

    loadSaveData(base64Str) {
        const data = JSON.parse(atob(base64Str));
        if (typeof data.m === 'number') this.money = data.m;
        if (typeof data.e === 'number') this.exp = data.e;
        this.notify();
    }
}
