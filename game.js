import Phaser from "phaser";

let game;

//game options
const gameOptions = {
    characterGravity: 800,
    characterSpeed: 1000
}


window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#CCCCFF",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000
        },

        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: [Start, PlayGame, GameOver]

    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

//game class
class PlayGame extends Phaser.Scene {

    constructor() {
        super('PlayGame');
        this.platformTimer = Phaser.Time.TimerEvent;
        this.bulletTimer = Phaser.Time.TimerEvent;
        this.obstacleTimer = Phaser.Time.TimerEvent;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
    }


    preload() {
        //getting the images
        this.load.spritesheet("character", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("apple", "assets/apple.png");
        this.load.image("platform", "./assets/platform.png");
        this.load.image("platform2", "./assets/platform3.png");
        this.load.image("platform3", "./assets/platform4.png");
        this.load.image("firstaid", "./assets/firstaid.png");
        this.load.image("space-baddie", "assets/space-baddie.png");
        console.log('loaded images');
    }


    create() {

            //for platforms
            this.platformGroup1 = this.physics.add.group({
                immovable: true,
                allowGravity: false
            });
            this.platformGroup2 = this.physics.add.group({
                immovable: true,
                allowGravity: false
            });
            this.platformGroup3 = this.physics.add.group({
                immovable: true,
                allowGravity: false
            });


            //for "friends"
            this.appleGroup = this.physics.add.group({});
            this.firstaidGroup = this.physics.add.group({});


            //for "enemies"
            this.bulletGroup = this.physics.add.group({});
            this.obstacleGroup = this.physics.add.group({});


            //bottom platforms
            this.platformGroup1.create(800, 1000, "platform");
            this.platformGroup1.create(400, 1000, "platform");
            this.platformGroup1.create(0, 1000, "platform");




            //center the character
            this.character = this.physics.add.sprite(50, 900, "character");
            this.character.body.gravity.y = gameOptions.characterGravity;

            //setting physics
            this.physics.add.collider(this.character, this.platformGroup1);
            this.physics.add.collider(this.character, this.platformGroup2);
            this.physics.add.collider(this.character, this.platformGroup3);
            this.physics.add.collider(this.appleGroup, this.platformGroup1);
            this.physics.add.collider(this.appleGroup, this.platformGroup2);
            this.physics.add.collider(this.appleGroup, this.platformGroup3);

            //score
            this.scoreText = this.add.text(32, 0, "Apples: 0\nLives: 3\nLevel: 1", { fontSize: "30px", fill: "#000" });

            //when hit 
            this.physics.add.overlap(this.character, this.appleGroup, this.getApples, null, this);
            this.physics.add.overlap(this.character, this.firstaidGroup, this.addLives, null, this);
            this.physics.add.overlap(this.character, this.bulletGroup, this.gotHit, null, this);
            this.physics.add.overlap(this.character, this.obstacleGroup, this.gotHit, null, this);



            //getting the cursors
            this.cursors = this.input.keyboard.createCursorKeys();

            //movement
            this.anims.create({
                key: "left",
                frames: this.anims.generateFrameNumbers("character", { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: "turn",
                frames: [{ key: "character", frame: 4 }],
                frameRate: 20,
            });
            this.anims.create({
                key: "right",
                frames: this.anims.generateFrameNumbers("character", { start: 5, end: 9 }),
                frameRate: 10,
                repeat: -1
            });


            //timers
            this.platformTimer = this.time.addEvent({
                callback: this.addPlatform,
                callbackScope: this,
                delay: 2000,
                loop: true

            });
            this.bulletTimer = this.time.addEvent({
                callback: this.addBullet,
                callbackScope: this,
                delay: 2500,
                loop: true

            });
            this.obstacleTimer = this.time.addEvent({
                callback: this.addObstacle,
                callbackScope: this,
                delay: 2000,
                loop: true

            });




        }
        //getting an apple
    getApples(character, apple) {
        apple.disableBody(true, true);
        this.score += 1;
        this.scoreText.setText("Apples:" + this.score + "\nLives:" + this.lives + "\nLevel: " + this.level);

        //add level
        if (this.score >= 10 * this.level) {
            this.level = this.level + 1;
            this.scoreText.setText("Apples:" + this.score + "\nLives:" + this.lives + "\nLevel: " + this.level);

            console.log("decreasing bullet timer");

            //decrease bullet timer-->becomes harder
            if (this.bulletTimer.delay > 1000) {
                this.bulletTimer.delay = this.bulletTimer.delay - 1000;
            }

        }

    }

    //increase lives
    addLives(character, firstaid) {
        firstaid.disableBody(true, true);
        this.lives += 1;
        this.scoreText.setText("Apples:" + this.score + "\nLives:" + this.lives + "\nLevel: " + this.level);
    }

    //got hit--> decrease lives
    gotHit(character, bullet) {
        console.log("got hit");
        bullet.disableBody(true, true);
        console.log(this.lives);
        this.lives = this.lives - 1;
        this.scoreText.setText("Apples:" + this.score + "\nLives:" + this.lives + "\nLevel: " + this.level);

    }

    //adding a new bullet
    addBullet() {

        this.bulletGroup.create(800, Phaser.Math.Between(10, 900), "bullet");
        //get velocity by the level of the game 
        let velocity = this.level * 150;
        this.bulletGroup.setVelocityX(-velocity);
        console.log(this.score, this.level);


    }

    //adding and obstacle to floor
    addObstacle() {
        //coin flip for adding a bullet to ground floor
        let coin_flip = Phaser.Math.Between(0, 2);
        if (coin_flip) {
            this.obstacleGroup.create(800, 950, "space-baddie");
            this.obstacleGroup.setVelocityX(-100);
        }
    }

    //adding a new platform
    addPlatform() {

        let next_height = Phaser.Math.Between(300, 900);
        let coin_flip = Phaser.Math.Between(0, 1);

        //flip a coin for the large or small platform
        if (coin_flip === 0) {

            this.platformGroup2.create(800, next_height, "platform2");
            this.platformGroup2.setVelocityX(-100);
        } else {

            this.platformGroup3.create(800, next_height, "platform3");
            this.platformGroup3.setVelocityX(-100);
        }
        //adding new apple. 50/50 odds
        let coin_flip2 = Phaser.Math.Between(0, 1);
        //adding a firstaid kit. 1/10 odds
        let firstaid = Phaser.Math.Between(0, 9);
        if (coin_flip2) {
            if (coin_flip === 0) {
                if (firstaid === 1) {
                    this.firstaidGroup.create(800, next_height - 50, "firstaid");
                    this.firstaidGroup.setVelocityX(-100);
                } else {
                    this.appleGroup.create(800, next_height - 50, "apple");
                }
            } else {
                if (firstaid === 1) {
                    this.firstaidGroup.create(800, next_height - 40, "firstaid");
                    this.firstaidGroup.setVelocityX(-100);
                } else {
                    this.appleGroup.create(800, next_height - 40, "apple");
                }
            }
            this.appleGroup.setVelocityX(-100);
        }
    }

    update() {

        //movevement: left, right, no movement, jump
        if (this.cursors.up.isDown && this.character.body.touching.down) {
            this.character.setVelocityY(-gameOptions.characterGravity);
        } else if (this.cursors.left.isDown) {
            this.character.body.velocity.x = -gameOptions.characterSpeed;
            this.character.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.character.body.velocity.x = gameOptions.characterSpeed;
            this.character.anims.play("right", true);
        } else {
            this.character.body.velocity.x = 0;
            this.character.anims.play("turn", true);

        }

        //if out of the map
        if (this.character.x > game.config.width + 200 || this.character.x < -200) {
            this.scene.start("PlayGame");
        }
        //if no lives
        if (this.lives === 0) {

            //reset and go to game over scene
            this.lives = 3;
            let apples = this.score;
            this.score = 0;
            this.level = 1;
            this.scene.start("GameOver", { "score": apples });
        }
    }

}

//game over class
class GameOver extends Phaser.Scene {
        constructor() {
                super('GameOver');
                this.button;
            }
            //get the score from the play scene
        init(data) {
            this.score = data.score;
        }
        create() {

            //show score 
            this.scoreText = this.add.text(32, 0, "Game Over\nYou collected: " + this.score + " apples", { fontSize: "30px", fill: "#000" });

            //add play button
            //https://www.patchesoft.com/phaser-3-title-screen-tutorial
            this.button = this.physics.add.sprite(400, 500, "button");
            this.button.setInteractive({ useHandCursor: true });
            this.button.on('pointerdown', () => this.startGame());
        }
        startGame() {
            this.scene.start('PlayGame');
        }
    }
    //start game class
class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        this.button;
    }
    preload() {
        this.load.image("button", "./assets/button-text.png");
    }
    create() {

        //info of the game
        this.scoreText = this.add.text(32, 0, "In this game you need to collect apples.\nYou have 3 lives and you get more lives if \nyou pick up firstaid packs.\nOne apple is one point.\nBut watch out for bullets and hostile\naliens that want to stop you for\ncollecting apples.\nAnd enemies get harder after each level.\nEach hit loses you one live and if your\nlives go to zero you lose", { fontSize: "30px", fill: "#000" });

        //add play button
        //https://www.patchesoft.com/phaser-3-title-screen-tutorial
        this.button = this.physics.add.sprite(400, 500, "button");
        this.button.setInteractive({ useHandCursor: true });
        this.button.on('pointerdown', () => this.startGame());
    }

    startGame() {
        this.scene.start('PlayGame');
    }
}