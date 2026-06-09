const boxes = document.querySelectorAll(".box");
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const pvpMode = document.getElementById("pvpMode");
const pvcMode = document.getElementById("pvcMode");
const modalContainer = document.getElementById("modalContainer");
const modalMsg = document.getElementById("modalMsg");
const newGameBtn = document.getElementById("newGameBtn");

let board = ["", "", "", "", "", "", "", "", ""];
let isPlayerVsAI = false; // default PVP
let isXTurn = true; // X plays first
let isGameActive = true;

const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Initialize game
function initGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    isXTurn = true;
    isGameActive = true;
    statusText.innerText = "X's Turn";
    statusText.style.color = "#ff007f";
    boxes.forEach(box => {
        box.innerText = "";
        box.className = "box"; // resets extra x-val / o-val classes
        box.removeAttribute("disabled");
    });
    modalContainer.classList.add("hide");
}

// Mode Selection
pvpMode.addEventListener("click", () => {
    isPlayerVsAI = false;
    pvpMode.classList.add("active");
    pvcMode.classList.remove("active");
    initGame();
});

pvcMode.addEventListener("click", () => {
    isPlayerVsAI = true;
    pvcMode.classList.add("active");
    pvpMode.classList.remove("active");
    initGame();
});

// Play box click
boxes.forEach(box => {
    box.addEventListener("click", (e) => {
        const index = parseInt(e.target.getAttribute("data-index"));
        if (board[index] !== "" || !isGameActive) return;
        
        makeMove(index, isXTurn ? "X" : "O");
        
        if (isGameActive && isPlayerVsAI) {
            // AI plays "O" after player plays "X"
            disableBoard();
            setTimeout(aiMove, 400);
        }
    });
});

function makeMove(index, player) {
    board[index] = player;
    const box = boxes[index];
    box.innerText = player;
    box.classList.add(player === "X" ? "x-val" : "o-val");
    box.setAttribute("disabled", "true");
    
    checkResult();
    
    if (isGameActive) {
        isXTurn = !isXTurn;
        statusText.innerText = `${isXTurn ? "X" : "O"}'s Turn`;
        statusText.style.color = isXTurn ? "#ff007f" : "#00f2fe";
    }
}

function disableBoard() {
    boxes.forEach(box => {
        if (box.innerText === "") {
            box.setAttribute("disabled", "true");
        }
    });
}

function enableBoard() {
    boxes.forEach((box, idx) => {
        if (board[idx] === "") {
            box.removeAttribute("disabled");
        }
    });
}

function checkResult() {
    let roundWon = false;
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === "" || board[b] === "" || board[c] === "") continue;
        if (board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            break;
        }
    }
    
    if (roundWon) {
        isGameActive = false;
        const winner = isXTurn ? "X" : "O";
        showWinner(winner);
        return;
    }
    
    if (!board.includes("")) {
        isGameActive = false;
        showDraw();
    }
}

function showWinner(winner) {
    modalMsg.innerText = `Player ${winner} Wins!`;
    modalMsg.style.color = winner === "X" ? "#ff007f" : "#00f2fe";
    modalContainer.classList.remove("hide");
}

function showDraw() {
    modalMsg.innerText = "It's a Draw!";
    modalMsg.style.color = "#cbd5e1";
    modalContainer.classList.remove("hide");
}

// AI logic using Minimax
function aiMove() {
    const bestMove = getBestMove(board);
    enableBoard();
    if (bestMove !== -1) {
        makeMove(bestMove, "O");
    }
}

function getBestMove(tempBoard) {
    let bestScore = -Infinity;
    let move = -1;
    
    for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === "") {
            tempBoard[i] = "O";
            let score = minimax(tempBoard, 0, false);
            tempBoard[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = {
    O: 10,
    X: -10,
    draw: 0
};

function checkWinState(b) {
    for (let pattern of winPatterns) {
        const [x, y, z] = pattern;
        if (b[x] !== "" && b[x] === b[y] && b[y] === b[z]) {
            return b[x];
        }
    }
    if (!b.includes("")) return "draw";
    return null;
}

function minimax(tempBoard, depth, isMaximizing) {
    let result = checkWinState(tempBoard);
    if (result !== null) {
        return scores[result];
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (tempBoard[i] === "") {
                tempBoard[i] = "O";
                let score = minimax(tempBoard, depth + 1, false);
                tempBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (tempBoard[i] === "") {
                tempBoard[i] = "X";
                let score = minimax(tempBoard, depth + 1, true);
                tempBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

resetBtn.addEventListener("click", initGame);
newGameBtn.addEventListener("click", initGame);

// Load default settings
initGame();
