import { Logger } from '../core/Logger.js';
import { Deck } from '../core/Deck.js';
import { UIUtils } from '../utils/UIUtils.js';

export class HighLow {
    constructor(player) {
        this.player = player;
        this.deck = new Deck();
        this.currentCard = null;
        this.nextCard = null;
        this.currentBet = 0;
        this.isProcessing = false;

        this.elements = {
            betControls: document.getElementById('hlBetControls'),
            betAmount: document.getElementById('hlBetAmount'),
            startBtn: document.getElementById('btnHlStart'),
            gameArea: document.getElementById('hlGameArea'),
            currentCardContainer: document.getElementById('hlCurrentCard'),
            nextCardContainer: document.getElementById('hlNextCard'),
            resultMsg: document.getElementById('hlResult'),
            actionControls: document.getElementById('hlActionControls'),
            highBtn: document.getElementById('btnHlHigh'),
            lowBtn: document.getElementById('btnHlLow'),
            nextBtn: document.getElementById('btnHlNext')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.highBtn.addEventListener('click', () => this.guess('high'));
        this.elements.lowBtn.addEventListener('click', () => this.guess('low'));
        this.elements.nextBtn.addEventListener('click', () => this.resetUI());
    }

    getCardValue(rank) {
        if (rank === 'A') return 1;
        if (rank === 'J') return 11;
        if (rank === 'Q') return 12;
        if (rank === 'K') return 13;
        return parseInt(rank, 10);
    }

    start() {
        try {
            const amount = parseInt(this.elements.betAmount.value, 10);
            this.player.bet(amount);
            this.currentBet = amount;
            
            this.deck.build();
            this.deck.shuffle();
            this.currentCard = this.deck.draw();
            this.nextCard = this.deck.draw();
            
            this.elements.betControls.classList.add('hidden');
            this.elements.gameArea.classList.remove('hidden');
            this.elements.actionControls.classList.remove('hidden');
            
            this.elements.currentCardContainer.innerHTML = '';
            this.elements.nextCardContainer.innerHTML = '';
            
            this.elements.currentCardContainer.appendChild(UIUtils.create3DCardElement(this.currentCard));
            this.elements.nextCardContainer.appendChild(UIUtils.create3DCardElement(this.nextCard));
            
            setTimeout(() => {
                const curCardDOM = this.elements.currentCardContainer.querySelector('.card-3d');
                const nextCardDOM = this.elements.nextCardContainer.querySelector('.card-3d');
                curCardDOM.classList.add('dealt');
                nextCardDOM.classList.add('dealt');
                
                setTimeout(() => {
                    curCardDOM.classList.add('flipped');
                }, 300);
            }, 50);

        } catch (error) {
            alert(error.message);
            Logger.error('HighLow start failed', error);
        }
    }

    guess(prediction) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.elements.actionControls.classList.add('hidden');
        
        const nextCardDOM = this.elements.nextCardContainer.querySelector('.card-3d');
        nextCardDOM.classList.add('flipped');
        
        setTimeout(() => {
            const val1 = this.getCardValue(this.currentCard.rank);
            const val2 = this.getCardValue(this.nextCard.rank);
            
            if (val1 === val2) { 
                this.player.win(this.currentBet); 
                this.elements.resultMsg.innerText = `引き分け (+$0)`; 
            } else if ((prediction === 'high' && val2 > val1) || (prediction === 'low' && val2 < val1)) { 
                const winAmount = this.currentBet * 2;
                this.player.win(winAmount); 
                this.elements.resultMsg.innerText = `見事正解！ (+$${winAmount})`; 
            } else {
                this.elements.resultMsg.innerText = `残念、ハズレ... (-$${this.currentBet})`;
            }
            
            this.elements.nextBtn.classList.remove('hidden');
            this.isProcessing = false;
        }, 800);
    }

    resetUI() {
        this.elements.betControls.classList.remove('hidden');
        this.elements.gameArea.classList.add('hidden');
        this.elements.nextBtn.classList.add('hidden');
        this.elements.resultMsg.innerText = '';
        this.elements.currentCardContainer.innerHTML = '';
        this.elements.nextCardContainer.innerHTML = '';
    }
}
