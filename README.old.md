# 🚗 Araç Filo Yönetimi v2.0# Araç Filo Yönetimi



Modern, profesyonel bir **PWA (Progressive Web App)** filo yönetim sistemi. Firebase ile senkronizasyon, Electron masaüstü uygulaması ve mobil kurulum desteği ile tam özellikli araç kiralama çözümü.Basit, hızlı ve çevrimdışı çalışan bir araç takip ve kiralama yönetim sistemi.



## ✨ Özellikler## Teknik Yapı



- 📱 **Cross-Platform**: Web, Desktop (Windows/Mac/Linux), Mobile (iOS/Android)*   **Kaynak Kod:** TypeScript (`.tsx`)

- 🔥 **Firebase Entegrasyonu**: Realtime Database + Cloud Messaging*   **Arayüz:** HTML5 / CSS3 (Vanilla JS ile render ediliyor)

- 📊 **Kapsamlı Yönetim**: Araçlar, Müşteriler, Kiralamalar, Rezervasyonlar, Bakım*   **Çalıştırma:** `live-server` ve `tsc` (TypeScript Compiler)

- 📄 **PDF Raporlama**: Sözleşme ve rapor oluşturma
- 🌙 **Dark/Light Tema**: Kullanıcı tercihi ile tema değiştirme
- 💾 **Offline Çalışma**: LocalStorage + Service Worker
- 🔔 **Push Notifications**: Web/Mobil bildirimler (FCM)

## 🏗️ Dosya Yapısı

```
filo_yonetim_app/
├── src/                    # 📦 Kaynak kodlar
│   ├── index.tsx          # Ana uygulama (4797 satır)
│   ├── index.js           # Transpile edilmiş JS
│   ├── assets/styles/     # CSS dosyaları (3159 satır)
│   └── config/            # Firebase config
├── public/                # 🌐 Public assets
├── electron/              # 🖥️ Electron desktop app
├── docs/                  # 📚 Dökümanlar
├── dist/                  # 📦 Build output
└── release-final/         # 🚀 Electron releases
```

## 🚀 Hızlı Başlangıç

### Geliştirme Modu
```bash
npm install          # Bağımlılıkları yükle
npm run dev          # Dev server (http://localhost:4000)
```

### Production Build
```bash
npm run build        # Web build
npm run preview      # Build önizleme
```

### Electron Desktop
```bash
npm run electron:start   # Electron dev
npm run electron:build   # EXE oluştur (release-final/)
```

### Firebase Deploy
```bash
npm run deploy      # https://rehber-filo.web.app
```

## 📦 Teknolojiler

### Frontend
- **TypeScript** - Tip güvenli geliştirme
- **Vite** - Modern build tool (ES2015)
- **Vanilla JS** - Framework-free, hızlı render

### Backend & Database
- **Firebase Realtime Database** - Canlı veri senkronizasyonu
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Hosting** - Web deployment

### Desktop & Mobile
- **Electron** - Cross-platform desktop (Windows/Mac/Linux)
- **PWA** - Kurulabilir web app (iOS/Android)
- **Service Worker** - Offline çalışma

### UI & Styling
- **CSS3** - Modern responsive design
- **Font Awesome** - İkon seti
- **Google Fonts (Poppins)** - Tipografi

### Utilities
- **jsPDF** - PDF oluşturma
- **Toastify.js** - Bildirimler
- **LocalStorage** - Offline veri saklama

## 📱 Platform Desteği

### Web
- ✅ Chrome/Edge (önerilen)
- ✅ Firefox
- ✅ Safari
- 🌐 https://rehber-filo.web.app

### Desktop
- ✅ Windows 10/11 (EXE)
- ✅ macOS (DMG)
- ✅ Linux (AppImage)

### Mobile
- ✅ iOS Safari (PWA kurulumu)
- ✅ Android Chrome (PWA kurulumu)

## 🔧 Konfigürasyon

### Firebase Setup
`src/config/firebase-config.js` dosyasını düzenleyin:
```javascript
const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebasedatabase.app",
  // ...
};
```

### Electron Build
`package.json` içinde build ayarları:
```json
{
  "build": {
    "appId": "com.samet.filoyonetimapp",
    "productName": "Filo Yonetim App",
    "directories": {
      "output": "release-final"
    }
  }
}
```

## 📚 Dökümanlar

Detaylı dokümantasyon `docs/` klasöründe:
- [QUICK_START.md](docs/QUICK_START.md) - Hızlı başlangıç rehberi
- [README-KURULUM.md](docs/README-KURULUM.md) - Kurulum adımları
- [README-CALISMA.md](docs/README-CALISMA.md) - Çalışma mantığı
- [FIREBASE_PWA_GUIDE.md](docs/FIREBASE_PWA_GUIDE.md) - Firebase kurulumu
- [TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md) - Test kontrol listesi
- [CHANGELOG.md](docs/CHANGELOG.md) - Versiyon geçmişi

## 🎯 AI Kodlama Talimatları

Geliştiriciler ve AI ajanları için: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- State yönetimi desenleri
- Kod kuralları ve konvensiyonlar
- Kritik path referansları
- Firebase entegrasyonu
- Build ve deploy prosedürleri

## 🧪 Test

### Manuel Test
1. `npm run dev` ile dev server başlat
2. Tarayıcıda http://localhost:4000 aç
3. Console'da hata kontrolü (F12)
4. Tüm CRUD işlemlerini test et

### Production Test
1. `npm run build` ile build al
2. `npm run preview` ile önizle
3. PWA kurulum butonunu test et
4. Offline modu test et

### Electron Test
1. `npm run electron:start` ile test et
2. `npm run electron:build` ile EXE oluştur
3. `release-final/` klasöründen EXE'yi çalıştır

## 🐛 Bilinen Sorunlar

- ✅ ~~Date/getTime hatası~~ - Çözüldü (v2.0)
- ✅ ~~Logo 404 hatası~~ - Çözüldü (v2.0)
- ✅ ~~Dosya yapısı karışık~~ - Düzeltildi (v2.0)

## 🤝 Katkı

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişiklikleri commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📄 Lisans

Bu proje özel bir projedir. Kullanım hakları saklıdır.

## 👨‍💻 Geliştirici

**Samet (moata)** - Filo Yönetim Uygulaması

---

**v2.0** - Profesyonel dosya yapısı, Firebase entegrasyonu, çoklu platform desteği ✨
