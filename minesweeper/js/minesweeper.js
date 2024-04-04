let difficulty;
let board = [];
let minesLocation = [];
let rows, cols, minesCount, lifeCount, flagCount;
let tileClicked = 0;
let timerStarted = false;
let flagCheck = false;
let isGameOver = false;
let isWin = false;
let timer;
let seconds = 0;
let themeAudio = new Audio("../sounds/themeSound.mp3");
let isMuted = false;
let flagsMap = {};


function logIn() {
    clickSound();
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = 'minesweeper/html/Login.html';
    }, 500);
}

function logOut() {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = 'Logout.html';
    }, 500);
}

window.onload = function () {
    setDifficulty('Easy');
    document.getElementById('difficulty-level').addEventListener('change', function () {
        setDifficulty(this.value);
    });
}

function setDifficulty(level) {
    difficulty = level;
    switch (level) {
        case 'Easy':
            setGameParameters(9, 9, 10, 3, 10);
            resetTimer();
            $('#gameOverModal').modal('hide');
            break;
        case 'Medium':
            setGameParameters(12, 15, 20, 5, 20);
            resetTimer();
            $('#gameOverModal').modal('hide');
            break;
        case 'Hard':
            setGameParameters(14, 20, 60, 10, 60);
            resetTimer();
            $('#gameOverModal').modal('hide');
            break;
    }
    startGame();
}

function setGameParameters(r, c, mines, lives, flags) {
    rows = r;
    cols = c;
    minesCount = mines;
    lifeCount = lives;
    flagCount = flags;
}

function setMines() {
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let i = Math.floor(Math.random() * rows);
        let j = Math.floor(Math.random() * cols);
        let id = i.toString() + "-" + j.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
    console.log('Bom:' + minesLocation);
}

function startGame() {
    themeSound();
    clearGameBoard();
    board = createGameBoard();
    tileClicked = 0;
    minesLocation = [];
    isGameOver = false;
    flagsMap = {};
    isMuted = false;
    resetTimer();
    updateDisplay();
}

function clearGameBoard() {
    let gameBoard = document.getElementById('board');
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
}

function createGameBoard() {
    let gameBoard = document.getElementById('board');
    gameBoard.style.setProperty('--cols', cols);
    gameBoard.style.setProperty('--rows', rows);
    let newBoard = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            let tile = createTile(i, j);
            gameBoard.appendChild(tile);
            row.push(tile);
        }
        newBoard.push(row);
    }
    return newBoard;
}

function createTile(i, j) {
    let tile = document.createElement('div');
    tile.id = i.toString() + "-" + j.toString();
    tile.addEventListener('click', () => handleTileClick(tile));
    tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleRightClick(e, tile);
    });
    return tile;
}
function handleTileClick(tile) {
    if (isGameOver || tile.classList.contains('tile-clicked') || 
    tile.classList.contains('mine-revealed') || 
    tile.classList.contains('flagged')) {
        return;
    }

     // If it's the first click, set the mines and ensure the clicked tile is not a mine
     if (tileClicked === 0) {
        do {
            setMines();
        } while (minesLocation.includes(tile.id));
    }

    if (minesLocation.includes(tile.id)) {
        minesSound();
        revealMines(parseInt(tile.id.split('-')[0]), parseInt(tile.id.split('-')[1]));
        handleMineHit();
    } else {
        clickSound();
        revealTile(tile);
    }
}

function handleRightClick(e, tile) {
    if (isGameOver || tile.classList.contains('tile-clicked') || tile.classList.contains('mine-revealed')) {
        return;
    }

    clickSound();
    toggleFlag(tile);
}

function toggleFlag(tile) {
    if (flagCount <= 0 && !tile.classList.contains('flagged')) {
        return; // If flagCount is 0 and tile is not already flagged, exit the function
    }

    if (!tile.classList.contains('tile-clicked')) {
        if (!tile.classList.contains('flagged')) {
            tile.innerText = '🚩';
            tile.classList.add('flagged');
            flagsMap[tile.id] = true;
            flagCheck = true;
            flagCount--; 
        } else {
            tile.innerText = '';
            tile.classList.remove('flagged');
            delete flagsMap[tile.id];
            flagCheck = false;
            flagCount++; 
        }
    }
    updateDisplay(); 
}

function revealTile(tile) {
    let coords = tile.id.split('-');
    let i = parseInt(coords[0]);
    let j = parseInt(coords[1]);

    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    if (minesLocation.includes(tile.id)) {
        revealMines(i, j);
        handleMineHit();
    } else {
        checkMines(i, j);
    }
}


function revealMines(i, j) {
    let tile = board[i][j];
    tile.classList.add('mine-revealed');
    if (minesLocation.includes(tile.id)) {
        tile.innerText = '💣';
        tile.style.backgroundColor = 'red';
    }
}


function handleMineHit() {
    lifeCount -= 1;
    minesCount -= 1;
    tileClicked += 1;
    minesSound();
    updateDisplay();

    if (lifeCount === 0) {
        minesCount = 0;
        gameOver();
    }
}


function revealAllMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let tile = board[i][j];
            if (minesLocation.includes(tile.id)) {
                if (!tile.classList.contains('flagged')) {
                    tile.innerText = '💣';
                    tile.style.backgroundColor = 'red';
                }
            } else if (tile.classList.contains('flagged')) {
                tile.innerText = '❌';
                tile.style.backgroundColor = 'green'; 
            }
        }
    }
}



function updateDisplay() {
    document.getElementById('life-count').innerText = lifeCount;
    document.getElementById('mines-count').innerText = minesCount;
    document.getElementById('flag-count').innerText = flagCount;
    document.getElementById('mineCount').innerText = 'Mines left: ' + minesCount;
    document.getElementById('flagCount').innerText = 'Flags left: ' + flagCount;
    document.getElementById('lifeCount').innerText = 'Lives left: ' + lifeCount;
    document.getElementById('timePlayed').innerText = 'Time played: ' + seconds + ' seconds';

}

function checkMines(i, j) {
    if (i < 0 || i >= rows || j < 0 || j >= cols || board[i][j].classList.contains('tile-clicked')) {
        return;
    }

    if (board[i][j].classList.contains('flagged')) {
        flagCheck = false;
        flagCount++;
    }
    updateDisplay();

    board[i][j].classList.add('tile-clicked');
    board[i][j].classList.remove('flagged');
    board[i][j].innerText = '';
    tileClicked += 1;

    let minesFound = 0;
    minesFound += checkTile(i - 1, j - 1);
    minesFound += checkTile(i - 1, j);
    minesFound += checkTile(i - 1, j + 1);
    minesFound += checkTile(i, j - 1);
    minesFound += checkTile(i, j + 1);
    minesFound += checkTile(i + 1, j - 1);
    minesFound += checkTile(i + 1, j);
    minesFound += checkTile(i + 1, j + 1);

    if (minesFound > 0) {
        board[i][j].innerText = minesFound;
        board[i][j].classList.add("x" + minesFound.toString());
    } else {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                checkMines(i + x, j + y);
            }
        }
    }

    if (tileClicked == rows * cols - minesCount) {
        setTimeout(function () {
            gameOver();
        }, 100);
    }
}

function checkTile(i, j) {
    if (i < 0 || i >= rows || j < 0 || j >= cols) {
        return 0;
    }
    return minesLocation.includes(i.toString() + "-" + j.toString()) ? 1 : 0;
}

function restartGame() {
    resetTimer();
    document.getElementById("timer").innerText = "0";
    muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    isMuted = false;
    timerStarted = false; // Reset timerStarted flag
    $('#gameOverModal').modal('hide');
    return setDifficulty(difficulty);
}



function startTimer() {
    if (!isGameOver) {
        timer = setTimeout(function () {
            var time = document.getElementById("timer");
            seconds++;
            time.innerText = seconds;
            startTimer();
        }, 1000);
    }
}


function resetTimer() {
    seconds = 0;
    document.getElementById("timer").innerText = "0";
    timerStarted = false; // Reset timerStarted flag
    clearTimeout(timer);
}

function gameOver() {
    isGameOver = true;
    clearTimeout(timer);
    revealAllMines();
    stopThemeSound();


    if (tileClicked == rows * cols - minesCount) {
        document.getElementById('gameOverModalLabel').innerText = 'Congratulations!';
        document.getElementById('gameResult').innerText = 'You won the game.';
        winSound();
    } else {
        document.getElementById('gameOverModalLabel').innerText = 'Unfortunately!';
        document.getElementById('gameResult').innerText = 'You lost the game.';
        gameOverSound();
    }

    if (isGameOver == false) {
        $('#gameOverModal').modal('hide');
    }

    $('#gameOverModal').modal('show');

    updateDisplay();
}

function clickSound() {
    var clickAudio = new Audio("../sounds/clickSound.mp3");
    clickAudio.play();
}

function themeSound() {
    isMuted = false;
    if (themeAudio.paused) {
        const playAudioOnUserInteraction = function () {
            document.body.removeEventListener('click', playAudioOnUserInteraction);
            themeAudio.loop = true;
            themeAudio.currentTime = 0;
            themeAudio.play();
        };
        document.body.addEventListener('click', playAudioOnUserInteraction);
    }
}


function stopThemeSound() {
    isMuted = true;
    if (themeAudio) {
        themeAudio.loop = false;
        themeAudio.pause();
        themeAudio.currentTime = 0;
    }
}

function minesSound() {
    var minesAudio = new Audio("../sounds/minesSound.mp3");
    minesAudio.play();
}

function gameOverSound() {
    var gameOver = new Audio("../sounds/gameOver.mp3");
    gameOver.play();
}

function winSound() {
    var winAudio = new Audio("../sounds/win.mp3");
    winAudio.play();
}


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
        showPopup();
    }
});

function showPopup() {
    $('#gameOverModal').modal('show');
}


var muteButton = document.getElementById('muteButton');

// Add event listener
muteButton.addEventListener('click', function () {
    // Check if sound is playing
    if (!isMuted) {
        stopThemeSound();
        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        isMuted = true;
    } else {
        themeSound();
        muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        isMuted = false;
    }
});


