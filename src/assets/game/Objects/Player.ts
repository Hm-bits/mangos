import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: any;
  private speed: number = 300;
  
  // Tambahan sistem HP
  public hp: number = 3; 
  public isInvulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_tex');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = scene.input.keyboard!.addKeys('W,A,S,D');
  }

  // Fungsi baru: Terkena damage
  takeDamage() {
    if (this.isInvulnerable) return;

    this.hp -= 1;
    this.isInvulnerable = true;
    
    // Efek visual: Kedap-kedip (Alpha berubah)
    this.setAlpha(0.5);

    // Kasih waktu kebal 1 detik
    this.scene.time.delayedCall(1000, () => {
      this.isInvulnerable = false;
      this.setAlpha(1);
    });
  }

  update() {
    this.setVelocity(0);
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) this.setVelocityX(-this.speed);
    else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) this.setVelocityX(this.speed);

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) this.setVelocityY(-this.speed);
    else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) this.setVelocityY(this.speed);
  }
}