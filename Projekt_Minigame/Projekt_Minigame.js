const menu = document.getElementById('menu');
const difficultyMenu = document.getElementById('difficultyMenu');
const gameBoard = document.getElementById('gameBoard');
const message = document.getElementById('message');
const menuMessage = document.getElementById('menuMessage');
const resultMessage = document.getElementById('resultMessage');
const scoreDisplay = document.getElementById('score');
const ZeitDisplay = document.getElementById('Zeit');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const drawSound = document.getElementById('drawSound');
const loseSound = document.getElementById('loseSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const menuMusic = document.getElementById('menuMusic');
const victorySound = document.getElementById('victorySound');
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let gameMode = '';
let difficulty = '';
let playerScore = 0;
let cpuScore = 0;
let player2Score = 0;
let timeLeft = 0;
let timerInterval;
let currentRound = 1;
let Zeit = false;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellClick = (event) => {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    clickSound.play();
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    if (gameMode === 'cpu' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeCpuMove, 500);
    }
};

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer);
};

const handleResultValidation = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        backgroundMusic.pause();
        if (currentPlayer === 'O' && gameMode === 'cpu') {
            cpuScore++;
            loseSound.play().then(() => {
                backgroundMusic.play();
            });
            resultMessage.textContent = 'Verloren';
        } else {
            if (gameMode === '1vs1' && currentPlayer === 'O') {
                player2Score++;
            } else {
                playerScore++;
            }
            winSound.play().then(() => {
                backgroundMusic.play();
            });
            resultMessage.textContent = `Player ${currentPlayer} Gewonnen!`;
        }
        updateScoreDisplay();
        gameActive = false;
        message.style.display = 'block';
        clearInterval(timerInterval);

        if (playerScore === 3 || cpuScore === 3 || player2Score === 3) {
            victorySound.play();
            resultMessage.textContent = playerScore === 3 ? 'Du hast gewonnen!' : (cpuScore === 3 ? 'CPU hat gewonnen!' : 'Spieler 2 hat gewonnen');
            resetScores();
            document.querySelector('button[data-action="Nächste-Runde"]').style.display = 'none';
        }
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        backgroundMusic.pause();
        drawSound.play().then(() => {
            backgroundMusic.play();
        });
        resultMessage.textContent = 'Unentschieden';
        gameActive = false;
        message.style.display = 'block';
        clearInterval(timerInterval);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
};

const updateScoreDisplay = () => {
    if (gameMode === 'cpu') {
        scoreDisplay.textContent = `Score: ${playerScore} - ${cpuScore}`;
    } else {
        scoreDisplay.textContent = `Score: ${playerScore} - ${player2Score}`;
    }
};

const resetScores = () => {
    playerScore = 0;
    cpuScore = 0;
    player2Score = 0;
    updateScoreDisplay();
};

const handleNextRound = () => {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    resultMessage.textContent = '';
    message.style.display = 'none';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O');
    });
    backgroundMusic.play();
    currentRound++;
    if (Zeit) {
        startTimer();
    }
};

const handleRestartGame = () => {
    handleNextRound();
    resetScores();
    currentRound = 1;
};

const makeCpuMove = () => {
    let availableCells = board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
    let randomIndex;
    if (difficulty === 'Einfach') {
        randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficulty === 'Mittel') {
        randomIndex = getMediumMove(availableCells);
    } else if (difficulty === 'Schwer') {
        randomIndex = getBestMove();
    }
    const cpuCell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
    handleCellPlayed(cpuCell, randomIndex);
    handleResultValidation();
};

const getMediumMove = (availableCells) => {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === 'X' && b === 'X' && c === '') {
            return winCondition[2];
        }
        if (a === 'X' && c === 'X' && b === '') {
            return winCondition[1];
        }
        if (b === 'X' && c === 'X' && a === '') {
            return winCondition[0];
        }
    }
    return availableCells[Math.floor(Math.random() * availableCells.length)];
};

const getBestMove = () => {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
};

const minimax = (board, depth, isMaximizing) => {
    let result = checkWinner();
    if (result !== null) {
        return result;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

const checkWinner = () => {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            if (a === 'O') {
                return 10;
            } else if (a === 'X') {
                return -10;
            }
        }
    }
    if (!board.includes('')) {
        return 0;
    }
    return null;
};

