let ctx = document.getElementById('canvas').getContext('2d');

class Bird {

    constructor() {
        this.y = 250;
        this.velocityY = 0;

        this.image = new Image();
        this.image.src = 'bird.png';

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
        this.y = Math.sin(this.distance * 3) * 20 + 250
    }

    show() {
        ctx.drawImage(this.image, 50, this.y, this.width, this.height);

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

        // Move forward
        this.x += 0;

        // Flap
        if (key.isPressed('space')) {
            if (this.y > 10) {
                this.velocityY = -350;
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
    constructor(y, side, image) {
        this.image = image;

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
    }

    spawn(dt) {
        if (this.nextSpawn <= 0) {

            let y = Math.round(Math.random() * 350) + 150;

            let obj = new Pipe(y, 0, this.image1);
            let obj2 = new Pipe(y - 150, 1, this.image2);

            this.pipes.push(obj);
            this.pipes.push(obj2);

            this.nextSpawn = 2;
        } else {
            this.nextSpawn -= dt;
        }
    }
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

function reset() {
    bird = new Bird();
    pipes = new Pipes();
    stage = 0;
}

let lastTime = performance.now();

function runGame() {

    // Get delta time
    let thisTime = performance.now();
    let dt = (thisTime - lastTime) / 1000;
    lastTime = thisTime;

    backgroundImg.onload = showBackground();

    pipes.update(dt);
    bird.update(dt, pipes.pipes);

    groundControl(dt);
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

    bird.show();
    bird.hover(dt);

    groundControl(dt);
    showStartImage(dt)
}

let stage = 0;
ctx.imageSmoothingEnabled = false;
function loop() {

    if (key.isPressed('space') && stage === 0) {
        stage = 1
    }

    if (stage === 0) {
        preGame();
    } else {
        runGame()
    }

    requestAnimationFrame(loop);
}

let backgroundImg = new Image();
backgroundImg.src = 'background.png';
function showBackground() {
    ctx.drawImage(backgroundImg, 0, 500 - backgroundImg.height);
}

// Run the code
loop();
