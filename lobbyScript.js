import { db } from './firebaseConfig.js';
import { ref, onValue, update } from 'firebase/database';

const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');
const username = params.get('username');
const playerColor = params.get('color');

const playersList = document.getElementById('playersList');

function updatePlayersList(snapshot) {
    const players = snapshot.val().players;

    playersList.innerHTML = '';
    for (const [name, color] of Object.entries(players)) {
        const playerElement = document.createElement('div');
        playerElement.style.color = color;
        playerElement.innerText = name;
        playersList.appendChild(playerElement);
    }
}

// Real-time listener for players
onValue(ref(db, `games/${gameId}`), (snapshot) => {
    updatePlayersList(snapshot);
});

document.getElementById('startGame').onclick = async function() {
    await update(ref(db, `games/${gameId}`), {
        started: true
    });
    window.location.href = `game.html?gameId=${gameId}`;
};
