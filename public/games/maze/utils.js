export function findFurthestPoint(maze) {
    const width = maze[0].length;
    const height = maze.length;
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const queue = [{ x: 0, y: 0, dist: 0 }];
    visited[0][0] = true;
    let furthestPoint = { x: 0, y: 0, dist: 0 };

    const directions = [
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.dist > furthestPoint.dist) {
            furthestPoint = current;
        }

        directions.forEach(dir => {
            const newX = current.x + dir.x;
            const newY = current.y + dir.y;
            if (newX >= 0 && newY >= 0 && newX < width && newY < height && maze[newY][newX] === 1 && !visited[newY][newX]) {
                visited[newY][newX] = true;
                queue.push({ x: newX, y: newY, dist: current.dist + 1 });
            }
        });
    }

    return furthestPoint;
}

export function findFurthestPoints2(maze) {
    const width = maze[0].length;
    const height = maze.length;

    function bfs(startX, startY) {
        const queue = [{ x: startX, y: startY }];
        const visited = Array.from({ length: height }, () => Array(width).fill(false));
        visited[startY][startX] = true;

        let furthestPoint = { x: startX, y: startY, distance: 0 };

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const neighbors = [
                { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }
            ];

            neighbors.forEach(({ x: nx, y: ny }) => {
                if (nx >= 0 && ny >= 0 && nx < width && ny < height && maze[ny][nx] === 1 && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny });
                    const distance = Math.abs(nx - startX) + Math.abs(ny - startY);
                    if (distance > furthestPoint.distance) {
                        furthestPoint = { x: nx, y: ny, distance };
                    }
                }
            });
        }

        return furthestPoint;
    }

    const firstFurthest = bfs(1, 1);
    const secondFurthest = bfs(firstFurthest.x, firstFurthest.y);

    return { first: firstFurthest, second: secondFurthest };
}
