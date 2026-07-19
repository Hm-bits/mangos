import Phaser from 'phaser';
import Bullet from './Bullet';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  private bulletGroup: Phaser.Physics.Arcade.Group;
  private angleOffset: number = 0; // Untuk pola spiral

  constructor(scene: Phaser.Scene, x: number, y: number, bulletGroup: Phaser.Physics.Arcade.Group) {
    super(scene, x, y, 'enemy_tex');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.bulletGroup = bulletGroup;
    this.setCollideWorldBounds(true);
    this.setBounce(1);
    this.setVelocity(150, 150);

    // Nembak tiap 0.8 detik (lebih cepat)
    scene.time.addEvent({ delay: 800, callback: this.shootPattern, callbackScope: this, loop: true });
  }

  shootPattern() {
    const isHardMode = Math.random() > 0.5; // Random pola

    if (isHardMode) {
      // POLA SPIRAL: Peluru berputar
      this.angleOffset += 0.5;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + this.angleOffset;
        const bullet = new Bullet(this.scene);
        this.bulletGroup.add(bullet);
        bullet.fire(this.x, this.y, angle, 250);
      }
    } else {
      // POLA TARGETED: Langsung nembak ke posisi pemain
      const player = (this.scene as any).player;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const bullet = new Bullet(this.scene);
      this.bulletGroup.add(bullet);
      bullet.fire(this.x, this.y, angle, 300);
    }
  }
}