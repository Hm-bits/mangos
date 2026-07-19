import React, { useState, useEffect } from "react";

// ==========================================
// INTERFACES / TYPES FOR TYPESCRIPT
// ==========================================
interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  xp: number;
  gold: number;
}

interface Weapon {
  name: string;
  atkBonus: number;
  cost: number;
}

interface Player {
  level: number;
  hp: number;
  maxHp: number;
  baseAtk: number;
  xp: number;
  nextXp: number;
  gold: number;
  potions: number;
  weapon: Weapon;
  distance: number;
}

// ==========================================
// DATA MUSUH & EQUIPMENT
// ==========================================
const ENEMIES: Enemy[] = [
  { name: "Slime Hijau", hp: 20, maxHp: 20, atk: 4, xp: 15, gold: 10 },
  { name: "Goblin Pemulung", hp: 35, maxHp: 35, atk: 7, xp: 30, gold: 25 },
  { name: "Orc Prajurit", hp: 55, maxHp: 55, atk: 12, xp: 60, gold: 50 },
  { name: "Golem Batu", hp: 90, maxHp: 90, atk: 16, xp: 120, gold: 90 },
  { name: "Naga Hitam (BOSS)", hp: 200, maxHp: 200, atk: 25, xp: 500, gold: 300 },
];

const WEAPONS: Weapon[] = [
  { name: "Pedang Berkarat", atkBonus: 0, cost: 0 },
  { name: "Pedang Baja", atkBonus: 5, cost: 40 },
  { name: "Kapak Penghancur", atkBonus: 12, cost: 100 },
  { name: "Pedang Excalibur", atkBonus: 25, cost: 250 },
];

