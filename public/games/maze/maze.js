export function generateMaze(width = 22, height = 22) {
    const maze = Array.from({ length: height }, () => Array(width).fill(0));
    const stack = [];
    const start = { x: 1, y: 1 };
    maze[start.y][start.x] = 1; 
    stack.push(start);

    const directions = [
        { x: 0, y: -2 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: -2, y: 0 }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = directions.filter(dir => {
            const newX = current.x + dir.x;
            const newY = current.y + dir.y;
            return newX > 0 && newY > 0 && newX < width - 1 && newY < height - 1 && maze[newY][newX] === 0;
        });

        if (neighbors.length > 0) {
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[current.y + chosen.y / 2][current.x + chosen.x / 2] = 1; 
            maze[current.y + chosen.y][current.x + chosen.x] = 1; 
            stack.push({ x: current.x + chosen.x, y: current.y + chosen.y });
        } else {
            stack.pop();
        }
    }

    maze[height - 1].fill(1);
    for (let i = 0; i < height; i++) maze[i][width - 1] = 1;

    const exitPosition = { x: Math.floor(Math.random() * (width - 2)) + 1, y: height - 1 };
    maze[exitPosition.y][exitPosition.x] = 1;

    return maze;
}

export function drawMaze(maze) {
    gameContainer.innerHTML = '';
    walls.length = [];

    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === 0) {
                const wall = {
                    x: j * 40,
                    y: i * 40,
                    width: 40,
                    height: 40
                };
                walls.push(wall);

                const wallDiv = document.createElement('div');
                wallDiv.classList.add('wall');
                wallDiv.style.width = '40px';
                wallDiv.style.height = '40px';
                wallDiv.style.left = `${wall.x}px`;
                wallDiv.style.top = `${wall.y}px`;
                gameContainer.appendChild(wallDiv);
            }
        });
    });
}
