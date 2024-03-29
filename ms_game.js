/*******************************************************/
// Mine Sweeper Type Game
// Written by Miles Baldwin
/*******************************************************/
console.log("%c Mine Sweeper Type Game", "color: blue;");

/******************************************************/
// VARIABLES AND CONSTANTS
/******************************************************/
const SCREENWIDTH = 600;
const SCREENHEIGHT = 700;
const TILESIZE = 37.5;
const BUTTONHEIGHT = 75;
const BUTTONWIDTH = 175;
// Total number of tiles in the 16 by 16 grid
const TILENUM = 256;
const MINESNUM = 40;

// Groups
var tiles;
var uncovered;
var mines;
// Sprite groups for each screen
var startSprites;
var gamesprites;
var endSprites;
var instructionSprites;

var timeSec = 0;
var timeMin = 0;
var timerInterval;
var screenSelector = "start";
var scoreMessage;

/******************************************************/
// setup()
/******************************************************/
// Sets up the program
function setup() {
    console.log("setup: ");
    cnv = new Canvas(SCREENWIDTH, SCREENHEIGHT);
    //Creating the groups
    tiles = new Group();
    mines = new Group();
    startSprites = new Group();
    gameSprites = new Group();
    endSprites = new Group();
    instructionSprites = new Group();
    uncovered = new Group();
    
    createButtons();
    
    textSize(40);
}

/******************************************************/
// draw()
/******************************************************/
// Runs 60 times a second
function draw() {
    if(screenSelector == "start") {
        startScreen();
    } 
    else if(screenSelector == "game") {
        gameScreen();
    }
    else if(screenSelector == "end") {
        endScreen();
    }
    else if(screenSelector == "instructions") {
        instructionScreen();
    } else {
        text("SOMETHING WENT WRONG!", 10, 50);
        text("Please Reload or contact help", 10, 100);
    }
}

/******************************************************/
// FUNCTIONS
/******************************************************/
// GAME SCREENS
//Start Screen
function startScreen() {
    // Top of every screen function controls which sprites dispaly
    startSprites.visible = true;
    gameSprites.visible = false;
    endSprites.visible = false;
    instructionSprites.visible = false;
    background("#41980a");
    
    //If Buttons pressed
    if(startButton.mouse.presses()) {
        screenSelector = "game";
        restart();
    }
    else if(instructionsButton.mouse.presses()) {
        screenSelector = "instructions";
    }
}
//Game screen
function gameScreen() {
    startSprites.visible = false;
    gameSprites.visible = true;
    endSprites.visible = false;
    background("lightgrey");
    checkTileClicked();
    // Displaying changing score
    text(timeMin + ":" + timeSec, 100, 60);
    text(uncovered.length + "/ 216", SCREENHEIGHT - 300, 60);
    
    //if all safe tiles are uncovered you win
    if(uncovered.length == 216) {
        screenSelector = "end";
        scoreMessage = "You won in a time of " + timeMin + ":" + timeSec;
    }
}
//End screen
function endScreen() {
    gameSprites.removeAll();
    startSprites.visible = false;
    gameSprites.visible = false;
    endSprites.visible = true;
    background("tomato");
    text(scoreMessage, 0, SCREENHEIGHT/2);
    if(restartButton.mouse.presses()) {
        restart();
    }
}
//Instructions screen
function instructionScreen() {
    startSprites.visible = false;
    gameSprites.visible = false;
    instructionSprites.visible = true;
    background("lightblue");
    
    if(backButton.mouse.presses()) {
        screenSelector = "start";        
    }
}

function restart() {
    timeSec = 0;
    timeMin = 0;
    createTileSprites();
    assignMines();
    timerInterval = setInterval(timer, 1000);
    screenSelector = "game";
}

