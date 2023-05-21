class Example extends Phaser.Scene
{
    constructor() {
        super('example')
    }
    movingPlatform;
    cursors;
    platforms;
    stars;
    player;
    jumps = 0;
    jumpText;

    preload ()
    {
        //alert('preloading');
        this.load.path = './assets/';
        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    }


    create ()
    {
        gameState.active=true;
        //alert('creating');


        //let jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //jumpButton.onDown.add(jump, this);

        gameState.cursors = this.input.keyboard.createCursorKeys();

        //alert('setting cursor object');


        

        this.add.image(400, 300, 'sky');
        this.jumpText = this.add.text(650, 50, 'Jumps Used: '+gameState.jumps, {fontsize: '12px', fill: '#000'});

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // platforms.create(600, 400, 'ground');
        // platforms.create(50, 250, 'ground');
        // platforms.create(750, 220, 'ground');

        this.movingPlatform = this.physics.add.image(600, 400, 'ground');
        this.movingPlatform.setScale(200/this.movingPlatform.width,30/this.movingPlatform.height);
        this.movingPlatformv2 = this.physics.add.image(350,300,'ground');
        this.movingPlatformv2.setScale(200/this.movingPlatformv2.width,30/this.movingPlatformv2.height);
        this.movingPlatformv3 = this.physics.add.image(100,400,'ground');
        this.movingPlatformv3.setScale(200/this.movingPlatformv3.width,30/this.movingPlatformv3.height);

        this.movingPlatform.setImmovable(true);
        this.movingPlatform.body.allowGravity = false;
        //this.movingPlatform.setVelocityX(50);

        this.movingPlatformv2.setImmovable(true);
        this.movingPlatformv2.body.allowGravity = false;

        this.movingPlatformv3.setImmovable(true);
        this.movingPlatformv3.body.allowGravity = false;
        //this.movingPlatformv2.setVelocityX(50);

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        for (const star of this.stars.getChildren())
        {
            star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        }

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatform);
        this.physics.add.collider(this.player, this.movingPlatformv2);
        this.physics.add.collider(this.player, this.movingPlatformv3);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.stars, this.movingPlatform);
        this.physics.add.collider(this.stars, this.movingPlatformv2);
        this.physics.add.collider(this.stars, this.movingPlatformv3);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start('outro'));
        });
        //alert('exiting create');
    }



    update ()
    {
        const { left, right, up } = this.cursors;

        if (left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }
       

        /*if (up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }*/

        // This is the code during update() that detects if our little friend jumps and then increments the jump counter

        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && this.player.body.touching.down) {
            //gameState.player.anims.play('jump', true);
            this.player.setVelocityY(-330);
            gameState.jumps +=1;
            this.jumpText.setText('Jumps Used: ' + gameState.jumps);
            //alert(gameState.jumps);
          }
    
          if (!this.player.body.touching.down){
            //gameState.player.anims.play('jump', true);
          }

        if (this.movingPlatform.x >= 500)
        {
            this.movingPlatform.setVelocityX(-50);
        }
        else if (this.movingPlatform.x <= 300)
        {
            this.movingPlatform.setVelocityX(50);
        }

        if (this.movingPlatformv2.x >= 500)
        {
            this.movingPlatformv2.setVelocityX(-50);
        }
        else if (this.movingPlatformv2.x <= 300)
        {
            this.movingPlatformv2.setVelocityX(50);
        }
    }

    jump() {
        const{space} = this.cursors
        if (space.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-330);
            this.jumps++;
            this.jumpText.setText('Jumps Used: ' + this.jumps);
        }}



    collectStar (player, star)
    {
        star.disableBody(true, true);
    }


}

class Outro extends Phaser.Scene {
    constructor() {
        super('outro')
    }
    preload(){
        this.load.path = './assets/';
        this.load.image('campfire','campfire.gif')
       
    }
    create() {
        var campfire = this.add.image(910, 640, 'campfire');
        campfire.setScale(500/campfire.height,500/campfire.width);
        this.add.text(300,50, "Summary",{ fontFamily: 'Arial', size: 100, color: '#1940ff' }).setFontSize(90);
        this.add.text(310,150, "Number of Jumps made: "+gameState.jumps, { fontFamily: 'Arial', size: 20, color: '#fff' });
        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start('example'));
        });
    }
}

const gameState = {
    speed: 240,
    ups: 380,
    jumps: 0
  };
  
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            enableBody: true,
            debug: true
        }
    },
    scene: [Example,Outro]
};

const game = new Phaser.Game(config);