// All original code, no original ideas.
canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');

let windowScale = [1, 1];
let windowSize = [window.innerWidth * windowScale[0], window.innerHeight * windowScale[1]];
let mousePos = [0, 0];
let speed = 1.3;

canvas.width = windowSize[0];
canvas.height = windowSize[1];

document.onmousemove = function(e) {
    mousePos = [e.pageX, e.pageY]
};

function touching(rect1, rect2) {
    if (rect1[0] < rect2[0] + rect2[2]) {
        if (rect1[0] + rect1[2] > rect2[0]) {
            if (rect1[1] < rect2[1] + rect2[3]) {
                if (rect1[1] + rect1[3] > rect2[1]) {
                    return true
                }
            }
        }
    }
    return false
}

let buttonSize = 35;

// Images
let toFull = new Image();
toFull.src = 'toFull.png';

let fromFull = new Image();
fromFull.src = 'fromFull.png';

function showButton() {

    let image;
    if (window.innerHeight === screen.height) {
        image = fromFull;
    } else {
        image = toFull;
    }

    let scale = windowSize[1] / 500;

    let x = windowSize[0] - (buttonSize + 20) * scale;
    let y = windowSize[1] - (buttonSize + 20) * scale;

    drawImage(image, x, y, buttonSize * scale, buttonSize * scale);
	
}

function exitFull() {

    if (document.cancelFullScreen) {
        document.cancelFullScreen();
		return true;
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
		return true;
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
		return true;
    }

}

function enterFull() {

    window.moveTo(0, 0);

    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
		return true;
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
		return true;
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
		return true;
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
		return true;
    }

    updateScreenSize();
}

// Fullscreen button
canvas.addEventListener('click', function() {

    let windowScale = windowSize[1] / 500;
    let mouseRect = [mousePos[0], mousePos[1], 0, 0];

    let buttonRect = [windowSize[0] - (buttonSize + 20) * windowScale, windowSize[1] - (buttonSize + 20) * windowScale, windowScale * buttonSize, windowScale * buttonSize]

    // console.log(mousePos, buttonRect);
    if (touching(mouseRect, buttonRect)) {

        // Try change fullscreen
        if (window.innerHeight === screen.height) {
            exitFull();
        } else {
            if (enterFull()) {
				windowScale = [1, 1];
			};
        }
    }
});

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
        this.x = windowSize[0] / 10;
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

        let scale = windowSize[1] / 500;
        
        if (this.touchingPipe(pipes) || (this.y + this.height) >= 500) {
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
        let scale = windowSize[1] / 500;

        if (this.velocityY > maxSpeed) {
            image = this.image1;
        } else if (this.velocityY < -maxSpeed) {
            image = this.image3;
        } else {
            image = this.image2;
        }

        let angle = (this.velocityY - 200) / 2000;
		
		if (key.isPressed('h')) {
			
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(this.x, this.y * scale, this.width * scale, this.height * scale);
			ctx.strokeStyle = '#f142f4';
			ctx.rect(this.x, this.y * scale, this.width * scale, this.height * scale);
			ctx.stroke();
		};
		
        drawImage(image, this.x, this.y * scale, this.width * scale, this.height * scale, angle);

        // ctx.fillStyle = 'black';
        // ctx.fillRect(this.x, this.y, 10, 10);
    }

    touchingPipe(pipes) {
        let thisRect = [this.x / (windowSize[1] / 500), this.y, this.width, this.height];

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
                this.velocityY = -400;
            }
        }

        // Apply things
        this.y += this.velocityY * dt;
        this.velocityY += dt * 1500;
        this.velocityY = Math.min(this.velocityY, 500);
    }
}


class Pipe {
    constructor(y, side, image, id) {
        this.image = image;
        this.id = id;

        this.scale = 2;
        this.x = windowSize[0] / (windowSize[1] / 500);

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
        let scale = windowSize[1] / 500;
		
		if (key.isPressed('h')) {
			
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
			ctx.strokeStyle = '#f142f4';
			ctx.rect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
			ctx.stroke();
		};
		ctx.drawImage(this.image, this.x * scale, this.y * scale, this.width * scale, this.height * scale);

    }

    move(dt) {
        this.x -= dt * 100 * speed
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
        this.nextSpawn = 0.7;

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
            let scale = windowSize[1] / 500;

            let gap = 110;
            let margin = 120;

            let y = (Math.random() * ((500 - 23) - margin * 2)) + margin;

            let obj = new Pipe(y + gap / 2, 0, this.image1, this.totalPipes);
            let obj2 = new Pipe(y - gap / 2, 1, this.image2, this.totalPipes);

            this.totalPipes += 1;

            this.pipes.push(obj);
            this.pipes.push(obj2);

            this.nextSpawn = (2 / speed) * 0.8;
        } else {
            this.nextSpawn -= dt;
        }
    }
}

