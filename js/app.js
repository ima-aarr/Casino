import { Logger } from './core/Logger.js';
import { Player } from './core/Player.js';
import { Blackjack } from './games/Blackjack.js';
import { Roulette } from './games/Roulette.js';
import { SlotMachine } from './games/SlotMachine.js';
import { HighLow } from './games/HighLow.js';

class App {
    constructor() {
        this.player = new Player(1000);
        this.games = {};
        
        this.initializeUI();
        this.initializeGames();
        this.bindGlobalEvents();
        Logger.info('Application initialized successfully.');
    }

    initializeUI() {
        this.moneyDisplay = document.getElementById('moneyDisplay');
        this.player.subscribe((money) => {
            this.moneyDisplay.innerText = money;
        });
    }

    initializeGames() {
        this.games.blackjack = new Blackjack(this.player);
        this.games.roulette = new Roulette(this.player);
        this.games.slot = new SlotMachine(this.player);
        this.games.highlow = new HighLow(this.player);
    }

    bindGlobalEvents() {
        // Navigation bindings
        const screens = ['menuScreen', 'blackjackScreen', 'rouletteScreen', 'slotScreen', 'highlowScreen'];
        const switchScreen = (targetId) => {
            screens.forEach(id => document.getElementById(id).classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            Logger.info(`Switched to screen: ${targetId}`);
        };

        document.getElementById('btnNavBlackjack').addEventListener('click', () => switchScreen('blackjackScreen'));
        document.getElementById('btnNavRoulette').addEventListener('click', () => switchScreen('rouletteScreen'));
        document.getElementById('btnNavSlot').addEventListener('click', () => switchScreen('slotScreen'));
        document.getElementById('btnNavHighLow').addEventListener('click', () => switchScreen('highlowScreen'));

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => switchScreen('menuScreen'));
        });

        // Save Data Management
        document.getElementById('btnGenerateSave').addEventListener('click', () => {
            try {
                const saveStr = this.player.generateSaveData();
                document.getElementById('saveDataInput').value = saveStr;
                alert('セーブデータを生成しました。テキストエリアの文字列を保存してください。');
            } catch (error) {
                alert('セーブデータの生成に失敗しました。');
            }
        });

        document.getElementById('btnLoadSave').addEventListener('click', () => {
            try {
                const inputStr = document.getElementById('saveDataInput').value.trim();
                if (!inputStr) {
                    alert('セーブデータが入力されていません。');
                    return;
                }
                this.player.loadSaveData(inputStr);
                alert('セーブデータを読み込みました。');
                document.getElementById('saveDataInput').value = '';
            } catch (error) {
                alert('セーブデータの読み込みに失敗しました。形式が正しいか確認してください。');
            }
        });
    }
}

// ページの読み込み完了時にアプリケーションを起動
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
