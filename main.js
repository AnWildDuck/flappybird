// All original code, no original ideas.
canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');

let windowScale = 0.8;
let windowSize = [window.innerWidth * windowScale, window.innerHeight * windowScale];

canvas.width = windowSize[0];
canvas.height = windowSize[1];

// ctx.style.width = windowSize[0];
// ctx.style.height = windowSize[1];


console.log(windowSize);

function loadImage(src) {
    let image = new Image();
    image.src = src;
    return image;
}

function drawImage(image, x, y, width, height, rotation) {

    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.drawImage(image, 0, 0, width, height);

    ctx.rotate(-rotation);
    ctx.translate(-x, -y);


    // ctx.rotate(rotation);
}

class Bird {

    constructor() {
        this.x = 50;
        this.y = 200;
        this.velocityY = -200;

        this.image1 = loadImage('bird1.png');
        this.image2 = loadImage('bird2.png');
        this.image3 = loadImage('bird3.png');

        let imgScale = 2;
        this.width = 17 * imgScale;
        this.height = 12 * imgScale;

        this.distance = 0;
    }

    update(dt, pipes) {
        this.move(dt);
        this.show();
        
        if (this.touchingPipe(pipes) || this.y >= windowSize[1] - 12 * 2 - 23) {
            reset()
        }
    }

    hover(dt) {
        this.distance += dt;
        // this.y = Math.sin(this.distance * 3) * 20 + 250

        this.velocityY = Math.sin(this.distance * 3) * 100;
        this.y += this.velocityY * dt;

    }

    show(maxSpeed = 175) {
        let image;

        if (this.velocityY > maxSpeed) {
            image = this.image1;
        } else if (this.velocityY < -maxSpeed) {
            image = this.image3;
        } else {
            image = this.image2;
        }

        let angle = (this.velocityY - 200) / 2000;
        drawImage(image, this.x, this.y, this.width, this.height, angle);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(this.x, this.y, 10, 10);
    }

    touchingPipe(pipes) {
        let thisRect = [50, this.y, this.width, this.height];

        for (let pipe of pipes) {
            if (pipe.touching(thisRect)) {
                return true
            }
        }
        // If not touching any pipe
        return false;
    }

    move(dt) {
        // Flap
        if (spaceState || touched) {
            if (this.y > 10) {
                this.velocityY = -500;
            }
        }

        // Apply things
        this.y += this.velocityY * dt;
        this.velocityY += dt * 1500;
        this.velocityY = Math.min(this.velocityY, 500);

        this.y = Math.min(windowSize[1] - 12 * 2 - 23, this.y)
    }
}


class Pipe {
    constructor(y, side, image, id) {
        this.image = image;
        this.id = id;

        this.scale = 2;
        this.x = windowSize[0];

        this.width = 20 * this.scale;
        this.height = 200 * this.scale;

        if (side === 1) {
            this.y = y - 200 * this.scale;
        } else {
            this.y = y;
        }
    }

    update(dt) {
        this.move(dt);
        this.show();
    }

    show() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(dt) {
        this.x -= dt * 100
    }

    touching(rect) {
        // Ugly for readability
        // Left of this
        if (this.x + this.width >= rect[0]) {

            // Right of this
            if (this.x <= rect[0] + rect[2]) {

                // Above this
                if (this.y <= rect[1] + rect[3]) {

                    // Below this
                    if (this.y + this.height >= rect[1]) {

                        return true;
                    }
                }
            }
        }
        // If any of the above fail
        return false;
    }
}


class Pipes {

    constructor() {
        this.pipes = [];
        this.nextSpawn = 1;

        this.totalPipes = 0;

        this.scale = 2;

        this.image1 = new Image();
        this.image1.src = 'pipe.png';
        this.image2 = new Image();
        this.image2.src = 'pipe2.png';
    }

    update(dt) {
        this.spawn(dt);
        for (let pipe of this.pipes) {
            pipe.update(dt);
        }

        this.removeOld()
    }

    removeOld() {
        let okayPipes = [];
        for (let pipe of this.pipes) {
            if (pipe.x > -200) {
                okayPipes.push(pipe);
            }
        }
        this.pipes = okayPipes;
    }

