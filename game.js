// Move configuration to a separate module

const gameContainer = document.querySelector('.game-container');
const CONFIG = {
    SOUND: {
        EGG_FREQUENCY: 880,
        EGG_DURATION: 0.8,
        CHICKEN_FREQUENCY: 300,
        CHICKEN_DURATION: 0.5
    },
    ELEMENT_SIZE: {
        EGG_WIDTH: 50,
        EGG_HEIGHT: 50,
        CHICKEN_WIDTH: 80,
        CHICKEN_HEIGHT: 80,
        GRASS_WIDTH: 60,
        GRASS_HEIGHT: 60,
        CHICKEN_MIN_SIZE: 50,
        CHICKEN_SIZE_REDUCTION_FACTOR: 0.9,

    },
    TIME: {
        EGG_HATCH_TIME: 3000,
        EGG_COOLDOWN: 1000,
        CHICKEN_LIFETIME: 60,
        EGG_SHELL_ANIMATION_DURATION: 500,
        CHICKEN_JUMP_ANIMATION_DURATION: 1500,
        SPACE_PRESS_RESET_INTERVAL: 1000,
        CHICKEN_FADEOUT_DURATION: 1000,
        FEEDING_COOLDOWN: 3000,
        REQUIRED_SPACE_PRESSES: 3   // New constant for feeding cooldown (10 seconds)
    },
    MOVE: {
        INITIAL_MOVEMENT_DISTANCE: 50,
        MAX_MOVEMENT_DISTANCE: 200,
        MOVE_INTERVAL_MIN: 1000,
        MOVE_INTERVAL_MAX: 3000,
        MOVEMENT_INCREMENT: 5,
        DIRECTION_CHANGE_INTERVAL_MIN: 1000,
        DIRECTION_CHANGE_INTERVAL_MAX: 2000,
        CHICKEN_SIZE_MOVE_STEP:20
    },
    RANDOM_POSITION: {
        MAX_LEFT: gameContainer.offsetWidth,
        MAX_TOP: gameContainer.offsetHeight
    },
    FEEDING: {
        RICE_SIZE_RATIO: 0.5,
        CHICKEN_MAX_SIZE: 200,
        SIZE_INCREMENT: 20
    },
    GRID: {
        ROWS: 5,
        COLS: 8,
        CELL_VARIANCE: 0.3,
        POS_PADDING: 15
    }
};

// Move sound effects to a separate module
const createSoundEffect = (frequency, duration) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
};

const soundEffects = {
    egg: () => createSoundEffect(CONFIG.SOUND.EGG_FREQUENCY, CONFIG.SOUND.EGG_DURATION),
    chicken: () => createSoundEffect(CONFIG.SOUND.CHICKEN_FREQUENCY, CONFIG.SOUND.CHICKEN_DURATION)
};

// Move game element functions to a separate module

let score = 0;
const scoreDisplay = document.createElement('div');
scoreDisplay.className = 'score';
document.body.prepend(scoreDisplay);

const updateScore = () => {
    scoreDisplay.textContent = `Score: ${score}`;
};

const createEgg = () => {
    const egg = document.createElement('div');
    egg.className = 'egg';
    egg.style.backgroundImage = "url('egg.png')";
    egg.style.width = `${CONFIG.ELEMENT_SIZE.EGG_WIDTH}px`;
    egg.style.height = `${CONFIG.ELEMENT_SIZE.EGG_HEIGHT}px`;

    const initialChicken = document.getElementById('initial-chicken');
    if (initialChicken) {
        const chickenRect = initialChicken.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        // 计算小鸡底部中心的 x 和 y 坐标
        const eggLeft = chickenRect.left + (chickenRect.width / 2) - (CONFIG.ELEMENT_SIZE.EGG_WIDTH / 2) - containerRect.left;
        let eggTop = chickenRect.bottom - containerRect.top;
        // 向上移动 50px
        eggTop -= 50;

        egg.style.left = `${eggLeft}px`;
        egg.style.top = `${eggTop}px`;
    } else {
        const firstChicken = document.querySelector('.chicken');
        if (firstChicken) {
            const chickenRect = firstChicken.getBoundingClientRect();
            const containerRect = gameContainer.getBoundingClientRect();
            
            // 计算小鸡底部中心的 x 和 y 坐标
            const eggLeft = chickenRect.left + (chickenRect.width / 2) - (CONFIG.ELEMENT_SIZE.EGG_WIDTH / 2) - containerRect.left;
            let eggTop = chickenRect.bottom - containerRect.top;
            // 向上移动 50px
            eggTop -= 50;

            egg.style.left = `${eggLeft}px`;
            egg.style.top = `${eggTop}px`;
        } else {
            egg.style.left = `${Math.random() * CONFIG.RANDOM_POSITION.MAX_LEFT}px`;
            egg.style.top = `${Math.random() * CONFIG.RANDOM_POSITION.MAX_TOP}px`;
        }
    }

    gameContainer.appendChild(egg);

    setTimeout(() => {
        const eggPosition = {
            left: egg.style.left,
            top: egg.style.top
        };
        egg.remove();
        createChicken(eggPosition);
    }, CONFIG.TIME.EGG_HATCH_TIME);
};

