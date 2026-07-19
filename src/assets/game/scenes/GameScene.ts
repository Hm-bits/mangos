import Phaser from 'phaser';
import Player from '../Objects/Player';
import Enemy from '../Objects/Enemy';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.Physics.Arcade.Group;
  private timerText!: Phaser.GameObjects.Text;
  private survivalTime: number = 0;
  private isBuffed: boolean = false;

  constructor() { super('GameScene'); }

  create() {
    this.bullets = this.physics.add.group();
    this.player = new Player(this, 400, 300);
    
    // Spawn musuh awal
    new Enemy(this, 100, 100, this.bullets);
    
    // UI Timer
    this.timerText = this.add.text(10, 10, 'Survival: 0s', { fontSize: '24px', color: '#ffffff' });

    // Timer setiap 1 detik
    this.time.addEvent({ delay: 1000, callback: () => {
      this.survivalTime++;
      this.timerText.setText('Survival: ' + this.survivalTime + 's');
      
      // WIN CONDITION: Survive 30 detik
      if (this.survivalTime === 30 && !this.isBuffed) {
        this.isBuffed = true;
        this.add.text(200, 300, 'BUFF AKTIF: TRIPLE SHOT!', { fontSize: '32px', color: '#ffff00' });
      }

      // DIFFICUTLY: Tambah musuh setiap 10 detik
      if (this.survivalTime % 10 === 0) {
        new Enemy(this, Math.random()*800, Math.random()*600, this.bullets);
      }
    }, loop: true });

    this.physics.add.overlap(this.player, this.bullets, (p, b) => {
      (p as Player).takeDamage();
      (b as Phaser.Physics.Arcade.Sprite).destroy();
      if ((p as Player).hp <= 0) this.scene.restart();
    });
  }

  update() {
    this.player.update();
    
    // LOGIKA BUFF (Jika sudah 30 detik, pemain menembak otomatis/bisa upgrade)
    // Sederhananya: kita kasih kecepatan gerak lebih kalau buff aktif
    if (this.isBuffed) (this.player as any).speed = 500; 
  }
}