import { Logger } from '../core/Logger.js';

export class Dice {
    constructor(player) {
        this.player = player;
        this.isRolling = false;
        
        // サイコロの絵文字
        this.diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        this.elements = {
            betAmount: document.getElementById('diceBetAmount'),
            betType: document.getElementById('diceBetType'),
            rollBtn: document.getElementById('btnDiceRoll'),
            display: document.getElementById('diceDisplay'),
            resultMsg: document.getElementById('diceResult')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.elements.rollBtn.addEventListener('click', () => this.roll());
    }

    roll() {
        if (this.isRolling) return;

        try {
            const amount = parseInt(this.elements.betAmount.value, 10);
            const type = this.elements.betType.value;
            
            this.player.bet(amount);
            
            this.isRolling = true;
            this.elements.rollBtn.disabled = true;
            this.elements.resultMsg.innerText = 'コロコロ...';

            let rollCount = 0;
            const rollInterval = setInterval(() => {
               
                const tempD1 = Math.floor(Math.random() * 6);
                const tempD2 = Math.floor(Math.random() * 6);
                this.elements.display.innerText = `${this.diceFaces[tempD1]} ${this.diceFaces[tempD2]}`;
                
                rollCount++;
                if (rollCount > 15) { 
                    clearInterval(rollInterval);
                    this.resolveResult(amount, type);
                }
            }, 80);

        } catch (error) {
            alert(error.message);
            Logger.error('Dice roll failed', error);
        }
    }

    resolveResult(betAmount, betType) {
  
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        
        this.elements.display.innerText = `${this.diceFaces[d1 - 1]} ${this.diceFaces[d2 - 1]}`;

        let isWin = false;
        let payout = 0;

        if (total >= 2 && total <= 6 && betType === 'low') {
            isWin = true;
            payout = betAmount * 2;
        } else if (total >= 8 && total <= 12 && betType === 'high') {
            isWin = true;
            payout = betAmount * 2;
        } else if (total === 7 && betType === 'seven') {
            isWin = true;
            payout = betAmount * 5;
        }

        if (isWin) {
            this.player.win(payout);
            this.elements.resultMsg.innerText = `合計: ${total}！ 見事的中！ (+$${payout})`;
        } else {
            this.elements.resultMsg.innerText = `合計: ${total}。 ハズレ... (-$${betAmount})`;
        }

        this.isRolling = false;
        this.elements.rollBtn.disabled = false;
        Logger.info(`Dice rolled: ${d1}, ${d2} (Total: ${total}). Win: ${isWin}`);
    }
}
