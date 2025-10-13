const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');

// --- Loglama Kurulumu ---
// Logların yazılacağı dosyanın yolunu ve formatını ayarla
// Kullanıcı verileri klasöründe logs/main.log olarak kaydedilecek
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log');
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.level = 'info'; // Kaydedilecek en düşük log seviyesi

// Yakalanamayan tüm hataları log dosyasına yaz
log.catchErrors();

// Konsol loglarını da electron-log'a yönlendir
Object.assign(console, log.functions);

console.log('================================================');
console.log('Uygulama Başlatılıyor...');
console.log(`Electron Sürümü: ${process.versions.electron}`);
console.log(`Node Sürümü: ${process.versions.node}`);
console.log(`Platform: ${process.platform}`);
console.log('================================================');


function createWindow () {
  console.log('createWindow fonksiyonu çalıştırıldı.');

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Firebase CDN için gerekli
      allowRunningInsecureContent: true
    }
  });
  console.log('BrowserWindow oluşturuldu.');

  // Geliştirme ve paketlenmiş uygulama için doğru yolu yükle
  // app.isPackaged Electron'un kendi property'si - daha güvenilir
  const isDev = !app.isPackaged && process.env.ELECTRON_START_URL;

  if (isDev) {
    console.log('--- UYGULAMA GELİŞTİRME MODUNDA ÇALIŞIYOR ---');
    const devUrl = process.env.ELECTRON_START_URL;
    console.log('Yüklenecek geliştirme URL:', devUrl);
    win.loadURL(devUrl);
  } else {
    console.log('--- UYGULAMA PAKETLİ MODDA ÇALIŞIYOR ---');
    // __dirname = electron/main.cjs'in bulunduğu yer, bir üst dizine çıkıp dist'e gitmek gerekiyor
    const filePath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Yüklenecek dosya yolu:', filePath);
    console.log('__dirname:', __dirname);
    console.log('Dosya var mı kontrolü:', require('fs').existsSync(filePath));
    win.loadFile(filePath)
      .then(() => {
        console.log('✅ loadFile başarıyla tamamlandı.');
      })
      .catch(err => {
        console.error('❌ loadFile HATASI:', err);
      });
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Sayfa yüklenemedi (did-fail-load olayı)!');
    console.error(`Hata Kodu: ${errorCode}`);
    console.error(`Açıklama: ${errorDescription}`);
    console.error(`URL: ${validatedURL}`);
  });

  win.webContents.on('crashed', (event, killed) => {
    console.error(`ARAYÜZ ÇÖKTÜ! (crashed olayı). Killed: ${killed}`);
  });

  // Console mesajlarını yakala
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER ${level}] ${message} (${sourceId}:${line})`);
  });

  // Geliştirici araçlarını aç
  win.webContents.openDevTools();
  console.log('Geliştirici araçları açıldı.');
}

app.on('ready', () => {
  console.log('Uygulama "ready" durumunda. Log dosyası yolu:', log.transports.file.getFile().path);
  createWindow();
});


app.on('window-all-closed', () => {
  console.log('Tüm pencereler kapatıldı.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log('Uygulama "activate" edildi, yeni pencere oluşturuluyor.');
    createWindow();
  }
});