    spawn(dt) {
        if (this.nextSpawn <= 0) {
            let gap = 150;

            let y = Math.round(Math.random() * (windowSize[1] - gap) + gap);

            let obj = new Pipe(y, 0, this.image1, this.totalPipes);
            let obj2 = new Pipe(y - gap, 1, this.image2, this.totalPipes);

            this.totalPipes += 1;

            this.pipes.push(obj);
            this.pipes.push(obj2);

            this.nextSpawn = 2;
        } else {
            this.nextSpawn -= dt;
        }
    }
}

let score = 0;
function updateScore() {
    let scores = [];

    // What is the closest pipe behind the bird?
    for (let pipe of pipes.pipes) {
        if (pipe.x < bird.x) {
            scores.push(pipe.id)
        }
    }

    score = Math.max.apply(null, scores) + 1;
    score = Math.max(score, 0);
}

let dist = 0;
let groundImg = new Image();
groundImg.src = 'ground.png';

function groundControl(dt) {

    let scale = windowSize[1] / 500;

    // Move
    dist -= dt * 100;

    if (dist <= -496 * scale) {
        dist += 496 * scale
    }

    // Show
    ctx.drawImage(groundImg, dist, windowSize[1] - 23 * scale, 496 * scale, 23 * scale);
    ctx.drawImage(groundImg, dist + 496 * scale, windowSize[1] - 23 * scale, 496 * scale, 23 * scale);

}

let bird = new Bird();
let pipes = new Pipes();

let spaceState = 0;
let lastSpace = 0;
function updateSpace() {
    newState = Number(key.isPressed('space'));

    if (lastSpace - newState === -1) {
        spaceState = true
    } else {
        spaceState = false
    }

    lastSpace = newState;
}

let touched;
window.addEventListener('touchstart', function updateTouch() {
    touched = 1;
}, false);

function updateTouch() {
    touched = 0;
}

function reset() {
    bird = new Bird();
    pipes = new Pipes();
    updateScore();
    stage = 0;
}

let lastTime = performance.now();
function getdt() {
    let thisTime = performance.now();
    let dt = (thisTime - lastTime) / 1000;
    lastTime = thisTime;

    if (dt > 1) {
        dt = 0;
    }

    return dt;
}


function runGame() {

    if (key.isPressed('k')) {
        lastTime = performance.now();
        return;
    }

    updateScore();
    updateSpace();

    dt = getdt();
    showBackground();

    pipes.update(dt);
    bird.update(dt, pipes.pipes);

    ctx.fillStyle = '#000000';
    ctx.fillText(score.toString(), 15, 55, windowSize[1]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(score.toString(), 10, 50, windowSize[1]);

    groundControl(dt);
    updateTouch();
}


let start1 = new Image();
start1.src = 'startMessage.png';

let start2 = new Image();
start2.src = 'startMessage2.png';

time = 0;
function showStartImage(dt) {

    time += dt;
    if (time >= 2) {
        time -= 2
    }

    let image;
    if (time >= 1) {
        image = start1;
    } else {
        image = start2;
    }

    let scale = 2;
    let size = [47 * scale, 20 * scale];

    ctx.drawImage(image, (windowSize[0] - size[0]) / 2, (windowSize[1] - size[1]) / 2, size[0], size[1]);
}

function preGame() {

    dt = getdt();
    showBackground();

    bird.show(maxSpeed = 15);
    bird.hover(dt);

    groundControl(dt);
    showStartImage(dt)
}

let stage = 0;
ctx.imageSmoothingEnabled = false;
ctx.font = '48px Main';
function loop() {

    if ((key.isPressed('space') || touched) && stage === 0) {
        stage = 1
    }

    if (stage === 0) {
        preGame();
    } else {
        runGame()
    }

    updateTouch();
    requestAnimationFrame(loop);
}

let backgroundImg = new Image();
backgroundImg.src = 'background.png';
function showBackground() {

    // How many do we need?
    let amount = Math.ceil(windowSize[0] / 500);

    for (let i = 0; i < amount; i ++) {
        ctx.drawImage(backgroundImg, windowSize[0] * i, 0, windowSize[1], windowSize[1]);
    }
}

// Run the code
loop();
