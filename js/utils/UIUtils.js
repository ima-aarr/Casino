export class UIUtils {
    static createCardElement(card, isHidden = false) {
        if (isHidden) {
            const div = document.createElement('div');
            div.className = 'card hidden-card';
            return div;
        }
        const colorClass = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        const div = document.createElement('div');
        div.className = `card ${colorClass}`;
        div.innerHTML = `
            <div class="card-top">${card.rank}<br>${card.suit}</div>
            <div class="card-center">${card.suit}</div>
            <div class="card-bottom">${card.rank}<br>${card.suit}</div>
        `;
        return div;
    }

    static create3DCardElement(card) {
        const colorClass = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        const div = document.createElement('div');
        div.className = 'card-3d';
        div.innerHTML = `
            <div class="card-face card-front ${colorClass}">
                <div class="card-top">${card.rank}<br>${card.suit}</div>
                <div class="card-center">${card.suit}</div>
                <div class="card-bottom">${card.rank}<br>${card.suit}</div>
            </div>
            <div class="card-face card-back"></div>
        `;
        return div;
    }
}