const createChicken = (eggPosition) => {
    const eggShell = document.createElement('div');
    eggShell.className = 'egg-shell';
    eggShell.style.left = eggPosition.left;
    eggShell.style.top = eggPosition.top;
    eggShell.style.backgroundImage = "url('egg-shell.png')";
    gameContainer.appendChild(eggShell);

    eggShell.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(0.8) rotate(30deg)' },
        { transform: 'scale(0.5) rotate(60deg)' }
    ], {
        duration: CONFIG.TIME.EGG_SHELL_ANIMATION_DURATION,
        easing: 'ease-out'
    }).onfinish = () => eggShell.remove();

    const newChicken = document.createElement('div');
    newChicken.className = 'chicken';
    newChicken.style.backgroundImage = "url('chicken.png')";
    newChicken.style.left = eggPosition.left;
    newChicken.style.top = eggPosition.top;
    gameContainer.appendChild(newChicken);

    newChicken.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-30px)' },
        { transform: 'translateY(0)' }
    ], {
        duration: CONFIG.TIME.CHICKEN_JUMP_ANIMATION_DURATION,
        easing: 'ease-out'
    });

    score++;
    updateScore();
    moveChickenRandomly(newChicken);
};

const chickenMovementStates = new WeakMap();

const initGame = () => {
    // Add CSS to prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Create and play background music
    // const bgMusic = new Audio('theme.mp3');
    // bgMusic.loop = true;
    // bgMusic.play();
        // Create random grass elements
        for (let i = 0; i < 30; i++) {
            const grass = document.createElement('div');
            grass.className = 'grass';
            grass.style.backgroundImage = "url('grass.png')";
            grass.style.width = '60px';
            grass.style.height = '60px';
            grass.style.position = 'absolute';
            
            // New grid-based positioning algorithm
            const GRID_ROWS = 5;
            const GRID_COLS = 8;
            const CELL_VARIANCE = 0.3; // 30% size variation
            
            // Calculate cell dimensions
            const colWidth = CONFIG.RANDOM_POSITION.MAX_LEFT / GRID_COLS;
            const rowHeight = CONFIG.RANDOM_POSITION.MAX_TOP / GRID_ROWS;
            
            // Determine grid cell
            const col = Math.floor(Math.random() * GRID_COLS);
            const row = Math.floor(Math.random() * GRID_ROWS);
            
            // Calculate cell boundaries with random variation
            const cellMinX = col * colWidth * (1 - CELL_VARIANCE * Math.random());
            const cellMaxX = (col + 1) * colWidth * (0.8 + Math.random() * 0.2);
            const cellMinY = row * rowHeight * (1 - CELL_VARIANCE * Math.random());
            const cellMaxY = (row + 1) * rowHeight * (0.8 + Math.random() * 0.2);
            
            // Generate position within cell with padding
            const posPadding = 15;
            grass.style.left = `${posPadding + cellMinX + Math.random() * (cellMaxX - cellMinX - posPadding * 2)}px`;
            grass.style.top = `${posPadding + cellMinY + Math.random() * (cellMaxY - cellMinY - posPadding * 2)}px`;
            
            grass.style.zIndex = '0';
            // 添加背景图片缩放样式
            grass.style.backgroundSize = 'contain'; 
            grass.style.backgroundRepeat = 'no-repeat'; 
            grass.style.backgroundPosition = 'center'; 
            gameContainer.appendChild(grass);
        }
    
    
    const firstChicken = document.createElement('div');
    firstChicken.className = 'initial-chicken';
    firstChicken.id = 'initial-chicken';
    firstChicken.style.backgroundImage = "url('chicken.png')";
    firstChicken.style.left = `${Math.random() * CONFIG.RANDOM_POSITION.MAX_LEFT}px`;
    firstChicken.style.top = `${Math.random() * CONFIG.RANDOM_POSITION.MAX_TOP}px`;
    gameContainer.appendChild(firstChicken);
    // 将 isInitial 参数设置为 true
    moveChickenRandomly(firstChicken, true);
    updateScore();
};

