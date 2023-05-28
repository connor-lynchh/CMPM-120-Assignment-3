class Level extends Phaser.Scene
{
    constructor(key) {
        super(key);
        //alert(key);

        this.levelKey = key
        this.nextLevel = {
          'Level1': 'Level2',
          'Level2': 'Level3',
          'Level3': 'Level1',
          'Level4': 'Credits',
        }
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
        this.load.image('bg3','snowdunes.png')
        this.load.spritesheet('campfire2','campfire.png',{ frameWidth: 32, frameHeight: 32});       
        this.load.audio('mars', 'Mars, the Bringer of War.ogg')
        this.load.image('bg2', 'trees.png');
    }

    create ()
    {
        gameState.active=true;
        gameState.min=0;
        gameState.sec=0;
        gameState.jumps=0;
        gameState.stars=0;
        gameState.nextLevel=this.nextLevel[this.levelKey];
        gameState.levelKey=this.levelKey;
        const offSet= 650;
        //alert('creating');


        //let jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //jumpButton.onDown.add(jump, this);

        gameState.cursors = this.input.keyboard.createCursorKeys();

        const music = this.sound.add('mars');
        music.stop();
        music.play({
            seek:5
        });
        

        
        
        gameState.sky=this.add.image(0, 0, 'sky');
        gameState.bg2 = this.add.image(0,0,'bg2').setOrigin(0,0);
        gameState.bg3 = this.add.image(0, 0, 'bg3');
        

        gameState.sky.setOrigin(0, 0);
        gameState.bg2.setOrigin(0, 0);
        gameState.bg3.setOrigin(0, 0);

        this.elasped_time=this.add.text(650,25,'Time: '+gameState.min+':'+gameState.sec, {fontsize: '12px', fill: '#000'});
        this.jumpText = this.add.text(650, 50, 'Jumps Used: '+gameState.jumps, {fontsize: '12px', fill: '#000'});
        this.starCollected = this.add.text(650,75,'Captured: '+gameState.stars, {fontsize: '12px', fill: '#000'});
        

        // Parallax Backgrounds setup
    
        const game_width = parseFloat(gameState.bg3.getBounds().width)
        gameState.width = game_width;
        const window_width = config.width

        const sky_width = gameState.sky.getBounds().width
        const bg2_width = gameState.bg2.getBounds().width
        const bg3_width = gameState.bg3.getBounds().width
        //alert("bg1: "+bg1_width+" bg2: "+bg2_width+" bg3:"+bg3_width);


        //gameState.bgColor.setScrollFactor(0);
        gameState.sky.setScrollFactor((sky_width - window_width) / (game_width - window_width));
        gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));

        // set up timer tween for this level
        let startingTime = 0;
        let endTime =59;

        let updateTween = this.tweens.addCounter({
            from: startingTime,
            to: endTime,
            duration: 60100,        // each counter last for 10 secs
            ease: 'linear',
            repeat: -1,
            onRepeat: () =>
            {
                this.elasped_time.setText(`Time: ${gameState.min}:00`);
                gameState.min += 1;
            },
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                gameState.sec=value;
                this.elasped_time.setText(`Time: ${gameState.min}:${value}`)
            }
        });

        // create the lava out of a campfire
        gameState.lava = this.add.sprite(1100,580,'campfire2');
        gameState.lava.setScale(1500/gameState.lava.height,100/gameState.lava.width);
        
        this.platforms = this.physics.add.staticGroup();

        //alert('before weather')
        //this.setWeather(this.weather);
        this.levelSetup();

        //this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

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
        this.movingPlatformv2.setVelocityX(100);

        this.movingPlatformv3.setImmovable(true);
        this.movingPlatformv3.body.allowGravity = false;
        //this.movingPlatformv2.setVelocityX(50);

        this.player = this.physics.add.sprite(100, 450, 'dude');

        


        this.cameras.main.setBounds(0, 0, gameState.bg3.width, gameState.bg3.height);
        this.physics.world.setBounds(0, 0, gameState.width, gameState.bg3.height + this.player.height);

        this.cameras.main.startFollow(this.player, true, 0.5, 0.5)
        //this.cameras.main.x

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

        this.physics.add.image().setAngle()
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 15,
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
            this.time.delayedCall(1000, () => this.scene.start('Outro'));
        });
    }
        //alert('exiting create');
    levelSetup() {
            
        for (const [xIndex, yIndex] of this.heights.entries()) {
              this.createPlatform(xIndex, yIndex);
            } 
            this.setWeather(this.weather);
          }
    
    createPlatform(xIndex, yIndex) {
        // Creates a platform evenly spaced along the two indices.
        // If either is not a number it won't make a platform
        //alert('in platform create. xIndex:'+xIndex+' yIndex: '+yIndex)
          if (typeof yIndex === 'number' && typeof xIndex === 'number') {
            this.platforms.create((220 * xIndex),  yIndex * 70, 'ground').setOrigin(0, 0.5).refreshBody();
          }
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

        if (this.movingPlatformv2.x >= 1500)
        {
            this.movingPlatformv2.setVelocityX(-100);
        }
        else if (this.movingPlatformv2.x <= 50)
        {
            this.movingPlatformv2.setVelocityX(100);
        }
        
        if (this.player.body.x>400){
            this.elasped_time.x=this.player.body.x;
            this.jumpText.x=this.player.body.x;
            this.starCollected.x=this.player.body.x;
        }
        //this.elasped_time.x=this.player.body.x;

        // Check to see if player has fallen into the lava.
        // if so, restart level
        if (this.player.y > gameState.bg3.height) {
            this.cameras.main.shake(240, .01, false, function(camera, progress) {
              if (progress > .9) {
                //this.scene.restart(this.example);
                this.scene.stop(this.levelKey);
                //this.scene.start(this.nextLevel[this.levelKey]);
                this.scene.start('Outro');
              }
            });
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
        this.starCollected.setText('Captured: '+gameState.stars)
        gameState.stars +=1;
    }




setWeather(weather) {
    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'snow':  1,
        'wind':  20,
        'bgColor': 0xF8c3aC,
      },

      'afternoon': {
        'color': 0xffffff,
        'snow':  1,
        'wind': 80,
        'bgColor': 0x0571FF,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow':  10,
        'wind': 200,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow':  0,
        'wind': 0,
      },
    }
    let { color, bgColor, snow, wind } = weathers[weather];
    gameState.sky.setTint(color);
    //gameState.bg2.setTint(color);
    gameState.bg3.setTint(color);
    //gameState.bgColor.fillColor = bgColor;
    //gameState.emitter.setQuantity(snow);
    //gameState.emitter.setSpeedX(-wind);
    //gameState.player.setTint(color);
    
    for (let platform of this.platforms.getChildren()) {
      platform.setTint(color);
    }
    /*
    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }
    */

    return
  }
}



