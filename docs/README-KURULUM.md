# 🚀 Filo Yönetim Uygulaması - Kurulum Rehberi

## ✅ Yapılan Düzeltmeler

### 1. **package.json Güncellendi**
Eksik olan `scripts` bölümü eklendi:

```json
{
  "scripts": {
    "dev": "vite",                          // Development server başlatır
    "build": "vite build",                  // Production build oluşturur
    "preview": "vite preview",              // Build'i önizler
    "start": "vite preview --port 3000",    // Production server başlatır
    "serve": "vite preview"                 // Alternatif preview komutu
  }
}
```

### 2. **vite.config.js Oluşturuldu**
Vite yapılandırma dosyası eklendi:
- Port: 3000 (varsayılan)
- Host: Tüm network arayüzlerinde erişilebilir
- Build çıktısı: `dist/` klasörü

### 3. **Bağımlılıklar Yüklendi**
`npm install` komutu çalıştırılarak tüm gerekli paketler kuruldu.

---

## 📦 Kurulum Adımları

### 1. Dosyaları İndirin
`filo_yonetim_app_duzeltilmis.zip` dosyasını indirin ve çıkartın.

### 2. Proje Klasörüne Gidin
```bash
cd filo_yonetim_app
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Development Server'ı Başlatın
```bash
npm run dev
```

Uygulama şu adreste çalışacak: **http://localhost:3000**

---

## 🎯 Kullanılabilir Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Development server başlatır (hot reload ile) |
| `npm run build` | Production için optimize edilmiş build oluşturur |
| `npm run preview` | Build'i önizlemek için server başlatır |
| `npm start` | Production server başlatır (port 3000) |

---

## 🔧 Sorun Giderme

### Port Zaten Kullanımda
Eğer 3000 portu kullanımdaysa, Vite otomatik olarak başka bir port seçecektir (örn: 3001).

### "vite: not found" Hatası
```bash
npm install
```
komutunu tekrar çalıştırın.

### Firebase Bağlantı Sorunu
`firebase-config.js` dosyasındaki Firebase yapılandırmasını kontrol edin.

---

## 📱 PWA Özellikleri

Uygulama Progressive Web App (PWA) olarak çalışır:
- ✅ Offline çalışma desteği
- ✅ Mobil cihazlara kurulabilir
- ✅ Service Worker ile cache yönetimi
- ✅ Manifest.json ile uygulama meta verileri

---

## 🎨 Proje Yapısı

```
filo_yonetim_app/
├── index.html              # Ana HTML dosyası
├── index.js                # Ana JavaScript dosyası
├── index.css               # Ana stil dosyası
├── firebase-config.js      # Firebase yapılandırması
├── service-worker.js       # PWA service worker
├── manifest.json           # PWA manifest
├── vite.config.js          # Vite yapılandırması
├── package.json            # Proje bağımlılıkları ve scriptler
└── node_modules/           # Yüklü paketler
```

---

## 🚀 Production Build

Production için build oluşturmak:

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulur.

Build'i test etmek:

```bash
npm run preview
```

---

## 💡 Notlar

1. **Node.js Versiyonu**: Node.js 18+ gereklidir
2. **Tarayıcı Desteği**: Modern tarayıcılar (Chrome, Firefox, Safari, Edge)
3. **Firebase**: Uygulamanın çalışması için Firebase yapılandırması gereklidir

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `npm install` komutunu tekrar çalıştırın
2. `node_modules` klasörünü silin ve tekrar yükleyin
3. Tarayıcı cache'ini temizleyin

---

**Başarılar! 🎉**