let lastFrameTime = performance.now();
let frameCount = 0;

const monitorPerformance = () => {
    const now = performance.now();
    frameCount++;
    if (now > lastFrameTime + 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastFrameTime = now;
    }
    requestAnimationFrame(monitorPerformance);
};

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    monitorPerformance();
});

let lastEggTime = 0;
let spacePressCount = 0;
let lastSpacePressTime = 0;
let isFeeding = false;
let lastFeedingTime = Date.now();


// 删除节流函数定义
// const throttle = (func, limit) => {
//     let inThrottle;
//     return function() {
//         const args = arguments;
//         const context = this;
//         if (!inThrottle) {
//             func.apply(context, args);
//             inThrottle = true;
//             setTimeout(() => inThrottle = false, limit);
//         }
//     };
// };

// 删除节流后的 feedChicken 函数
// const throttledFeedChicken = throttle(feedChicken, 3000); 

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const currentTime = Date.now();
        if (currentTime - lastSpacePressTime > CONFIG.TIME.SPACE_PRESS_RESET_INTERVAL) {  // Updated to use constant
            spacePressCount = 0;
        }
        spacePressCount++;
        lastSpacePressTime = currentTime;

        if (spacePressCount >= 3 && !isFeeding && currentTime - lastFeedingTime >= CONFIG.TIME.FEEDING_COOLDOWN) {  // Updated to use constant
            isFeeding = true;
            spacePressCount = 0;
            // 直接调用 feedChicken 函数
            feedChicken();
        }

        if (!isFeeding && currentTime - lastEggTime >= CONFIG.TIME.EGG_COOLDOWN) {
            lastEggTime = currentTime;
            createEgg();
        }
    }
});

const moveChickenRandomly = (chicken, isInitial = false) => {
    let movementDistance = CONFIG.MOVE.INITIAL_MOVEMENT_DISTANCE;
    const maxDistance = CONFIG.MOVE.MAX_MOVEMENT_DISTANCE;
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    let timeAlive = 0;
    let directionX = Math.random() > 0.5 ? 1 : -1;
    let directionY = Math.random() > 0.5 ? 1 : -1;
    let moveCount = 0;  // Add move counter
    
    const changeDirection = () => {
        directionX = Math.random() > 0.5 ? 1 : -1;
        directionY = Math.random() > 0.5 ? 1 : -1;
        setTimeout(changeDirection, 1000 + Math.random() * 2000); // Change direction every 1-3 seconds
    };
    setTimeout(changeDirection, 1000 + Math.random() * 2000);

    const move = () => {
        if (chickenMovementStates.get(chicken) === false) {
            setTimeout(move, CONFIG.MOVE.MOVE_INTERVAL_MIN + Math.random() * (CONFIG.MOVE.MOVE_INTERVAL_MAX - CONFIG.MOVE.MOVE_INTERVAL_MIN));
            return;
        }

        timeAlive += 0.5;
        moveCount++;  // Increment move counter

        if (!isInitial && timeAlive >= CONFIG.TIME.CHICKEN_LIFETIME) {
            chicken.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], {
                duration: CONFIG.TIME.CHICKEN_FADEOUT_DURATION,
                easing: 'ease-out'
            }).onfinish = () => chicken.remove();
            return;
        }

        // Add size reduction for initial chicken every CHICKEN_SIZE_MOVE_STEP moves
        if (isInitial && moveCount % CONFIG.MOVE.CHICKEN_SIZE_MOVE_STEP === 0) {
            const currentWidth = parseInt(chicken.style.width) || CONFIG.ELEMENT_SIZE.CHICKEN_WIDTH;
            const currentHeight = parseInt(chicken.style.height) || CONFIG.ELEMENT_SIZE.CHICKEN_HEIGHT;
            const newSize = Math.max(
                CONFIG.ELEMENT_SIZE.CHICKEN_MIN_SIZE,  // Fixed: Use correct CONFIG path
                currentWidth * CONFIG.ELEMENT_SIZE.CHICKEN_SIZE_REDUCTION_FACTOR
            );
            chicken.style.width = `${newSize}px`;
            chicken.style.height = `${newSize}px`;
        }

        const currentLeft = parseInt(chicken.style.left) || 0;
        const currentTop = parseInt(chicken.style.top) || 0;
        const chickenWidth = parseInt(chicken.style.width) || CONFIG.ELEMENT_SIZE.CHICKEN_WIDTH;
        const chickenHeight = parseInt(chicken.style.height) || CONFIG.ELEMENT_SIZE.CHICKEN_HEIGHT;

        movementDistance = Math.min(movementDistance + CONFIG.MOVE.MOVEMENT_INCREMENT, maxDistance);  // Updated
        
        // Calculate new position with continuous movement
        let newLeft = currentLeft + (movementDistance * 0.1 * directionX);
        let newTop = currentTop + (movementDistance * 0.1 * directionY);
        
        // Change direction when hitting boundaries
        if (newLeft <= 0 || newLeft >= containerWidth - chickenWidth) {
            directionX *= -1;
            newLeft = Math.max(0, Math.min(containerWidth - chickenWidth, newLeft));
        }
        
        if (newTop <= 0 || newTop >= containerHeight - chickenHeight) {
            directionY *= -1;
            newTop = Math.max(0, Math.min(containerHeight - chickenHeight, newTop));
        }

        chicken.style.left = `${newLeft}px`;
        chicken.style.top = `${newTop}px`;

        setTimeout(move, CONFIG.MOVE.MOVE_INTERVAL_MIN / 5); // Faster movement interval for smoother animation
    };

    move();
};

