function createPlayer(x, y, color, playerId) {
    let playerDiv = document.getElementById(`player-${playerId}`);
    if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = `player-${playerId}`;
        playerDiv.classList.add('player');
        gameContainer.appendChild(playerDiv);
    }

    playerDiv.style.backgroundColor = color;
    playerDiv.style.width = '20px';
    playerDiv.style.height = '20px';
    playerDiv.style.left = `${x}px`;
    playerDiv.style.top = `${y}px`;
}

function handleKeyPress(e) {
    const direction = { x: 0, y: 0 };
    switch (e.key) {
        case 'ArrowUp': case 'w': direction.y = -20; break;
        case 'ArrowDown': case 's': direction.y = 20; break;
        case 'ArrowLeft': case 'a': direction.x = -20; break;
        case 'ArrowRight': case 'd': direction.x = 20; break;
        default: return;
    }
    movePlayer(direction);
}

function movePlayer(direction) {
    const username = document.getElementById('username').value;
    db.ref(`games/${currentGameId}/players/${username}`).once('value').then(snapshot => {
        const playerData = snapshot.val();
        const currentPosition = playerData.position || { x: 50, y: 50 };
        const newX = currentPosition.x + direction.x;
        const newY = currentPosition.y + direction.y;

        const playerWidth = 20;
        const playerHeight = 20;

        const isColliding = walls.some(wall => 
            newX < wall.x + wall.width && 
            newX + playerWidth > wall.x && 
            newY < wall.y + wall.height && 
            newY + playerHeight > wall.y
        );

        if (!isColliding) {
            db.ref(`games/${currentGameId}/players/${username}/position`).set({ x: newX, y: newY });
        }
    });
}
