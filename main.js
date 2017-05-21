// All original code, no original ideas.
let ctx = document.getElementById('canvas').getContext('2d');

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
        
        if (this.touchingPipe(pipes) || this.y >= 500 - 12 * 2 - 23) {
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

        // console.log(this.velocityY);

        let image;

        if (this.velocityY > maxSpeed) {
            image = this.image1;
        } else if (this.velocityY < -maxSpeed) {
            image = this.image3;
        } else {
            image = this.image2;
        }

        let angle = (this.velocityY - 200) / 2000;
        // console.log(angle);
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
                // console.log(performance.now());
                this.velocityY = -500;
            }
        }

        // Apply things
        this.y += this.velocityY * dt;
        this.velocityY += dt * 1500;
        this.velocityY = Math.min(this.velocityY, 500);

        this.y = Math.min(500 - 12 * 2 - 23, this.y)
    }
}


class Pipe {
    constructor(y, side, image, id) {
        this.image = image;
        this.id = id;

        this.scale = 2;
        this.x = 500;

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

            let y = Math.round(Math.random() * (500 - gap) + gap);

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

    // Move
    dist -= dt * 100;

    if (dist <= -496) {
        dist += 496
    }

    // Show
    ctx.drawImage(groundImg, dist, 500 - 23);
    ctx.drawImage(groundImg, dist + 496, 500 - 23);

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

function runGame() {

    if (key.isPressed('k')) {
        lastTime = performance.now();
        return;
    }

    updateScore();
    updateSpace();

    // console.log(score);

    // Get delta time
    let thisTime = performance.now();
    let dt = (thisTime - lastTime) / 1000;
    lastTime = thisTime;

    backgroundImg.onload = showBackground();

    pipes.update(dt);
    bird.update(dt, pipes.pipes);

    ctx.fillStyle = '#000000';
    ctx.fillText(score.toString(), 15, 55, 500);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(score.toString(), 10, 50, 500);

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

    ctx.drawImage(image, 0, 0, 500, 500);
}

function preGame() {

    // Get delta time
    let thisTime = performance.now();
    let dt = (thisTime - lastTime) / 1000;
    lastTime = thisTime;

    backgroundImg.onload = showBackground();

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
    ctx.drawImage(backgroundImg, 0, 500 - backgroundImg.height);
}

// Run the code
loop();
