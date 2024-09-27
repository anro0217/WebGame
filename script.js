import { db } from './firebaseConfig.js';
import { ref, set, get, update, child } from 'firebase/database';

document.getElementById('createGame').onclick = async function() {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Adj meg egy felhasználónevet!');
        return;
    }
    const gameId = generateGameId();
    const playerColor = getRandomColor();

    await set(ref(db, `games/${gameId}`), {
        players: {
            [username]: playerColor
        },
        started: false
    });

    window.location.href = `lobby.html?gameId=${gameId}&username=${username}&color=${playerColor}`;
};

document.getElementById('joinGame').onclick = async function() {
    const username = document.getElementById('username').value;
    const gameCode = document.getElementById('gameCode').value;

    const gameRef = ref(db, `games/${gameCode}`);
    const gameSnapshot = await get(gameRef);

    if (gameSnapshot.exists()) {
        const playerColor = getRandomColor();
        const playersRef = child(gameRef, 'players');

        await update(playersRef, {
            [username]: playerColor
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
