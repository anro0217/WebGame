import { db } from './firebase.js';
import * as gameData from './gameData.js';
import { generateMaze, drawMaze } from './games/maze/maze.js';

document.addEventListener('DOMContentLoaded', () => {
    const newGameButton = document.getElementById('newGame');
    const joinGameButton = document.getElementById('joinGame');
    const usernameInput = document.getElementById('username');
    const joinCodeInput = document.getElementById('joinCode');

    newGameButton.addEventListener('click', createNewGame);
    joinGameButton.addEventListener('click', joinGame);
    
    // Enter gomb kezelése
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!usernameInput.value && !joinCodeInput.value) {
                createNewGameWithRandomName();
            } else if (usernameInput.value) {
                createNewGame();
            } else if (joinCodeInput.value) {
                joinGame();
            }
        }
    });
});

function generateRandomUsername() {
    return 'Játékos' + Math.floor(Math.random() * 1000);
}

function createNewGameWithRandomName() {
    const username = generateRandomUsername();
    document.getElementById('username').value = username;
    createNewGame();
}

function createNewGame() {
    const username = document.getElementById('username').value;
    const newGameId = generateGameId(); // Új játékkód létrehozása
    gameData.setCurrentGameId(newGameId); // currentGameId beállítása
    const maze = generateMaze(); // Labirintus generálása
    db.ref(`games/${gameData.getCurrentGameId()}`).set({ 
        players: {}, 
        started: false, 
        creator: username,
        maze: maze // Labirintus elmentése az adatbázisba
    })
    .then(() => {
        document.getElementById('gameCode').innerText = `Csatlakozási kód: ${gameData.getCurrentGameId()}`; // Helyesen megjeleníti a kódot
        enterLobby();
        addPlayerToLobby(username);
    })
    .catch(error => {
        console.error('Hiba a játék létrehozásakor:', error);
    });
}

function joinGame() {
    const code = document.getElementById('joinCode').value;
    db.ref(`games/${code}`).once('value').then(snapshot => {
        if (snapshot.exists()) {
            gameData.setCurrentGameId(code); // currentGameId beállítása
            document.getElementById('gameCode').innerText = `Csatlakozási kód: ${gameData.getCurrentGameId()}`;
            enterLobby();
            const username = document.getElementById('username').value;
            addPlayerToLobby(username);
        } else {
            alert('A megadott játék kód nem létezik.');
        }
    });
}

function enterLobby() {
    document.getElementById('controls').style.display = 'none';
    lobby.style.display = 'block';

    const username = document.getElementById('username').value;

    db.ref(`games/${gameData.getCurrentGameId()}/creator`).once('value').then(snapshot => {
        const creator = snapshot.val();
        document.getElementById('startGame').style.display = username === creator ? 'block' : 'none';
        document.getElementById('hostName').innerText = `Host: ${creator}`; // Megjeleníti a host nevét
    });

    listenForPlayers();  // Játékos lista figyelése
    listenForGameStart();
}

function addPlayerToLobby(username) {
    const color = getRandomColor();
    const newPlayerId = Date.now(); // playerId létrehozása
    gameData.setPlayerId(newPlayerId); // playerId beállítása

    db.ref(`games/${gameData.getCurrentGameId()}/players/${username}`).set({ id: gameData.getPlayerId(), color: color })
    .then(() => {
        listenForPlayers();  // Frissíti a játékoslistát
    });
}

function listenForPlayers() {
    db.ref(`games/${gameData.getCurrentGameId()}/players`).on('value', (snapshot) => {
        playerList.innerHTML = ''; // Kiürítjük a listát

        snapshot.forEach(playerSnapshot => {
            const playerData = playerSnapshot.val();

            const playerContainer = document.createElement('div');
            playerContainer.style.display = 'flex';
            playerContainer.style.alignItems = 'center';

            const colorSquare = document.createElement('div');
            colorSquare.style.width = '20px';
            colorSquare.style.height = '20px';
            colorSquare.style.backgroundColor = playerData.color;
            colorSquare.style.marginRight = '10px';

            const playerName = document.createElement('span');
            playerName.innerText = playerSnapshot.key;

            playerContainer.appendChild(colorSquare);
            playerContainer.appendChild(playerName);
            playerList.appendChild(playerContainer);
        });

        document.getElementById('lobbyPlayers').innerText = `Játékosok: ${snapshot.numChildren()}`;
    });
}

function listenForGameStart() {
    db.ref(`games/${gameData.getCurrentGameId()}`).on('value', (snapshot) => {
        const gameData = snapshot.val();
        if (gameData && gameData.started) {
            lobby.style.display = 'none';
            gameContainer.style.display = 'block';
            gameContainer.style.visibility = 'visible';
            startGame();
        }
    });
}

function startGameFromLobby() {
    if (gameData.getCurrentGameId()) {
        db.ref(`games/${gameData.getCurrentGameId()}`).update({ started: true })
        .then(() => {
            console.log('A játék elindult.');
        })
        .catch((error) => {
            console.error('Hiba a játék indításakor:', error);
        });
    }
}

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
