import { Logger } from '../core/Logger.js';
import { Deck } from '../core/Deck.js';
import { UIUtils } from '../utils/UIUtils.js';

export class Blackjack {
    constructor(player) {
        this.player = player;
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
        this.currentBet = 0;
        this.isGameOver = true;

        this.elements = {
            betControls: document.getElementById('bjBetControls'),
            betAmount: document.getElementById('bjBetAmount'),
            startBtn: document.getElementById('btnBjStart'),
            gameArea: document.getElementById('bjGameArea'),
            dealerCards: document.getElementById('dealerCards'),
            dealerScore: document.getElementById('dealerScore'),
            playerCards: document.getElementById('playerCards'),
            playerScore: document.getElementById('playerScore'),
            resultMsg: document.getElementById('bjResult'),
            actionControls: document.getElementById('bjActionControls'),
            hitBtn: document.getElementById('btnBjHit'),
            standBtn: document.getElementById('btnBjStand'),
            nextBtn: document.getElementById('btnBjNext')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.hitBtn.addEventListener('click', () => this.hit());
        this.elements.standBtn.addEventListener('click', () => this.stand());
        this.elements.nextBtn.addEventListener('click', () => this.resetUI());
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        for (const card of hand) {
            if (card.rank === 'A') {
                score += 11;
                aces += 1;
            } else if (['J', 'Q', 'K'].includes(card.rank)) {
                score += 10;
            } else {
                score += parseInt(card.rank, 10);
            }
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }
        return score;
    }

    start() {
        try {
            const amount = parseInt(this.elements.betAmount.value, 10);
            this.player.bet(amount);
            this.currentBet = amount;
            
            this.deck.build();
            this.deck.shuffle();
            this.playerHand = [this.deck.draw(), this.deck.draw()];
            this.dealerHand = [this.deck.draw(), this.deck.draw()];
            this.isGameOver = false;

            this.elements.betControls.classList.add('hidden');
            this.elements.gameArea.classList.remove('hidden');
            this.elements.actionControls.classList.remove('hidden');
            this.elements.resultMsg.innerText = '';
            this.elements.nextBtn.classList.add('hidden');

            this.updateDisplay(false);

            if (this.calculateScore(this.playerHand) === 21) {
                this.endGame();
            }
        } catch (error) {
            alert(error.message);
        }
    }

    updateDisplay(showDealerAll) {
        this.elements.playerCards.innerHTML = '';
        this.playerHand.forEach(card => {
            this.elements.playerCards.appendChild(UIUtils.createCardElement(card, false));
        });
        this.elements.playerScore.innerText = `スコア: ${this.calculateScore(this.playerHand)}`;

        this.elements.dealerCards.innerHTML = '';
        if (showDealerAll) {
            this.dealerHand.forEach(card => {
                this.elements.dealerCards.appendChild(UIUtils.createCardElement(card, false));
            });
            this.elements.dealerScore.innerText = `スコア: ${this.calculateScore(this.dealerHand)}`;
        } else {
            this.elements.dealerCards.appendChild(UIUtils.createCardElement(this.dealerHand[0], false));
            this.elements.dealerCards.appendChild(UIUtils.createCardElement(null, true));
            this.elements.dealerScore.innerText = `スコア: ?`;
        }
    }

    hit() {
        if (this.isGameOver) return;
        this.playerHand.push(this.deck.draw());
        this.updateDisplay(false);
        if (this.calculateScore(this.playerHand) > 21) {
            this.endGame();
        }
    }

    stand() {
        if (this.isGameOver) return;
        this.endGame();
    }

    endGame() {
        this.isGameOver = true;
        this.elements.actionControls.classList.add('hidden');

        const pScore = this.calculateScore(this.playerHand);
        if (pScore <= 21) {
            while (this.calculateScore(this.dealerHand) < 17) {
                this.dealerHand.push(this.deck.draw());
            }
        }

        this.updateDisplay(true);
        const dScore = this.calculateScore(this.dealerHand);

        if (pScore > 21) {
            this.elements.resultMsg.innerText = `バストしました。(-$${this.currentBet})`;
        } else if (dScore > 21) {
            const winAmount = this.currentBet * 2;
            this.player.win(winAmount);
            this.elements.resultMsg.innerText = `ディーラーがバスト！(+$${winAmount})`;
        } else if (pScore > dScore) {
            const isBj = (pScore === 21 && this.playerHand.length === 2);
            const winAmount = isBj ? Math.floor(this.currentBet * 2.5) : this.currentBet * 2;
            this.player.win(winAmount);
            this.elements.resultMsg.innerText = isBj ? `ブラックジャック！(+$${winAmount})` : `あなたの勝ち！(+$${winAmount})`;
        } else if (pScore < dScore) {
            this.elements.resultMsg.innerText = `ディーラーの勝ち。(-$${this.currentBet})`;
        } else {
            this.player.win(this.currentBet);
            this.elements.resultMsg.innerText = `引き分け。(ベット額返還)`;
        }

        this.elements.nextBtn.classList.remove('hidden');
    }

    resetUI() {
        this.elements.betControls.classList.remove('hidden');
        this.elements.gameArea.classList.add('hidden');
        this.elements.resultMsg.innerText = '';
        this.elements.dealerCards.innerHTML = '';
        this.elements.playerCards.innerHTML = '';
    }
}
