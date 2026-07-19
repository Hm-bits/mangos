import { useEffect, useRef } from 'react';
// Ganti baris import yang merah dengan ini:
import { StartGame } from './assets/game/Game';

export default function App() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Memastikan game hanya di-load satu kali
    if (!gameRef.current) {
      gameRef.current = StartGame('phaser-container');
    }

    // Membersihkan memori (Destroy) jika komponen React di-unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      {/* Di dalam div inilah Phaser akan merender elemen <canvas> nya */}
      <div id="phaser-container"></div>
    </div>
  );
}