if (!localStorage.highScore) {
	localStorage.highScore = 0;
}

let score = 0;
function updateScore() {
    let scores = [];

    // What is the closest pipe behind the bird?
    for (let pipe of pipes.pipes) {
        if (pipe.x < bird.x / (windowSize[1] / 500)) {
            scores.push(pipe.id)
        }
    }

    score = Math.max.apply(null, scores) + 1;
    score = Math.max(score, 0);

    localStorage.highScore = Math.max(localStorage.highScore, score)
}

let grounds = Math.ceil(windowSize[0] / windowSize[1]) + 1;
let dists = [];

for (let i = 0; i < grounds; i ++) {
    dists.push(i * 496)
}

let groundImg = new Image();
groundImg.src = 'ground.png';

function groundControl(dt) {

    let scale = windowSize[1] / 500;

    let newDists = [];
    for (dist of dists) {

        newDist = dist - 100 * dt * speed;
        if (newDist < -496) {
            newDist += 496 * (grounds);
        }

        newDists.push(newDist);
        ctx.drawImage(groundImg, newDist * scale, windowSize[1] - 23 * scale, 496 * scale, 23 * scale);
    }
    dists = newDists;
}

let bird = new Bird();
let pipes = new Pipes();

let spaceState = 0;
let lastSpace = 0;
function updateSpace() {
    let newState = Number(key.isPressed('space'));

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
    score = 0;
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

    groundControl(dt);
    showScore();
    showHighScore();
    updateTouch();
}

function showHighScore() {

    let scale = windowSize[1] / 500;
    let x = windowSize[0] - scale * 27 * localStorage.highScore.toString().length - scale * 10;

    ctx.fillStyle = '#000000';
    ctx.fillText(localStorage.highScore.toString(), x + 5 * scale, 55 * scale, windowSize[1]);
    ctx.fillStyle = '#d6a728';
    ctx.fillText(localStorage.highScore.toString(), x, 50 * scale, windowSize[1]);

}

function showScore() {

    let scale = windowSize[1] / 500;
    ctx.fillStyle = '#000000';
    ctx.fillText(score.toString(), scale * 15, 55 * scale, windowSize[1]);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(score.toString(), scale* 10, 50 * scale, windowSize[1]);

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

    let scale = 2 * (windowSize[1] / 500);
    let size = [47 * scale, 20 * scale];

    ctx.drawImage(image, (windowSize[0] - size[0]) / 2, (windowSize[1] - size[1]) / 2, size[0], size[1]);
}

function drawMouse() {
	
	ctx.fillStyle = '#000000';
	ctx.rect(mousePos[0] - 5, mousePos[1] - 5, 10, 10);	
	ctx.fill();
}

function preGame() {

    bird.x = windowSize[0] / 10;

    dt = getdt();
    showBackground();

    bird.show(maxSpeed = 15);
    bird.hover(dt);

    groundControl(dt);
    showScore();
    showHighScore();
    showStartImage(dt);
}

let stage = 0;
ctx.imageSmoothingEnabled = false;

let fontSize = (windowSize[1] / 500) * 48;
let fontString = Math.round(eval(fontSize)).toString() + 'px Main';
ctx.font = fontString;

function updateScreenSize() {

    windowSize = [window.innerWidth * windowScale[0], window.innerHeight * windowScale[1]];

    canvas.width = windowSize[0];
    canvas.height = windowSize[1];

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    fontSize = (windowSize[1] / 500) * 48;
    fontString = Math.round(eval(fontSize)).toString() + 'px Main';
    ctx.font = fontString;
	
	let newGrounds = Math.ceil(windowSize[0] / windowSize[1]) + 1;
	
	if (newGrounds != grounds) {
		
		console.log(grounds);
		
		grounds = newGrounds;
		dists = []

		for (let i = 0; i < grounds; i ++) {
			dists.push(i * 496)
		}
	}
}

function loop() {

    updateScreenSize();

    if ((key.isPressed('space') || touched) && stage === 0) {
        stage = 1;
        score = 0;
    }

    if (stage === 0) {
        preGame();
    } else {
        runGame()
    }

    showButton()
    updateTouch();

    requestAnimationFrame(loop);
}

let backgroundImg = new Image();
backgroundImg.src = 'background.png';
function showBackground() {

    // How many do we need?
    let amount = Math.ceil(windowSize[0] / windowSize[1]);

    for (let i = 0; i < amount; i ++) {
        ctx.drawImage(backgroundImg, windowSize[1] * i, 0, windowSize[1], windowSize[1]);
    }
}

// Run the code
loop();
