var DEBUG = false;
var SPEED = 180;
var GRAVITY = 18;
var FLAP = 420;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 144;

function init(parent) {

var state = {
    preload: preload,
    create: create,
    update: update,
    render: render
};

var game = new Phaser.Game(
    1010,
    568,
    Phaser.CANVAS,
    parent,
    state,
    false,
    false
);

function preload() {
    var assets = {
        spritesheet: {
            pirate: ['assets/pirateHead_small.png', 50, 53],
            clouds: ['assets/clouds.png', 128, 64]
        },
        image: {
            sword: ['assets/sword.png'],
            ship: ['assets/pirateShip.png']
        },
        audio: {
            flap: ['assets/flap.wav'],
            score: ['assets/score.wav'],
            hurt: ['assets/argh.mp3']
        }
    };
    Object.keys(assets).forEach(function(type) {
        Object.keys(assets[type]).forEach(function(id) {
            game.load[type].apply(game.load, [id].concat(assets[type][id]));
        });
    });
}

var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    clouds,
    swords,
    invs,
    pirate,
    ship,
    scoreText,
    instText,
    gameOverText,
    flapSnd,
    scoreSnd,
    hurtSnd,
    swordsTimer,
    cloudsTimer,
    cobraMode = 0,
    gameOvers = 0,
    clickableArea;

function create() {
    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setScreenSize(true);
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0xDDEEFF, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    // Credits 'yo
    credits = game.add.text(
        game.world.width / 2,
        10,
        'github.com/acmasu/dtmb',
        {
            font: '8px "Press Start 2P"',
            fill: '#fff',
            align: 'center'
        }
    );
    credits.anchor.x = 0.5;
    // Add clouds group
    clouds = game.add.group();
    // Add swords
    swords = game.add.group();
    // Add invisible thingies
    invs = game.add.group();

    // Add pirate
    pirate = game.add.sprite(0, 0, 'pirate');
    pirate.anchor.setTo(0.5, 0.5);
    pirate.inputEnabled = true;
    pirate.body.collideWorldBounds = true;
    pirate.body.gravity.y = GRAVITY;

    // Add ship
    ship = game.add.tileSprite(0, game.world.height - 110, game.world.width, 110, 'ship');
    //ship.tileScale.setTo(.50, .50);

    // Add score text
    scoreText = game.add.text(
        game.world.width / 2,
        game.world.height / 4,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#FFCC00',
            stroke: '#990000',
            strokeThickness: 4,
            align: 'center'
        }
    );
    scoreText.anchor.setTo(0.5, 0.5);

    // Add instructions text
    instText = game.add.text(
        game.world.width / 2,
        game.world.height - game.world.height / 4,
        "",
        {
            font: '8px "Press Start 2P"',
            fill: '#FFCC00',
            stroke: '#990000',
            strokeThickness: 4,
            align: 'center'
        }
    );
    instText.anchor.setTo(0.5, 0.5);

    // Add game over text
    gameOverText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        "",
        {
            font: '16px "Press Start 2P"',
            fill: '#FFCC00',
            stroke: '#990000',
            strokeThickness: 4,
            align: 'center'
        }
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);

    // Add sounds
    flapSnd = game.add.audio('flap');
    scoreSnd = game.add.audio('score');
    hurtSnd = game.add.audio('hurt');

    //Set Clickable Area
    clickableArea = new Phaser.Rectangle(0,0,game.width-125,game.height-125);

    // Add controls
    game.input.onDown.add(flap);
    game.input.keyboard.addCallbacks(game, onKeyDown, onKeyUp);

    // Start clouds timer
    cloudsTimer = new Phaser.Timer(game);
    cloudsTimer.onEvent.add(spawnCloud);
    cloudsTimer.start();
    cloudsTimer.add(Math.random());

    // RESET!
    reset();
}

function reset() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("DON'T\nSTAB\nTHE\nPIRATE");
    instText.setText("TOUCH OR CLICK\nTO PLAY");
    gameOverText.renderable = false;
    pirate.body.allowGravity = false;
    pirate.angle = 0;
    pirate.reset(game.world.width / 4, game.world.height / 2);
    pirate.scale.setTo(1, 1);
    swords.removeAll();
    invs.removeAll();
}

function start() {
    credits.renderable = false;
    pirate.body.allowGravity = true;
    // SPAWN swordS!
    swordsTimer = new Phaser.Timer(game);
    swordsTimer.onEvent.add(spawnswords);
    swordsTimer.start();
    swordsTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;
}

/*function flap() {
    if (!gameStarted) {
        start();
    }
    if (!gameOver) {
        pirate.body.velocity.y = -FLAP;
        flapSnd.play();
        console.log(scoreText.text);
    }
}*/

flap = function(pointer){
    //this is the test, contains test for a point belonging to a rect definition
    var inside = clickableArea.contains(pointer.x,pointer.y)
    console.log(inside);
    if(inside){
      if (!gameStarted) {
          start();
        }
        if (!gameOver) {
          pirate.body.velocity.y = -FLAP;
          flapSnd.play();
          console.log(scoreText.text);
        }
      }
}


