// OJSN
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


canvas.width = 400;
canvas.height = 400;


const GRID_SIZE = 20;
const GAME_SPEED = 100;
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};


let snake = [];
let food = {};
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameStarted = false;


function initGame() {
    
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    
   
    spawnFood();
    
   
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
    score = 0;
    updateScore();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, GAME_SPEED);
    gameStarted = true;
}


function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
    };
    
   
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / GRID_SIZE))
        };
    }
}


function gameUpdate() {
    
    direction = nextDirection;
    
   
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
   
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    
    snake.unshift(head);
    
   
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
    } else {
       
        snake.pop();
    }
    
    draw();
}


function isCollision(head) {
    
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE ||
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}


function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    
   
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScoreValue').textContent = highScore;
    }
    
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press Start to play again', canvas.width / 2, canvas.height / 2 + 80);
}


function draw() {
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#27ae60' : '#2ecc71';
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
    });
    
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
}


function updateScore() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('highScoreValue').textContent = highScore;
}


document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        initGame();
    }
});

document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== DIRECTIONS.DOWN) {
                nextDirection = DIRECTIONS.UP;
            }
            break;
        case 'ArrowDown':
            if (direction !== DIRECTIONS.UP) {
                nextDirection = DIRECTIONS.DOWN;
            }
            break;
        case 'ArrowLeft':
            if (direction !== DIRECTIONS.RIGHT) {
                nextDirection = DIRECTIONS.LEFT;
            }
            break;
        case 'ArrowRight':
            if (direction !== DIRECTIONS.LEFT) {
                nextDirection = DIRECTIONS.RIGHT;
            }
            break;
    }
});


draw();
updateScore(); 