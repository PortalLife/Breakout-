// Game code for Breakout++
// Focuses on the main game logic.

// Declare the gamespace variables such as the width and height of the game world.

var ctx; //These variables are used for controlling and drawing to the canvas.
var x = 200;
var y = 350; // This x and y determine the starting position of the ball.

var dx = 10;
var dy = 10; // Delta X and Y to determine the direction of the ball.

var WIDTH;
var HEIGHT; // Width and height of the game world itself (Not the canvas)

var score = 0;

// Variables for eyes
var eyesXL;
var eyesXR;
var eyesY;
var eyeAngle;

// Variables for the paddle.
var paddlex;
var paddleh = 15;
var paddlew = 100;

var ballr = 20;
var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];

// Boolean values for keyboard controls.
var rightDown = false;
var leftDown = false;

var intervalId = 0;

// Variables for the bricks including the space between them, their height and width, etc.
var bricks;
var NROWS = 5;
var NCOLS = 5;
var BRICKWIDTH;
var BRICKHEIGHT = 30;
var PADDING = 5;

var dScale;
var paddleHit = false;

// Boolean variables for each state of the game.
var StartScreen = true;
var GamePlaying = false;
var GameOver = false;

var returnKeyDown = false;


$('body').keydown(function (e) {
    if (e.which == 13 && !returnKeyDown) {
        returnKeyDown = true;
    }
});

$('body').keyup(function (e) {
    if (e.which == 13) {
        returnKeyDown = false;
        StartScreen = false;
        GamePlaying = true;
    }
});

function LoadGame() {
    var canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');  // These variables are used for controlling and drawing to the canvas.

    if (StartScreen)
    {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.font = '50px Verdana';
        ctx.fillText("Breakout++", 250, 50);
        ctx.fillText("The worst BreakOut clone.", 100, 130);
        ctx.fillText("Press ENTER to begin.", 130, 250);
        ctx.fillText("To play, move the paddle", 90, 350);
        ctx.fillText("With the left and right", 130, 430);
        ctx.fillText("arrow keys.", 250, 500);
        ctx.fillText("Score is displayed below.", 100, 570);
    }

    WIDTH = 800;
    HEIGHT = 600;
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    paddlex = WIDTH / 2;
    intervalId = setInterval(draw, 18);
    return intervalId;

}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    rect(0, 0, WIDTH, HEIGHT);
}


function onKeyDown(evt) {
    if (evt.keyCode == 39)
        rightDown = true;
    else if (evt.keyCode == 37)
        leftDown = true;
}

function onKeyUp(evt) {
    if (evt.keyCode == 39)
        rightDown = false;
    else if (evt.keyCode == 37)
        leftDown = false;
}

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);

function LoadBricks() {
    bricks = new Array(NROWS);
    for (i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1;
        }
    }
}

function drawbricks() {
    for (i = 0; i < NROWS; i++) {
        ctx.fillStyle = rowcolors[i];
        for (j = 0; j < NCOLS; j++) {
            if (bricks[i][j] == 1) {
                rect((j * (BRICKWIDTH + PADDING)) + PADDING,
                        (i * (BRICKHEIGHT + PADDING)) + PADDING,
                        BRICKWIDTH, BRICKHEIGHT);
            }
        }
    }
}

function drawRotatedEye(theta, xEye, yEye) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(xEye, yEye);
    ctx.rotate(theta);
    ctx.arc(0, -3, 2, 0, Math.PI * 2, true);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
}

function drawScaledAnim(dScale) {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.translate(paddlex, (HEIGHT - paddleh));
    ctx.scale(dScale, dScale);
    ctx.globalAlpha = 0.4;
    rect(dScale - 30, -dScale - 4, paddlew, paddleh);
    ctx.restore();
}

function draw() {

    if (GamePlaying)
    {

        playSong();
        ctx.fillStyle = 'black';
        clear();
        ctx.fillStyle = 'white';
        circle(x, y, ballr);

        dScale = (eyesY - y) / 100;

        if (rightDown)
            paddlex += 10;
        else if (leftDown)
            paddlex -= 10;

        ctx.fillStyle = 'white';
        rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

        eyesY = HEIGHT - 5;
        eyesXL = paddlex + 10;
        eyesXR = paddlex + 90;

        dyEyeAndBall = eyesY - y;
        dxEyeAndBall = (paddlex + 37.5) - x;

        eyeAngle = Math.atan2(dyEyeAndBall, dxEyeAndBall);

        // drawing the eyes
        ctx.fillStyle = "#A3D1FF";
        circle(eyesXL, eyesY, 6);
        circle(eyesXR, eyesY, 6);

        drawRotatedEye(eyeAngle - 1.6, eyesXL, eyesY);
        drawRotatedEye(eyeAngle - 1.6, eyesXR, eyesY);

        drawbricks();

        rowheight = BRICKHEIGHT + PADDING;
        colwidth = BRICKWIDTH + PADDING;
        row = Math.floor(y / rowheight);
        col = Math.floor(x / colwidth);

        //reverse the ball and mark the brick as broken
        if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
            dy = -dy;
            bricks[row][col] = 0;
            score++;
            document.getElementById("score").innerHTML = score;
        }

        if (x + dx > WIDTH || x + dx < 0)
        {
            dx = -dx;
        }

        if (y + dy - ballr < 0)
        {
            dy = -dy;
        }
    
        //if the ball hits paddle and is under a certain y val draw rectangle
        
        if (paddleHit && y > 300) {
            drawScaledAnim(dScale);
        }
        else {
            paddleHit = false;
        }
        
        // Code to stop the paddle moving offscreen.

        if (paddlex < 0)
        {
            paddlex = 0;
        }

        if (paddlex >= 700)
        {
            paddlex = 700;
        }

        if (y + dy + ballr > HEIGHT - paddleh) // hit the paddle y value
        {
            if (x > paddlex && x < paddlex + paddlew) // hit inbetween the paddle
            {
                //move the ball differently based on where it hit the paddle
                dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew); // random offset
                dy = -dy; // negate the y value for the ball
                paddleHit = true;
            }
        }
        if (y > HEIGHT)
        {
            // game over
            GamePlaying = false;
            GameOver = true;
        }
        x += dx;
        y += dy;

    }
    else if (GameOver)
    {
        stopSong();
        clearInterval(intervalId);
        ctx.fillText("Game Over!", 200, 250);
        ctx.fillText("To play again,", 200, 350);
        ctx.fillText("Refresh the page.", 200, 450);
    }

    if (score == 25)
    {
        GamePlaying = false;
        clearInterval(intervalId);
        ctx.strokeStyle = 'blue';
        ctx.fillText("Game Over!", 200, 250);
        ctx.fillText("You win!", 200, 350);

    }
}
LoadGame();
LoadBricks();





