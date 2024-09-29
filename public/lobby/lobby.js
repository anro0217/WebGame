import { db } from '../firebase.js';

// URL paraméterek lekérése
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get('gameId');
const username = urlParams.get('username');

const playerList = document.getElementById('playerList');
const joinCodeDisplay = document.getElementById('joinCodeDisplay');
const playerCount = document.getElementById('playerCount');
const startGameButton = document.getElementById('startGame');

// Lobby adatainak megjelenítése
joinCodeDisplay.innerText = `Csatlakozási kód: ${gameId}`;

// Játékosok hallgatása
db.ref(`games/${gameId}/players`).on('value', (snapshot) => {
    playerList.innerHTML = '';
    let playerCountValue = snapshot.numChildren();
    playerCount.innerText = `Játékosok száma: ${playerCountValue}`;

    snapshot.forEach(playerSnapshot => {
        const playerData = playerSnapshot.val();
        const playerName = playerSnapshot.key;

        const playerContainer = document.createElement('div');
        playerContainer.style.display = 'flex';
        playerContainer.style.alignItems = 'center';

        const colorSquare = document.createElement('div');
        colorSquare.style.width = '20px';
        colorSquare.style.height = '20px';
        colorSquare.style.backgroundColor = playerData.color;
        colorSquare.style.marginRight = '10px';

        const playerNameElement = document.createElement('span');
        playerNameElement.innerText = playerName;

        playerContainer.appendChild(colorSquare);
        playerContainer.appendChild(playerNameElement);
        playerList.appendChild(playerContainer);
    });
});

// Host jogosultság ellenőrzése
db.ref(`games/${gameId}/creator`).once('value').then(snapshot => {
    const creator = snapshot.val();
    if (creator === username) {
        startGameButton.style.display = 'block';
        startGameButton.addEventListener('click', startGame);
    }
});

// Játék indítása
function startGame() {
    db.ref(`games/${gameId}`).update({ started: true })
        .then(() => {
            console.log('A játék elindult.');
            // Átdobás a játék felületére
            window.location.href = `games/maze/index.html?gameId=${gameId}`;
        });
}
