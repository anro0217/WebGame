export let currentGameId = null;
export let playerId = null;

export function setCurrentGameId(id) {
    currentGameId = id;
}

export function setPlayerId(id) {
    playerId = id;
}

export function getCurrentGameId() {
    return currentGameId;
}

export function getPlayerId() {
    return playerId;
}