// Creates the buttons that allow for movement between screens
function createButtons() {
    startButton = new Sprite(SCREENWIDTH/2, (SCREENHEIGHT/3) * 2, BUTTONWIDTH, BUTTONHEIGHT, 's');
    startButton.color = "blue";
    startButton.text = "START";
    startSprites.add(startButton);
    
    instructionsButton = new Sprite(SCREENWIDTH/2, (SCREENHEIGHT/3) * 2 + BUTTONHEIGHT, BUTTONWIDTH-25, BUTTONHEIGHT-25, 's');
    instructionsButton.color = "lightblue";
    instructionsButton.text = "INSTRUCTIONS";
    startSprites.add(instructionsButton);
    
    backButton = new Sprite((SCREENWIDTH/6) * 5, (SCREENHEIGHT/6) * 5 + BUTTONHEIGHT, BUTTONWIDTH-25, BUTTONHEIGHT-25, 's');
    backButton.color = "green";
    backButton.text = "BACK";
    instructionSprites.add(backButton);
    
    restartButton = new Sprite(SCREENWIDTH/2, (SCREENHEIGHT/3) * 2 + BUTTONHEIGHT, BUTTONWIDTH-25, BUTTONHEIGHT-25, 's');
    restartButton.color = "red";
    restartButton.text = "RESTART";
    endSprites.add(restartButton);
}


// Creates the tiles
function createTileSprites() {
    //Variables which denote where the sprite should be placed
    var tileXPos = 0 + TILESIZE/2;
    var tileYPos = SCREENHEIGHT - TILESIZE/2;
    // Logs how many tiles are in the current row
    var rowCounter = 0;
    
    //Loop to spawn all tiles
    for(var i = 0; i < TILENUM; i++) {
        /*If the row is not filled then the next spawned tile will
        spawn to the right of the previous tile. If the row is filled
        then the next tile will move up and go back to the start 
        posiiton this continues until all 16 rows 
        are filled*/
        if(rowCounter > 0 && rowCounter < 16) {
            tileXPos += TILESIZE;
        } else if(rowCounter == 16) {
            // Start new row so rowCounter set back to 0
            rowCounter = 0;
            //Y spawn move up. X spawn reverts to original
            tileYPos -= TILESIZE;
            tileXPos = 0 + TILESIZE/2;
        }

        tile = new Sprite(tileXPos, tileYPos, TILESIZE, TILESIZE, 's');
        tile.color = "lightgreen";
        tiles.add(tile);
        gameSprites.add(tile);
        // Log that another tile has been added to the row
        rowCounter += 1;
    }
}

// Assign some of the tiles to be mines
function assignMines() {
    var randNum;
    // Loops 40 times to create 40 marked tiles
    for (var i = 0; i < MINESNUM; i++) {
        // Picks a random sprite from the tiles group
        randTile = tiles[Math.round(random(0, tiles.length - 1))];
        // adds random tile to mines and removes from tiles
        mines.add(randTile);
        tiles.remove(randTile);
        mines.color = "red";
    }
}

// Checks if and what tile has been clicked
function checkTileClicked() {
    //This vraible is used to prevent loop running if a tile has already been found
    var clickedTileFound = false;
    
    //Check if mine clicked
    if(mines.mouse.presses()) {
        mineClicked();
    }
    if(!clickedTileFound) {
        // Goes through each tile and checks if the mouse clicks it
        for(var i = 0; i < tiles.length; i++) {
            if(tiles[i].mouse.presses()) {
                // Depending which tile the mouse is over it gets "uncovered"
                tiles[i].color = "brown";
                //adds the tile to a new group and removes it from the old
                uncovered.add(tiles[i]);
                tiles.remove(tiles[i]);
                console.log("Tile was clicked");
                break;
            }
        }
    }
}

// What happens if a mine is clicked
function mineClicked() {
    mines.color = "red";
    clickedTileFound = true;
    scoreMessage = "You uncovered " + uncovered.length + "/ 216 tiles.";
    clearInterval(timerInterval);
    screenSelector = "end";
}

function timer() {
    timeSec += 1;
    if(timeSec == 60) {
        timeMin += 1;
        timeSec = 0;
    }
}
