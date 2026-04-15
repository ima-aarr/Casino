import { Logger } from './Logger.js';

export class Player {
    constructor(initialMoney) {
        this.money = initialMoney;
        this.observers = [];
    }

    subscribe(callback) {
        this.observers.push(callback);
        callback(this.money);
    }

    notify() {
        this.observers.forEach(callback => callback(this.money));
    }

    getMoney() {
        return this.money;
    }

    bet(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            Logger.error('Invalid bet amount format');
            throw new Error('Invalid bet amount');
        }
        if (amount > this.money) {
            Logger.error('Insufficient funds');
            throw new Error('Insufficient funds');
        }
        this.money -= amount;
        this.notify();
        Logger.info(`Bet placed: ${amount}. Remaining balance: ${this.money}`);
    }

    win(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            Logger.error('Invalid win amount format');
            throw new Error('Invalid win amount');
        }
        this.money += amount;
        this.notify();
        Logger.info(`Won: ${amount}. New balance: ${this.money}`);
    }

    generateSaveData() {
        try {
            const dataString = JSON.stringify({ m: this.money });
            const base64Data = btoa(dataString);
            Logger.info('Save data generated successfully');
            return base64Data;
        } catch (error) {
            Logger.error('Failed to generate save data', error);
            throw new Error('Save generation failed');
        }
    }

    loadSaveData(base64Data) {
        try {
            const dataString = atob(base64Data);
            const parsedData = JSON.parse(dataString);
            if (typeof parsedData.m !== 'number' || isNaN(parsedData.m)) {
                throw new Error('Corrupted save data');
            }
            this.money = parsedData.m;
            this.notify();
            Logger.info('Save data loaded successfully');
        } catch (error) {
            Logger.error('Failed to load save data', error);
            throw new Error('Save loading failed');
        }
    }
}
