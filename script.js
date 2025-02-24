// Script sederhana game PVZ versi Canvas

// 1. Variabel Global
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// State game
const GAME_STATE = {
  WELCOME: 'WELCOME',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

let currentState = GAME_STATE.WELCOME;

// Ukuran canvas
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Variabel game
let score = 0;
let suns = 50;
let timer = 0;
let lastTimestamp = 0;   // untuk delta time
let isPaused = false;

// Objek zombie (contoh sederhana)
let zombies = [];

// Objek tanaman (contoh sangat minimal)
let plants = [];

// 2. Fungsi Helper untuk menggambar teks di tengah
function drawCenteredText(text, x, y, color = '#fff', font = '30px Arial') {
  ctx.fillStyle = color;
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;
  ctx.fillText(text, x - textWidth / 2, y);
}

// 3. Fungsi Inisialisasi Game
function initGame() {
  // Reset variabel
  score = 0;
  suns = 50;
  timer = 0;
  zombies = [];
  plants = [];
}

// 4. Fungsi Update (dipanggil tiap frame)
function update(delta) {
  if (currentState === GAME_STATE.PLAYING) {
    timer += delta; // menambah waktu permainan (dalam detik)

    // Update zombie (gerak ke kiri)
    zombies.forEach(z => {
      // z.x mewakili posisi horizontal
      // z.speed mewakili kecepatan gerak (px per detik)
      z.x -= z.speed * delta;

      // Jika zombie keluar layar di sisi kiri → game over
      if (z.x + z.width < 0) {
        currentState = GAME_STATE.GAME_OVER;
      }
    });

    // Hapus zombie yang “mati” (health <= 0)
    zombies = zombies.filter(z => z.health > 0);
  }
}

// 5. Fungsi Draw (dipanggil tiap frame)
function draw() {
  // Bersihkan canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Gambar berdasarkan state
  if (currentState === GAME_STATE.WELCOME) {
    // Layar Welcome
    drawCenteredText('Selamat Datang di Indonesia PVZ (Canvas)', WIDTH / 2, HEIGHT / 2 - 50);
    drawCenteredText('Klik untuk Mulai / Tekan Enter', WIDTH / 2, HEIGHT / 2);
  } else if (currentState === GAME_STATE.PLAYING) {
    // Gambar background hijau/biru/abu dsb. (opsional)
    // ctx.fillStyle = '#335';
    // ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Tampilkan info (suns, score, timer)
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Suns: ${suns}`, 20, 30);
    ctx.fillText(`Score: ${score}`, 20, 60);
    ctx.fillText(`Time: ${Math.floor(timer)}s`, 20, 90);

    // Gambar tanaman (sangat sederhana)
    plants.forEach(plant => {
      ctx.fillStyle = 'green';
      ctx.fillRect(plant.x, plant.y, plant.width, plant.height);
    });

    // Gambar zombie
    zombies.forEach(z => {
      ctx.fillStyle = 'red';
      ctx.fillRect(z.x, z.y, z.width, z.height);
    });
  } else if (currentState === GAME_STATE.PAUSED) {
    // Tampilkan game paused
    drawCenteredText('Game Paused', WIDTH / 2, HEIGHT / 2);
  } else if (currentState === GAME_STATE.GAME_OVER) {
    drawCenteredText('GAME OVER!', WIDTH / 2, HEIGHT / 2 - 30);
    drawCenteredText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2);
    drawCenteredText('Klik atau Tekan Enter untuk Restart', WIDTH / 2, HEIGHT / 2 + 40);
  }
}

// 6. Fungsi Game Loop dengan requestAnimationFrame
function gameLoop(timestamp) {
  const delta = (timestamp - lastTimestamp) / 1000; // konversi ms ke detik
  lastTimestamp = timestamp;

  if (!isPaused && currentState === GAME_STATE.PLAYING) {
    update(delta);
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// 7. Event Listener
// Klik canvas: bisa untuk start game / restart / menanam tanaman / dll.
canvas.addEventListener('click', () => {
  if (currentState === GAME_STATE.WELCOME) {
    // Mulai game
    currentState = GAME_STATE.PLAYING;
    initGame();
    spawnZombie(); // contoh spawn awal
  } else if (currentState === GAME_STATE.GAME_OVER) {
    // Restart game
    currentState = GAME_STATE.WELCOME;
  } else if (currentState === GAME_STATE.PLAYING) {
    // Contoh: jika ingin menanam tanaman di posisi klik
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Biaya tanaman contoh 50 suns
    if (suns >= 50) {
      suns -= 50;
      // Buat objek tanaman
      plants.push({
        x: mouseX - 20,
        y: mouseY - 20,
        width: 40,
        height: 40,
        health: 100
      });
    }
  }
});

// Keyboard: tekan Enter untuk start / restart
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (currentState === GAME_STATE.WELCOME) {
      currentState = GAME_STATE.PLAYING;
      initGame();
      spawnZombie();
    } else if (currentState === GAME_STATE.GAME_OVER) {
      currentState = GAME_STATE.WELCOME;
    }
  }
  // Tekan Escape untuk pause/resume
  if (e.key === 'Escape' && currentState === GAME_STATE.PLAYING) {
    currentState = GAME_STATE.PAUSED;
    isPaused = true;
  } else if (e.key === 'Escape' && currentState === GAME_STATE.PAUSED) {
    currentState = GAME_STATE.PLAYING;
    isPaused = false;
  }
});

// 8. Fungsi contoh spawn zombie
function spawnZombie() {
  // Misalnya setiap 3 detik spawn zombie baru
  setInterval(() => {
    if (currentState === GAME_STATE.PLAYING) {
      // Random baris
      const randomY = Math.random() * (HEIGHT - 50);
      zombies.push({
        x: WIDTH - 50,    // muncul di sisi kanan
        y: randomY,
        width: 50,
        height: 50,
        health: 100,
        speed: 50        // px per detik
      });
    }
  }, 3000);
}

// Mulai requestAnimationFrame
requestAnimationFrame(gameLoop);
