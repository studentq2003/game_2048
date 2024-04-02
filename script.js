import { Grid } from "./grid.js";
import { Tile } from "./tile.js";

export { updateScore }

const gameBoard = document.getElementById("game-board");

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
setupInputOnce();


function setupInputOnce() {
    window.addEventListener("keydown", handleInput, { once: true });
}

async function handleInput(event) {
    switch (event.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                setupInputOnce();
                return;
            }
            await moveUp();
            break;
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInputOnce();
                return;
            }
            await moveDown();
            break;
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInputOnce();
                return;
            }
            await moveLeft();
            break;
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInputOnce();
                return;
            }
            await moveRight();
            break;
        default:
            setupInputOnce();
            return;
    }

    const newTile = new Tile(gameBoard);
    grid.getRandomEmptyCell().linkTile(newTile);

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        await newTile.waitForAnimationEnd()
        restartModal.style.display = "flex";
        return;
    }

    setupInputOnce();
}

async function moveUp() {
    await slideTiles(grid.cellsGroupedByColumn);
}

async function moveDown() {
    await slideTiles(grid.cellsGroupedByReversedColumn);
}

async function moveLeft() {
    await slideTiles(grid.cellsGroupedByRow);
}

async function moveRight() {
    await slideTiles(grid.cellsGroupedByReversedRow);
}

async function slideTiles(groupedCells) {
    const promises = [];

    groupedCells.forEach(group => slideTilesInGroup(group, promises));

    await Promise.all(promises);
    grid.cells.forEach(cell => {
        cell.hasTileForMerge() && cell.mergeTiles()
    });
}

function slideTilesInGroup(group, promises) {
    for (let i = 1; i < group.length; i++) {
        if (group[i].isEmpty()) {
            continue;
        }

        const cellWithTile = group[i];

        let targetCell;
        let j = i - 1;
        while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
            targetCell = group[j];
            j--;
        }

        if (!targetCell) {
            continue;
        }

        promises.push(cellWithTile.linkedTile.waitForTransitionEnd());

        if (targetCell.isEmpty()) {
            targetCell.linkTile(cellWithTile.linkedTile);
        } else {
            targetCell.linkTileForMerge(cellWithTile.linkedTile);
        }

        cellWithTile.unlinkTile();
    }
}

function canMoveUp() {
    return canMove(grid.cellsGroupedByColumn);
}

function canMoveDown() {
    return canMove(grid.cellsGroupedByReversedColumn);
}

function canMoveLeft() {
    return canMove(grid.cellsGroupedByRow);
}

function canMoveRight() {
    return canMove(grid.cellsGroupedByReversedRow);
}

function canMove(groupedCells) {
    return groupedCells.some(group => canMoveInGroup(group));
}

function canMoveInGroup(group) {
    return group.some((cell, index) => {
        if (index === 0) {
            return false;
        }

        if (cell.isEmpty()) {
            return false;
        }

        const targetCell = group[index - 1];
        return targetCell.canAccept(cell.linkedTile);
    });
}

let score = 0;

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('result').textContent = `${score}`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateScore(0);
});



const restartModal = document.getElementById("restartModal");
const restartButton = document.getElementById("restartGame");


function showRestartModal() {
    restartModal.style.display = "flex";
}


restartButton.onclick = function () {
    restartModal.style.display = "none";
    score = 0;
    updateScore(0);

    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());

    grid.cells.forEach(cell => cell.linkedTile = null);
    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

    setupInputOnce();
}


document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submitScore');
    const restartButton = document.getElementById('restartGame');
    const nicknameInput = document.getElementById('nickname');
    const scoreDisplay = document.getElementById('result');

    submitButton.addEventListener('click', function () {
        const nickname = nicknameInput.value;
        const score = scoreDisplay.textContent;

        if (nickname.trim() === '') {
            alert('Пожалуйста, введите ваш никнейм.');
            return;
        }
        restartModal.style.display = "none";
        fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname, score }),
        })
            .then(response => response.json())
            .then(data => {
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
    restartModal.style.display = "none";
});