const feedChicken = () => {
    const initialChicken = document.getElementById('initial-chicken');
    // 检查是否成功获取到初始小鸡元素
    if (!initialChicken) {
        console.log('未找到初始小鸡元素');
        return;
    }

    chickenMovementStates.set(initialChicken, false);

    // 添加小鸡跳跃动画
    const jumpAnimation = initialChicken.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-30px)' },
        { transform: 'translateY(0)' }
    ], {
        duration: CONFIG.TIME.CHICKEN_JUMP_ANIMATION_DURATION,
        easing: 'ease-out',
        iterations: Infinity
    });

    const rice = document.createElement('div');
    rice.className = 'rice';
    rice.style.backgroundImage = "url('rice.png')";
    const chickenWidth = parseInt(initialChicken.style.width) || CONFIG.ELEMENT_SIZE.CHICKEN_WIDTH;
    rice.style.width = `${chickenWidth * 0.5}px`;  // 75% of chicken width
    rice.style.height = `${chickenWidth * 0.5}px`;  // Maintain aspect ratio
    rice.style.position = 'absolute';

    const containerRect = gameContainer.getBoundingClientRect();
    const chickenRect = initialChicken.getBoundingClientRect();
    // 检查矩形信息是否正确获取
    if (!containerRect || !chickenRect) {
        console.log('无法获取容器或小鸡的矩形信息');
        jumpAnimation.cancel();
        chickenMovementStates.set(chicken, true);
        return;
    }

    rice.style.left = `${chickenRect.left - containerRect.left}px`;
    rice.style.top = '0px';

    gameContainer.appendChild(rice);

    const moveAnimation = rice.animate([
        { top: '0px' },
        { top: `${chickenRect.top - containerRect.top}px` }
    ], {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards'
    });

    setTimeout(() => {
        rice.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => {
            rice.remove();
            const currentWidth = parseInt(initialChicken.style.width) || CONFIG.ELEMENT_SIZE.CHICKEN_WIDTH;
            const currentHeight = parseInt(initialChicken.style.height) || CONFIG.ELEMENT_SIZE.CHICKEN_HEIGHT;
            initialChicken.style.width = (currentWidth + 20) > 200?'200px':`${currentWidth + 20}px`;
            initialChicken.style.height = (currentHeight + 20) > 200?'200px':`${currentHeight + 20}px`;

            // 停止小鸡跳跃动画
            jumpAnimation.cancel();

            // 确保 isChickenMoving 被正确设置为 true
            chickenMovementStates.set(initialChicken, true);
            isFeeding = false;
            lastFeedingTime = Date.now();
            isFeeding = false;
        };
    }, 1000);
};