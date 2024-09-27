import firebaseConfig from './firebaseConfig.js';
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let playerId = null;
let currentGameId = null;
const players = {};
const walls = [];
const gameContainer = document.getElementById('gameContainer');
const lobby = document.getElementById('lobby');
const playerList = document.getElementById('playerList');

document.getElementById('newGame').addEventListener('click', createNewGame);
document.getElementById('joinGame').addEventListener('click', joinGame);
document.getElementById('startGame').addEventListener('click', startGameFromLobby);

function createNewGame() {
    const username = document.getElementById('username').value;
    currentGameId = generateGameId();
    db.ref(`games/${currentGameId}`).set({ players: {}, started: false, creator: username });
    document.getElementById('gameCode').innerText = `Csatlakozási kód: ${currentGameId}`;
    enterLobby();
    addPlayerToLobby(username);
}

function joinGame() {
    const code = document.getElementById('joinCode').value;
    db.ref(`games/${code}`).once('value').then(snapshot => {
        if (snapshot.exists()) {
            currentGameId = code;
            document.getElementById('gameCode').innerText = `Csatlakozási kód: ${currentGameId}`;
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

    db.ref(`games/${currentGameId}/creator`).once('value').then(snapshot => {
        const creator = snapshot.val();
        document.getElementById('startGame').style.display = username === creator ? 'block' : 'none';
    });

    listenForPlayers();
}

function addPlayerToLobby(username) {
    const color = getRandomColor();
    playerId = Date.now();
    players[username] = { id: playerId, position: { x: 50, y: 50 }, color: color };
    db.ref(`games/${currentGameId}/players/${username}`).set(players[username]);
}

function listenForPlayers() {
    db.ref(`games/${currentGameId}/players`).on('value', (snapshot) => {
        const playerNames = [];
        snapshot.forEach(playerSnapshot => {
            const playerData = playerSnapshot.val();
            playerNames.push(`${playerSnapshot.key} (szín: ${playerData.color})`);
        });
        document.getElementById('lobbyPlayers').innerText = `Játékosok: ${playerNames.join(', ')}`;
    });
}

function startGameFromLobby() {
    if (currentGameId) {
        db.ref(`games/${currentGameId}`).update({ started: true })
            .then(() => {
                console.log('A játék elindult.');
            })
            .catch((error) => {
                console.error('Hiba a játék indításakor:', error);
            });

        listenForGameStart();
    }
}

function listenForGameStart() {
    db.ref(`games/${currentGameId}`).on('value', (snapshot) => {
        const gameData = snapshot.val();
        if (gameData && gameData.started) {
            console.log('A játék elkezdődött');
            lobby.style.display = 'none';
            gameContainer.style.display = 'block';
            startGame();
        }
    });
}

function startGame() {
    generateMaze();
    db.ref(`games/${currentGameId}/players`).on('value', (snapshot) => {
        gameContainer.innerHTML = '';
        playerList.innerHTML = '';
        snapshot.forEach(playerSnapshot => {
            const playerData = playerSnapshot.val();
            createPlayer(playerData.position.x, playerData.position.y, playerData.color);
            const playerName = document.createElement('p');
            playerName.innerText = `${playerSnapshot.key} - Szín: ${playerData.color}`;
            playerList.appendChild(playerName);
        });
    });

    document.addEventListener('keydown', handleKeyPress);
}

function generateMaze() {
    gameContainer.style.position = 'relative';
    gameContainer.style.left = `calc(50% - 100px)`;
    gameContainer.style.top = `calc(50% - 100px)`;

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (Math.random() < 0.2) {
                const wall = document.createElement('div');
                wall.classList.add('wall');
                wall.style.width = '20px';
                wall.style.height = '20px';
                wall.style.left = `${j * 20}px`;
                wall.style.top = `${i * 20}px`;
                gameContainer.appendChild(wall);
                walls.push({ x: j * 20, y: i * 20 });
            }
        }
    }

    const exit = document.createElement('div');
    exit.classList.add('wall');
    exit.style.width = '20px';
    exit.style.height = '20px';
    exit.style.left = `180px`;
    exit.style.top = `180px`;
    gameContainer.appendChild(exit);
    walls.push({ x: 180, y: 180 });
}

function createPlayer(x, y, color) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.style.backgroundColor = color;
    playerDiv.style.left = `${x}px`;
    playerDiv.style.top = `${y}px`;
    gameContainer.appendChild(playerDiv);
}

function handleKeyPress(e) {
    const direction = { x: 0, y: 0 };
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
            direction.y = -20;
            break;
        case 'ArrowDown':
        case 's':
            direction.y = 20;
            break;
        case 'ArrowLeft':
        case 'a':
            direction.x = -20;
            break;
        case 'ArrowRight':
        case 'd':
            direction.x = 20;
            break;
        default:
            return;
    }

    movePlayer(direction);
}

function movePlayer(direction) {
    const username = document.getElementById('username').value;
    db.ref(`games/${currentGameId}/players/${username}`).once('value', (snapshot) => {
        const currentPosition = snapshot.val().position;
        const newX = currentPosition.x + direction.x;
        const newY = currentPosition.y + direction.y;

        if (!walls.some(wall => wall.x === newX && wall.y === newY)) {
            db.ref(`games/${currentGameId}/players/${username}/position`).set({ x: newX, y: newY });
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateGameId() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}
