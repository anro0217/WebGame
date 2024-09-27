import firebaseConfig from './firebaseConfig.js';

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');
const username = params.get('username');
const playerColor = params.get('color');

const playersList = document.getElementById('playersList');

async function updatePlayersList() {
    const gameDoc = await db.collection('games').doc(gameId).get();
    const players = gameDoc.data().players;

    playersList.innerHTML = '';
    for (const [name, color] of Object.entries(players)) {
        const playerElement = document.createElement('div');
        playerElement.style.color = color;
        playerElement.innerText = name;
        playersList.appendChild(playerElement);
    }
}

document.getElementById('startGame').onclick = async function() {
    await db.collection('games').doc(gameId).update({
        started: true
    });
    window.location.href = `game.html?gameId=${gameId}`;
};

db.collection('games').doc(gameId).onSnapshot(updatePlayersList);
