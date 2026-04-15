import { Logger } from '../core/Logger.js';

export class SlotMachine {
    constructor(player) {
        this.player = player;
        this.symbols = ['🍒', '🍋', '🔔', '🍉', '💎', '7️⃣'];
        this.numSymbols = this.symbols.length;
        this.anglePerSymbol = 360 / this.numSymbols;
        this.radius = Math.round((80 / 2) / Math.tan(Math.PI / this.numSymbols));
        this.currentAngles = [0, 0, 0];
        this.isSpinning = false;

        this.elements = {
            betAmount: document.getElementById('slotBetAmount'),
            spinBtn: document.getElementById('btnSlotSpin'),
            resultMsg: document.getElementById('slotResult')
        };

        this.bindEvents();
        this.initReels();
    }

    bindEvents() {
        this.elements.spinBtn.addEventListener('click', () => this.spin());
    }

    initReels() {
        for (let i = 0; i < 3; i++) {
            const reel = document.getElementById(`reel${i}`);
            reel.innerHTML = '';
            for (let j = 0; j < this.numSymbols; j++) {
                const sym = document.createElement('div');
                sym.className = 'symbol';
                sym.innerText = this.symbols[j];
                sym.style.transform = `rotateX(${j * this.anglePerSymbol}deg) translateZ(${this.radius}px)`;
                reel.appendChild(sym);
            }
        }
    }

    spin() {
        if (this.isSpinning) return;

        try {
            const betAmount = parseInt(this.elements.betAmount.value, 10);
            this.player.bet(betAmount);
            
            this.isSpinning = true;
            this.elements.spinBtn.disabled = true;
            this.elements.resultMsg.innerText = '';

            let results = [];
            
            for (let i = 0; i < 3; i++) {
                const targetIndex = Math.floor(Math.random() * this.numSymbols);
                results.push(this.symbols[targetIndex]);
                
                const extraSpins = 4 + i * 2; 
                const targetAngle = this.currentAngles[i] - (extraSpins * 360) - (targetIndex * this.anglePerSymbol) + (this.currentAngles[i] % 360);
                
                const reel = document.getElementById(`reel${i}`);
                reel.style.transition = `transform ${2 + i * 0.8}s cubic-bezier(0.15, 0.95, 0.25, 1.08)`;
                reel.style.transform = `rotateX(${targetAngle}deg)`;
                this.currentAngles[i] = targetAngle;
            }

            setTimeout(() => this.resolveResult(results, betAmount), 3800);

        } catch (error) {
            alert(error.message);
            Logger.error('Slot spin failed', error);
        }
    }

    resolveResult(results, betAmount) {
        let win = 0;
        let msg = '';

        if (results[0] === results[1] && results[1] === results[2]) {
            win = results[0] === '7️⃣' ? betAmount * 50 : betAmount * 10;
            msg = `ジャックポット！！ (+$${win})`;
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            win = betAmount * 2;
            msg = `小当たり！ (+$${win})`;
        } else {
            msg = `ハズレ (-$${betAmount})`;
        }
        
        if (win > 0) {
            this.player.win(win);
        }

        this.elements.resultMsg.innerText = msg;
        this.isSpinning = false;
        this.elements.spinBtn.disabled = false;
        Logger.info(`Slot resolved: [${results.join(',')}]. Win: ${win}`);
    }
}