export default function SimpleRPG() {
  // Untuk meredam error TS6133 'React' is declared but never read
  // (Sebenarnya bisa dihapus import React-nya di React modern, tapi kita keep biar aman)
  const _dummyReact = React.version; 

  // ==========================================
  // STATE UTAMA GAME
  // ==========================================
  const [gameState, setGameState] = useState<"START" | "EXPLORE" | "BATTLE" | "SHOP" | "GAME_OVER" | "WIN">("START");
  const [logs, setLogs] = useState<string[]>(["Selamat datang di Kerajaan Eldoria! Mulai petualanganmu."]);

  // State Pemain
  const [player, setPlayer] = useState<Player>({
    level: 1,
    hp: 50,
    maxHp: 50,
    baseAtk: 8,
    xp: 0,
    nextXp: 50,
    gold: 30,
    potions: 2,
    weapon: WEAPONS[0],
    distance: 0,
  });

  // State Musuh Saat Bertarung
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  // Rekor Tertinggi (Tersimpan di LocalStorage)
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    const savedScore = localStorage.getItem("rpg_high_score");
    if (savedScore) setHighScore(parseInt(savedScore, 10));
  }, []);

  // ==========================================
  // FUNGSI UTAS / HELPER
  // ==========================================
  const addLog = (message: string) => {
    setLogs((prevLogs) => [message, ...prevLogs.slice(0, 14)]);
  };

  const updateHighScore = (distance: number) => {
    if (distance > highScore) {
      setHighScore(distance);
      localStorage.setItem("rpg_high_score", distance.toString());
      addLog(`🎉 REKOR BARU! Kamu mencapai jarak ${distance} km!`);
    }
  };

  // ==========================================
  // AKSI GAME
  // ==========================================
  const startNewGame = () => {
    setPlayer({
      level: 1,
      hp: 50,
      maxHp: 50,
      baseAtk: 8,
      xp: 0,
      nextXp: 50,
      gold: 30,
      potions: 2,
      weapon: WEAPONS[0],
      distance: 0,
    });
    setLogs(["Petualangan baru dimulai. Semoga beruntung, Pahlawan!"]);
    setGameState("EXPLORE");
  };

  const explore = () => {
    const nextDistance = player.distance + 1;
    setPlayer((prev) => ({ ...prev, distance: nextDistance }));

    // Cek kemenangan akhir pada jarak 30km
    if (nextDistance >= 30) {
      // Spawn Boss Terakhir
      const boss = { ...ENEMIES[ENEMIES.length - 1] };
      setCurrentEnemy(boss);
      addLog(`🚨 Kamu tiba di Sarang Naga (30km)! Naga Hitam menghadang jalanmu!`);
      setGameState("BATTLE");
      return;
    }

    // Menentukan kejadian acak secara random
    const rand = Math.random();

    if (rand < 0.45) {
      // Ketemu Musuh biasa berdasarkan jarak tempuh
      let enemyIndex = 0;
      if (nextDistance > 20) enemyIndex = 3; // Golem
      else if (nextDistance > 12) enemyIndex = 2; // Orc
      else if (nextDistance > 5) enemyIndex = 1; // Goblin

      const enemy = { ...ENEMIES[enemyIndex] };
      // Sedikit randomisasi HP musuh agar variatif
      const hpVariance = Math.floor(Math.random() * 7) - 3;
      enemy.maxHp = Math.max(10, enemy.maxHp + hpVariance);
      enemy.hp = enemy.maxHp;

      setCurrentEnemy(enemy);
      addLog(`⚔️ Menempuh ${nextDistance} km: Kamu berpapasan dengan ${enemy.name}!`);
      setGameState("BATTLE");
    } else if (rand < 0.65) {
      // Ketemu Toko / Desa
      addLog(`🏪 Menempuh ${nextDistance} km: Kamu menemukan pos perdagangan rahasia.`);
      setGameState("SHOP");
    } else if (rand < 0.8) {
      // Menemukan Harta Karun Peti
      const foundGold = Math.floor(Math.random() * 20) + 10;
      setPlayer((prev) => ({ ...prev, gold: prev.gold + foundGold }));
      addLog(`💰 Menempuh ${nextDistance} km: Kamu menemukan peti tua berisi ${foundGold} Emas!`);
    } else {
      // Perjalanan Aman
      addLog(`🚶 Menempuh ${nextDistance} km: Jalur aman. Kamu berjalan menyusuri hutan.`);
    }
  };

  const usePotion = () => {
    if (player.potions <= 0) {
      addLog("❌ Kamu tidak punya Ramuan Penyembuh!");
      return;
    }
    if (player.hp === player.maxHp) {
      addLog("❤️ Darahmu sudah penuh!");
      return;
    }

    const healAmount = Math.floor(player.maxHp * 0.5); // Sembuh 50% max HP
    setPlayer((prev) => ({
      ...prev,
      potions: prev.potions - 1,
      hp: Math.min(prev.maxHp, prev.hp + healAmount),
    }));
    addLog(`🧪 Kamu meminum Ramuan Penyembuh dan memulihkan ${healAmount} HP.`);
  };

  // ==========================================
  // LOGIKA PERTARUNGAN (BATTLE)
  // ==========================================
  const attackEnemy = () => {
    if (!currentEnemy) return;

    // 1. Giliran Pemain Menyerang
    const playerDamage = player.baseAtk + player.weapon.atkBonus + Math.floor(Math.random() * 4);
    const updatedEnemyHp = Math.max(0, currentEnemy.hp - playerDamage);
    
    addLog(`⚔️ Kamu menyerang ${currentEnemy.name} sebesar ${playerDamage} kerusakan.`);

    if (updatedEnemyHp <= 0) {
      // Musuh Kalah
      const gainedXp = currentEnemy.xp;
      const gainedGold = currentEnemy.gold;
      addLog(`🎉 Kamu mengalahkan ${currentEnemy.name}! Mendapat ${gainedXp} XP dan ${gainedGold} Emas.`);

      // Hitung XP & Level Up
      let newXp = player.xp + gainedXp;
      let newLevel = player.level;
      let newNextXp = player.nextXp;
      let newMaxHp = player.maxHp;
      let newBaseAtk = player.baseAtk;

      if (newXp >= newNextXp) {
        newLevel += 1;
        newXp -= newNextXp;
        newNextXp = Math.floor(newNextXp * 1.5);
        newMaxHp += 15;
        newBaseAtk += 3;
        addLog(`✨ LEVEL UP! Kamu sekarang Level ${newLevel}! HP dan Seranganmu meningkat.`);
      }

      setPlayer((prev) => ({
        ...prev,
        xp: newXp,
        level: newLevel,
        nextXp: newNextXp,
        maxHp: newMaxHp,
        hp: Math.min(newMaxHp, prev.hp + Math.floor(newMaxHp * 0.2)), // Pulih 20% HP setelah menang
        baseAtk: newBaseAtk,
        gold: prev.gold + gainedGold,
      }));

      // Cek apakah yang dikalahkan adalah Final Boss
      if (currentEnemy.name.includes("BOSS")) {
        updateHighScore(player.distance);
        setGameState("WIN");
      } else {
        setGameState("EXPLORE");
      }
      setCurrentEnemy(null);
      return;
    }

    // 2. Giliran Musuh Menyerang (Jika musuh masih hidup)
    const enemyDamage = Math.max(1, currentEnemy.atk + Math.floor(Math.random() * 3) - 1);
    const updatedPlayerHp = Math.max(0, player.hp - enemyDamage);

    addLog(`💥 ${currentEnemy.name} membalas dan memberikan ${enemyDamage} kerusakan padamu.`);

    if (updatedPlayerHp <= 0) {
      // Pemain Kalah
      addLog(`💀 Kamu gugur di medan perang pada jarak ${player.distance} km.`);
      updateHighScore(player.distance);
      setGameState("GAME_OVER");
    }

    // Perbarui state nyawa pasca turn selesai
    setCurrentEnemy((prev) => prev ? { ...prev, hp: updatedEnemyHp } : null);
    setPlayer((prev) => ({ ...prev, hp: updatedPlayerHp }));
  };

  const fleeBattle = () => {
    if (!currentEnemy) return;

    if (currentEnemy.name.includes("BOSS")) {
      addLog("❌ Kamu tidak bisa lari dari pertarungan Boss Terakhir!");
      return;
    }

    if (Math.random() < 0.5) {
      addLog("🏃 Kamu berhasil melarikan diri kembali ke jalur penjelajahan!");
      setCurrentEnemy(null);
      setGameState("EXPLORE");
    } else {
      addLog("❌ Gagal kabur! Musuh menutup jalan pelarianmu.");
      // Musuh langsung menyerang gratis
      const enemyDamage = currentEnemy.atk;
      const updatedPlayerHp = Math.max(0, player.hp - enemyDamage);
      
      setPlayer((prev) => ({ ...prev, hp: updatedPlayerHp }));
      addLog(`💥 ${currentEnemy.name} menyerangmu saat kamu mencoba kabur sebesar ${enemyDamage} damage.`);
      
      if (updatedPlayerHp <= 0) {
        updateHighScore(player.distance);
        setGameState("GAME_OVER");
      }
    }
  };

  // ==========================================
  // LOGIKA TOKO (SHOP)
  // ==========================================
  const buyPotion = () => {
    if (player.gold >= 15) {
      setPlayer((prev) => ({ ...prev, gold: prev.gold - 15, potions: prev.potions + 1 }));
      addLog("🛒 Membeli 1 Ramuan Penyembuh seharga 15 Emas.");
    } else {
      addLog("❌ Emas tidak cukup untuk membeli Ramuan!");
    }
  };

  const buyWeapon = (weapon: Weapon) => {
    if (player.gold >= weapon.cost) {
      setPlayer((prev) => ({ ...prev, gold: prev.gold - weapon.cost, weapon: weapon }));
      addLog(`🛒 Kamu membeli dan memperlengkapi ${weapon.name}!`);
    } else {
      addLog(`❌ Emas tidak cukup untuk membeli ${weapon.name}!`);
    }
  };

  // ==========================================
  // RENDER TAMPILAN (UI)
  // ==========================================
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛡️ Eldoria Text RPG ⚔️</h1>
      <p style={styles.subtitle}>Jelajahi hutan sejauh 30 km dan kalahkan Naga Hitam!</p>
      <div style={styles.highScore}>🏆 Rekor Terjauh: {highScore} km</div>

      {/* PANEL STATISTIK KARAKTER */}
      <div style={styles.statsPanel}>
        <div><strong>Pahlawan (Lv.{player.level})</strong></div>
        <div>❤️ HP: {player.hp} / {player.maxHp}</div>
        <div>⚔️ Total Serangan: {player.baseAtk + player.weapon.atkBonus} <span style={{fontSize: '11px', color: '#aaa'}}>({player.baseAtk} + {player.weapon.atkBonus} {player.weapon.name})</span></div>
        <div>✨ XP: {player.xp} / {player.nextXp}</div>
        <div>💰 Emas: {player.gold}</div>
        <div>🧪 Ramuan: {player.potions}</div>
        <div>📍 Jarak: {player.distance} / 30 km</div>
      </div>

      {/* AREA INTERAKSI UTAMA */}
      <div style={styles.screenArea}>
        {gameState === "START" && (
          <div style={styles.centerContent}>
            <h3>Siap memulai petualanganmu?</h3>
            <button style={styles.btnPrimary} onClick={startNewGame}>Mulai Petualangan</button>
          </div>
        )}

        {gameState === "EXPLORE" && (
          <div style={styles.centerContent}>
            <h3>Jalur Terbuka Lebar</h3>
            <p>Kamu aman berada di jalan setapak hutan. Apa tindakanmu selanjutnya?</p>
            <div style={styles.btnGroup}>
              <button style={styles.btnSuccess} onClick={explore}>Maju Lebih Dalam (+1 km)</button>
              <button style={styles.btnInfo} onClick={usePotion}>Gunakan Ramuan (+50% HP)</button>
            </div>
          </div>
        )}

        {gameState === "BATTLE" && currentEnemy && (
          <div style={styles.battleContent}>
            <h3 style={{ color: "#ff4d4d" }}>⚠️ PERTEMPURAN TERJADI! ⚠️</h3>
            <div style={styles.enemyCard}>
              <h4>👾 {currentEnemy.name}</h4>
              <p>❤️ HP Musuh: {currentEnemy.hp} / {currentEnemy.maxHp}</p>
              <p>⚔️ Bahaya Serangan: ~{currentEnemy.atk}</p>
            </div>
            <div style={styles.btnGroup}>
              <button style={styles.btnDanger} onClick={attackEnemy}>Serang!</button>
              <button style={styles.btnInfo} onClick={usePotion}>Gunakan Ramuan</button>
              <button style={styles.btnSecondary} onClick={fleeBattle}>Kabur (Peluang 50%)</button>
            </div>
          </div>
        )}

        {gameState === "SHOP" && (
          <div style={styles.shopContent}>
            <h3 style={{ color: "#ffd700" }}>🏪 Toko Keliling Rahasia</h3>
            <p>Silakan tukar emasmu dengan peralatan terbaik.</p>
            <div style={styles.shopGrid}>
              <div style={styles.shopItem}>
                <span>🧪 Ramuan Penyembuh (15 Emas)</span>
                <button style={styles.btnAction} onClick={buyPotion}>Beli</button>
              </div>
              {WEAPONS.slice(1).map((w, index) => (
                <div key={index} style={styles.shopItem}>
                  <span>⚔️ {w.name} (+{w.atkBonus} Atk) - {w.cost} Emas</span>
                  <button 
                    style={styles.btnAction} 
                    disabled={player.weapon.name === w.name}
                    onClick={() => buyWeapon(w)}
                  >
                    {player.weapon.name === w.name ? "Dipakai" : "Beli"}
                  </button>
                </div>
              ))}
            </div>
            <button style={{ ...styles.btnSecondary, marginTop: "15px" }} onClick={() => setGameState("EXPLORE")}>
              Kembali Menjelajah
            </button>
          </div>
        )}

        {gameState === "GAME_OVER" && (
          <div style={styles.centerContent}>
            <h2 style={{ color: "#ff4d4d" }}>☠️ GAME OVER ☠️</h2>
            <p>Kamu gugur dalam pertempuran. Perjalananmu terhenti di {player.distance} km.</p>
            <button style={styles.btnPrimary} onClick={startNewGame}>Coba Lagi</button>
          </div>
        )}

        {gameState === "WIN" && (
          <div style={styles.centerContent}>
            <h2 style={{ color: "#ffd700" }}>🎉 KEMENANGAN BESAR! 🎉</h2>
            <p>Luar biasa! Kamu berhasil mengalahkan Naga Hitam pada jarak 30 km dan menyelamatkan Eldoria!</p>
            <button style={styles.btnPrimary} onClick={startNewGame}>Main Lagi</button>
          </div>
        )}
      </div>

      {/* LOG GAME (KOTAK TEXT AKTIVITAS) */}
      <div style={styles.logContainer}>
        <h4>📜 Catatan Petualangan (Aktivitas Terbaru):</h4>
        <div style={styles.logBox}>
          {logs.map((log, index) => (
            <div key={index} style={{ ...styles.logText, opacity: index === 0 ? 1 : 0.6 }}>
              {log}
            </div>
          ))}
        </div>
      </div>
      {/* Trick kecil untuk meredam variabel dummy */}
      <span style={{ display: 'none' }}>{_dummyReact}</span>
    </div>
  );
}