class Level1 extends Level {
    constructor() {
      super('Level1')
      this.heights = [8.2, 7, 5, null, 5, 3, null, 3, 3];
      this.weather = 'afternoon';
    }
  }
  
  class Level2 extends Level {
    constructor() {
        
      super('Level2')
      //alert('level 2 class, levelKey: '+this.levelKey+' nlk: '+this.nextLevel[this.levelKey])
      this.heights = [8, 4, null, 4, 6, 4, 6, 5, 5];
      this.weather = 'twilight';
    }
  }

  class Level3 extends Level {
    constructor() {
        //alert('L3 cl')
      super('Level3')
      this.heights = [8, null, 6, 4, 6, 4, 5, null, 4];
      this.weather = 'morning';
    }
  }

class Outro extends Phaser.Scene {
    constructor() {
       // alert('in Outro class')
        super('Outro')
    }
    preload(){
        
        this.load.path = './assets/';
        this.load.image('campfire','campfire.gif')
        //this.load.image('campfire2','campfire.png')
        this.load.spritesheet('campfire2','campfire.png',{ frameWidth: 32, frameHeight: 32});       
    }
    create() {
        gameState.campfire = this.add.sprite(500, 500, 'campfire2');
        gameState.campfire.setScale(300/gameState.campfire.height,150/gameState.campfire.width);
        this.add.text(100,50, gameState.levelKey+" Summary",{ fontFamily: 'Arial', size: 100, color: '#1940ff' }).setFontSize(90);

        this.add.text(310,175, 'Total time spent: '+gameState.min+':'+gameState.sec,{ fontFamily: 'Arial', size: 19, color: '#fff' });
        this.add.text(310,200, "Number of Jumps made: "+gameState.jumps, { fontFamily: 'Arial', size: 20, color: '#fff' });

        this.add.text(310,225, "Number of Stars Collector: "+gameState.stars, { fontFamily: 'Arial', size: 20, color: '#fff' });

        if(gameState.nextLevel == 'Level2')
        {
            this.add.text(300,375,"The next level will require some higher jumping", { fontFamily: 'Arial', size: 20, color: '#fff' });

        }
        else if(gameState.nextLevel == 'Level3')
        {
            this.add.text(300,375,"Be mindful of the gaps on this next level",{ fontFamily: 'Arial', size: 20, color: '#fff' });
        }
        else if(gameState.nextLevel == 'Level1')
        {
            this.add.text(300,375,"nice job on making it to the end!", { fontFamily: 'Arial', size: 20, color: '#fff' });
        }
        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('campfire2'),
            frameRate: 5,
            repeat: -1
        });

        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start(gameState.nextLevel));
        });
    }
    update(){
        gameState.campfire.anims.play('fire', true);

    }
}

const gameState = {
    speed: 240,
    ups: 380,
    jumps: 0,
    stars: 0,
    nextLevel: 'Level4'
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
            //debug: true
        }
    },
    scene: [Level1, Level2, Level3, Outro]
};

const game = new Phaser.Game(config);