const handleMenuClick = (event) => {
    const clickedItem = event.target;
    const mode = clickedItem.getAttribute('data-mode');

    menuClickSound.currentTime = 0;
    menuClickSound.play();

    if (mode === '1vs1') {
        gameMode = mode;
        menu.style.display = 'none';
        gameBoard.style.display = 'grid';
        message.style.display = 'none';
        menuMessage.style.display = 'none';
        handleNextRound();
        backgroundMusic.play();
        menuMusic.pause();
    } else if (mode === 'cpu') {
        menu.style.display = 'none';
        difficultyMenu.style.display = 'grid';
        menuMessage.textContent = 'Von Alen Alicajic';
    } else if (mode === 'Zeit') {
        Zeit = !Zeit;
        clickedItem.textContent = `Zeit: ${Zeit ? 'ON' : 'OFF'}`;
        if (Zeit) {
            ZeitDisplay.style.display = 'block';
            startTimer();
        } else {
            ZeitDisplay.style.display = 'none';
            clearInterval(timerInterval);
        }
    } else if (mode === 'Spiel Musik') {
        menuMusic.play().catch(error => {
            console.error('Fehler beim Musik abspielen:', error);
        });
    } else if (mode === 'Zurück') {
        stopAllSounds();
        gameMode = '';
        menu.style.display = 'grid';
        gameBoard.style.display = 'none';
        message.style.display = 'none';
        menuMessage.style.display = 'block';
        menuMessage.textContent = 'von Alen Alicajic';
        backgroundMusic.pause();
        menuMusic.play();
    }
};

const handleDifficultyClick = (event) => {
    const clickedItem = event.target;
    const difficultyLevel = clickedItem.getAttribute('data-difficulty');

    menuClickSound.currentTime = 0;
    menuClickSound.play();

    if (difficultyLevel === 'Einfach' || difficultyLevel === 'Mittel' || difficultyLevel === 'Schwer') {
        difficulty = difficultyLevel;
        gameMode = 'cpu';
        difficultyMenu.style.display = 'none';
        gameBoard.style.display = 'grid';
        message.style.display = 'none';
        menuMessage.style.display = 'none';
        handleNextRound();
        backgroundMusic.play();
        menuMusic.pause();
    } else if (difficultyLevel === 'Zurück') {
        stopAllSounds();
        menu.style.display = 'grid';
        difficultyMenu.style.display = 'none';
        menuMessage.textContent = 'Von Alen Alicajic';
    }
};

const handleMessageClick = (event) => {
    const action = event.target.getAttribute('data-action');
    if (action === 'nächste-runde') {
        stopAllSounds();
        handleNextRound();
    } else if (action === 'neustart') {
        stopAllSounds();
        handleRestartGame();
    } else if (action === 'hauptmenü') {
        stopAllSounds();
        gameMode = '';
        menu.style.display = 'grid';
        gameBoard.style.display = 'none';
        message.style.display = 'none';
        menuMessage.style.display = 'block';
        menuMessage.textContent = 'Von Alen Alicajic';
        backgroundMusic.pause();
        menuMusic.play();
    }
};

const stopAllSounds = () => {
    winSound.pause();
    loseSound.pause();
    drawSound.pause();
    victorySound.pause();
    winSound.currentTime = 0;
    loseSound.currentTime = 0;
    drawSound.currentTime = 0;
    victorySound.currentTime = 0;
};

const startTimer = () => {
    let ZeitLimits = {
        Einfach: [60, 30, 15],
        Mittel: [30, 15, 10],
        Schwer: [15, 10, 5]
    };

    if (Zeit) {
        timeLeft = ZeitLimits[difficulty][currentRound - 1];
        ZeitDisplay.textContent = `Zeit übrig: ${timeLeft}s`;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                ZeitDisplay.textContent = `Zeit übrig: ${timeLeft}s`;
            } else {
                clearInterval(timerInterval);
                gameActive = false;
                resultMessage.textContent = 'Zeit vorbei! Verloren!';
                message.style.display = 'block';
                loseSound.play();
            }
        }, 1000);
    }
};

document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
message.addEventListener('click', handleMessageClick);
document.querySelectorAll('.menu-item').forEach(item => item.addEventListener('click', handleMenuClick));
document.querySelectorAll('#difficultyMenu .menu-item').forEach(item => item.addEventListener('click', handleDifficultyClick));

backgroundMusic.volume = 0.25;
menuMusic.volume = 0.25;

menuMusic.play().catch(error => {
    console.error('Fehler beim Musik abspielen', error);
});