// ==========================================
// STYLING DENGAN VALIDASI TYPE CSS PROPERTIES
// ==========================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#1e1e24",
    color: "#fff",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  },
  title: { textAlign: "center", marginBottom: "5px", color: "#ffd700" },
  subtitle: { textAlign: "center", color: "#aaa", fontSize: "14px", marginTop: 0 },
  highScore: { textAlign: "center", fontWeight: "bold", color: "#4da6ff", marginBottom: "15px" },
  statsPanel: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    backgroundColor: "#2a2a35",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #444",
  },
  screenArea: {
    minHeight: "220px",
    backgroundColor: "#25252b",
    border: "2px solid #555",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  centerContent: { textAlign: "center", width: "100%" },
  battleContent: { textAlign: "center", width: "100%" },
  enemyCard: {
    backgroundColor: "#3a2222",
    border: "1px solid #ff4d4d",
    padding: "10px",
    borderRadius: "8px",
    margin: "15px auto",
    maxWidth: "300px",
  },
  shopContent: { width: "100%", textAlign: "center" },
  shopGrid: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" },
  shopItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2d2d38",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
  },
  btnGroup: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "15px" },
  btnPrimary: { backgroundColor: "#ffd700", color: "#000", border: "none", padding: "10px 20px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" },
  btnSuccess: { backgroundColor: "#2e7d32", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" },
  btnDanger: { backgroundColor: "#c62828", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" },
  btnInfo: { backgroundColor: "#0277bd", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" },
  btnSecondary: { backgroundColor: "#616161", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" },
  btnAction: { backgroundColor: "#e0e0e0", color: "#000", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" },
  logContainer: { marginTop: "15px" },
  logBox: {
    backgroundColor: "#121214",
    padding: "12px",
    borderRadius: "6px",
    height: "140px",
    overflowY: "auto",
    border: "1px solid #333",
  },
  logText: { fontSize: "12.5px", marginBottom: "6px", borderBottom: "1px solid #1a1a1c", paddingBottom: "4px", color: "#dcdcdc" }
};