import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bullet_tex');
    
    // PENTING: Tambahkan ini supaya peluru masuk ke scene dan terlihat
    scene.add.existing(this);
    
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    
    // Set ukuran hitbox lebih kecil dari visual
    this.body!.setCircle(6); 
    this.setScale(1.5); // Perbesar visual peluru 1.5x
  }

  fire(x: number, y: number, angle: number, speed: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.scene.physics.velocityFromRotation(angle, speed, this.body!.velocity as Phaser.Math.Vector2);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // Hapus jika keluar layar
    if (this.y < -50 || this.y > 650 || this.x < -50 || this.x > 850) {
      this.setActive(false);
      this.setVisible(false);
      this.destroy();
    }
  }
}