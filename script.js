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
        restartModal.style.display = "flex"; // Использование flex для центрирования кнопки
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
    score += points; // Добавление очков к общему счёту
    document.getElementById('score').textContent = `Score: ${score}`; // Обновление отображения счёта
    document.getElementById('result').textContent = `${score}`; // Обновление отображения результата
}

document.addEventListener('DOMContentLoaded', () => {
    updateScore(0); // Инициализация отображения счёта
});




// Получение элемента модального окна и кнопки рестарта
const restartModal = document.getElementById("restartModal");
const restartButton = document.getElementById("restartGame");

// Функция для показа модального окна
function showRestartModal() {
    restartModal.style.display = "flex"; // Использование flex для центрирования кнопки
}

// Обработчик клика по кнопке "Рестарт"
restartButton.onclick = function () {
    restartModal.style.display = "none";
    restartModal.style.display = "none"; // Скрыть модальное окно рестарта
    score = 0; // Сбросить счёт
    updateScore(0); // Обновить отображение счёта

    // Очистка игрового поля
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());

    // Пересоздание сетки и начальных плиток
    grid.cells.forEach(cell => cell.linkedTile = null); // Сброс всех связей с плитками
    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
    grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));

    setupInputOnce();
}

// Показывайте модальное окно при условии проигрыша
// showRestartModal();




document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submitScore');
    const restartButton = document.getElementById('restartGame');
    const nicknameInput = document.getElementById('nickname');
    const scoreDisplay = document.getElementById('result'); // Предполагается, что здесь отображается счёт игрока

    // Функция для отправки результатов игры
    submitButton.addEventListener('click', function () {
        const nickname = nicknameInput.value;
        const score = scoreDisplay.textContent; // Получаем счёт из соответствующего элемента

        // Проверяем, что никнейм введен
        if (nickname.trim() === '') {
            alert('Пожалуйста, введите ваш никнейм.');
            return;
        }

        // Отправляем данные на сервер
        fetch('/api/scores', { // Предполагается, что это ваш эндпоинт на сервере
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname, score }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Делаем поле ввода и кнопку неактивными
                nicknameInput.disabled = true;
                submitButton.disabled = true;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    // Добавьте сюда логику рестарта игры для restartButton, если необходимо
});
