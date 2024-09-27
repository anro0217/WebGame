import firebaseConfig from './firebaseConfig.js';

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById('createGame').onclick = async function() {
    const username = document.getElementById('username').value;
    const gameId = generateGameId();
    const playerColor = getRandomColor();

    await db.collection('games').doc(gameId).set({
        players: {
            [username]: playerColor
        }
    });

    window.location.href = `lobby.html?gameId=${gameId}&username=${username}&color=${playerColor}`;
};

document.getElementById('joinGame').onclick = async function() {
    const username = document.getElementById('username').value;
    const gameCode = document.getElementById('gameCode').value;

    const gameDoc = await db.collection('games').doc(gameCode).get();
    if (gameDoc.exists) {
        const playerColor = getRandomColor();
        await db.collection('games').doc(gameCode).update({
            [`players.${username}`]: playerColor
        });
        window.location.href = `lobby.html?gameId=${gameCode}&username=${username}&color=${playerColor}`;
    } else {
        alert('A játék nem létezik.');
    }
};

function generateGameId() {
    return Math.random().toString(36).substring(2, 8);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