function spawnCloud() {
    cloudsTimer.stop();

    var cloudY = Math.random() * game.height / 2;
    var cloud = clouds.create(
        game.width,
        cloudY,
        'clouds',
        Math.floor(4 * Math.random())
    );
    var cloudScale = 2 + 2 * Math.random();
    cloud.alpha = 2 / cloudScale;
    cloud.scale.setTo(cloudScale, cloudScale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -SPEED / cloudScale;
    cloud.anchor.y = 0;

    cloudsTimer.start();
    cloudsTimer.add(4 * Math.random());
}

function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
}

function spawnsword(swordY, flipped) {
    var sword = swords.create(
        game.width,
        swordY + (flipped ? -o() : o()) / 2,
        'sword'
    );
    sword.body.allowGravity = false;

    // Flip sword! *GASP*
    sword.scale.setTo(2, flipped ? -2 : 2);
    sword.body.offset.y = flipped ? -sword.body.height * 2 : 0;

    // Move to the left
    sword.body.velocity.x = -SPEED;

    return sword;
}

function spawnswords() {
    swordsTimer.stop();

    var swordY = ((game.height - 16 - o() / 2) / 2) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;
    // Bottom sword
    var botsword = spawnsword(swordY);
    // Top sword (flipped)
    var topsword = spawnsword(swordY, true);

    // Add invisible thingy
    var inv = invs.create(topsword.x + topsword.width, 0);
    inv.width = 2;
    inv.height = game.world.height;
    inv.body.allowGravity = false;
    inv.body.velocity.x = -SPEED;

    swordsTimer.start();
    swordsTimer.add(1 / SPAWN_RATE);
}

function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    scoreText.setText(score);
    scoreSnd.play();
}

function setGameOver() {
    gameOver = true;
    instText.setText("CLICK THE PIRATE\nTO TRY AGAIN");
    instText.renderable = true;
    var hiscore = window.localStorage.getItem('hiscore');
    hiscore = hiscore ? hiscore : score;
    hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
    window.localStorage.setItem('hiscore', hiscore);
    // Stop all swords
    swords.forEachAlive(function(sword) {
        sword.body.velocity.x = 0;
    });
    invs.forEach(function(inv) {
        inv.body.velocity.x = 0;
    });
    // Stop spawning swords
    swordsTimer.stop();
    // Make pirate reset the game
    pirate.events.onInputDown.addOnce(reset);
    hurtSnd.play();
    gameOvers++;
}

function update() {
    if (gameStarted) {
        // Make pirate dive
        var dvy = FLAP + pirate.body.velocity.y;
        pirate.angle = (90 * dvy / FLAP) - 180;
        if (pirate.angle < -30) {
            pirate.angle = -30;
        }
        if (
            gameOver ||
            pirate.angle > 90 ||
            pirate.angle < -90
        ) {
            pirate.angle = 90;
            pirate.frame = 3;
        }
        // pirate is DEAD!
        if (gameOver) {
            if (pirate.scale.x < 4) {
                pirate.scale.setTo(
                    pirate.scale.x * 1.2,
                    pirate.scale.y * 1.2
                );
            }
            // Shake game over text
            // gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
        } else {
            // Check game over
            if (cobraMode < 1) {
                game.physics.overlap(pirate, swords, setGameOver);
                if (!gameOver && pirate.body.bottom >= game.world.bounds.bottom) {
                    setGameOver();
                }
            }
            // Add score
            game.physics.overlap(pirate, invs, addScore);
        }
        // Remove offscreen swords
        swords.forEachAlive(function(sword) {
            if (sword.x + sword.width < game.world.bounds.left) {
                sword.kill();
            }
        });
        // Update sword timer
        swordsTimer.update();
    } else {
        pirate.y = (game.world.height / 2) + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
        // Shake instructions text
        instText.scale.setTo(
            2 + 0.1 * Math.sin(game.time.now / 100),
            2 + 0.1 * Math.cos(game.time.now / 100)
        );
    }
    // Shake score text
    scoreText.scale.setTo(
        2 + 0.1 * Math.cos(game.time.now / 100),
        2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update clouds timer
    cloudsTimer.update();
    // Remove offscreen clouds
    clouds.forEachAlive(function(cloud) {
        if (cloud.x + cloud.width < game.world.bounds.left) {
            cloud.kill();
        }
    });
    // Scroll ship
    if (!gameOver) {
        ship.tilePosition.x -= game.time.physicsElapsed * SPEED / 2;
    }
    // Decrease cobra mode
    cobraMode -= game.time.physicsElapsed * SPEED * 5;
}

function render() {
    if (DEBUG) {
        game.debug.renderSpriteBody(pirate);
        swords.forEachAlive(function(sword) {
            game.debug.renderSpriteBody(sword);
        });
        invs.forEach(function(inv) {
            game.debug.renderSpriteBody(inv);
        });
    }
}

function onKeyDown(e) { }

var pressTime = 0;
function onKeyUp(e) {
    if (Phaser.Keyboard.SPACEBAR == e.keyCode) {
        if (game.time.now - pressTime < 200) {
            cobraMode = 1000;
        } else {
            flap();
        }
        pressTime = game.time.now;
    }
}

};
