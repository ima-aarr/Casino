import { Logger } from '../core/Logger.js';

export class Roulette {
    constructor(player) {
        this.player = player;
        this.canvas = document.getElementById('rouletteCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isSpinning = false;
        this.currentAngle = 0;
        this.spinVelocity = 0;
        this.animationId = null;
        this.currentBetAmount = 0;
        this.currentBetType = '';
        this.currentBetTarget = null;

        this.numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

        this.elements = {
            betAmount: document.getElementById('rlBetAmount'),
            betType: document.getElementById('rlBetType'),
            targetNumber: document.getElementById('rlTargetNumber'),
            spinBtn: document.getElementById('btnRlSpin'),
            resultMsg: document.getElementById('rlResult')
        };

        this.bindEvents();
        this.drawWheel();
    }

    bindEvents() {
        this.elements.betType.addEventListener('change', (e) => {
            if (e.target.value === 'number') {
                this.elements.targetNumber.classList.remove('hidden');
            } else {
                this.elements.targetNumber.classList.add('hidden');
            }
        });

        this.elements.spinBtn.addEventListener('click', () => this.spin());
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = centerX - 10;
        const arc = (2 * Math.PI) / this.numbers.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.numbers.length; i++) {
            const angle = this.currentAngle + i * arc;
            const number = this.numbers[i];

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
            this.ctx.lineTo(centerX, centerY);
            
            if (number === 0) {
                this.ctx.fillStyle = '#2e7d32'; // 緑
            } else if (this.redNumbers.includes(number)) {
                this.ctx.fillStyle = '#d32f2f'; // 赤
            } else {
                this.ctx.fillStyle = '#212121'; // 黒
            }
            
            this.ctx.fill();
            this.ctx.stroke();

           
            this.ctx.save();
            this.ctx.translate(
                centerX + Math.cos(angle + arc / 2) * (radius - 25),
                centerY + Math.sin(angle + arc / 2) * (radius - 25)
            );
            this.ctx.rotate(angle + arc / 2 + Math.PI / 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(number.toString(), 0, 0);
            this.ctx.restore();
        }
    }

    spin() {
        if (this.isSpinning) return;

        try {
            const amount = parseInt(this.elements.betAmount.value, 10);
            this.currentBetType = this.elements.betType.value;
            
            if (this.currentBetType === 'number') {
                this.currentBetTarget = parseInt(this.elements.targetNumber.value, 10);
                if (isNaN(this.currentBetTarget) || this.currentBetTarget < 0 || this.currentBetTarget > 36) {
                    throw new Error('無効なターゲット番号です');
                }
            }

            this.player.bet(amount);
            this.currentBetAmount = amount;
            this.isSpinning = true;
            this.elements.spinBtn.disabled = true;
            this.elements.resultMsg.innerText = '';

         
            this.spinVelocity = 0.3 + Math.random() * 0.2;
            this.animate();

        } catch (error) {
            alert(error.message);
            Logger.error('Roulette spin failed', error);
        }
    }

    animate() {
        this.currentAngle += this.spinVelocity;
        this.drawWheel();

      
        this.spinVelocity *= 0.992;

        if (this.spinVelocity > 0.001) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.spinVelocity = 0;
            this.resolveResult();
        }
    }

    resolveResult() {
        this.isSpinning = false;
        this.elements.spinBtn.disabled = false;

       
        const normalizedAngle = this.currentAngle % (2 * Math.PI);
        const topAngle = (1.5 * Math.PI - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
        const arc = (2 * Math.PI) / this.numbers.length;
        const winningIndex = Math.floor(topAngle / arc);
        const winningNumber = this.numbers[winningIndex];

        let isWin = false;
        let payoutMultiplier = 0;

        if (this.currentBetType === 'number') {
            if (winningNumber === this.currentBetTarget) {
                isWin = true;
                payoutMultiplier = 36;
            }
        } else if (winningNumber !== 0) {
            const isRed = this.redNumbers.includes(winningNumber);
            const isEven = winningNumber % 2 === 0;

            if (this.currentBetType === 'red' && isRed) {
                isWin = true;
                payoutMultiplier = 2;
            } else if (this.currentBetType === 'black' && !isRed) {
                isWin = true;
                payoutMultiplier = 2;
            } else if (this.currentBetType === 'even' && isEven) {
                isWin = true;
                payoutMultiplier = 2;
            } else if (this.currentBetType === 'odd' && !isEven) {
                isWin = true;
                payoutMultiplier = 2;
            }
        }

        const colorText = winningNumber === 0 ? '緑' : (this.redNumbers.includes(winningNumber) ? '赤' : '黒');
        let resultMessage = `結果: ${winningNumber} (${colorText})。`;

        if (isWin) {
            const winAmount = this.currentBetAmount * payoutMultiplier;
            this.player.win(winAmount);
            resultMessage += ` 当たり！ (+$${winAmount})`;
        } else {
            resultMessage += ` ハズレ (-$${this.currentBetAmount})`;
        }

        this.elements.resultMsg.innerText = resultMessage;
        Logger.info(`Roulette resolved: ${winningNumber}. Result: ${isWin ? 'Win' : 'Loss'}`);
    }
}
