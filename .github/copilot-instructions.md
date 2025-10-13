# Araç Filo Yönetimi - AI Kodlama Ajanı Talimatları# Araç Filo Yönetimi - AI Kodlama Ajanı Talimatları



## 📋 Proje Genel Bakışı## 📋 Proje Genel Bakışı

Bu, **TypeScript/Vanilla JS** ile yazılmış bir **PWA (Progressive Web App)** araç kiralama ve filo yönetim sistemidir. Uygulama offline çalışır, Firebase ile senkronize olabilir ve masaüstü/mobil cihazlara kurulabilir.Bu, **TypeScript/Vanilla JS** ile yazılmış bir **PWA (Progressive Web App)** araç kiralama ve filo yönetim sistemidir. Uygulama offline çalışır, Firebase ile senkronize olabilir ve masaüstü/mobil cihazlara kurulabilir.



## 🏗️ Yeni Dosya Yapısı (v2.0)## 🏗️ Mimari ve Önemli Yapılar



### Profesyonel Klasör Organizasyonu### Dosya Yapısı

```- **`index.tsx`**: Ana uygulama kodu (3300+ satır) - tüm state yönetimi, UI, event handlers

filo_yonetim_app/- **`index.js`**: Transpile edilmiş JavaScript versiyonu

├── src/                          # Tüm kaynak kodlar- **`index.html`**: PWA manifest ve CDN bağımlılıkları

│   ├── index.tsx                 # Ana uygulama kodu (4797 satır)- **`firebase-config.js`**: Firebase entegrasyonu ve sync fonksiyonları  

│   ├── index.js                  # Transpile edilmiş JavaScript- **`service-worker.js`**: PWA cache stratejisi ve offline çalışma

│   ├── assets/                   # Statik dosyalar- **`vite.config.js`**: Vite build konfigürasyonu

│   │   └── styles/

│   │       └── index.css         # Ana stil dosyası (3159 satır)### State Yönetimi Deseni

│   └── config/                   # Konfigürasyon dosyaları```typescript

│       └── firebase-config.js    # Firebase entegrasyonu (570 satır)// Global state object - tüm UI durumu burada

├── public/                       # Public assets (build'e kopyalanır)let state = {

│   ├── firebase-config.js        # Firebase config kopyası (Vite için)    activePage: 'dashboard',

│   └── firebase-messaging-sw.js  # Service Worker    isVehicleModalOpen: false,

├── electron/                     # Electron desktop app    // ... diğer modal durumları

│   └── main.cjs                  # Electron main process    editingVehicleIndex: null,

├── docs/                         # Tüm dökümanlar    selectedVehicleForAction: null,

│   ├── CHANGELOG.md    theme: 'light',

│   ├── FIREBASE_PWA_GUIDE.md    settings: { /* uygulama ayarları */ }

│   ├── FIXES_SUMMARY.md};

│   ├── IMPLEMENTATION_SUMMARY.md

│   ├── IMPROVEMENTS_SUMMARY.md// State güncellemesi MUTLAKA bu fonksiyon ile yapılır

│   ├── QUICK_START.mdfunction setState(newState) {

│   ├── README-CALISMA.md    state = { ...state, ...newState };

│   ├── README-KURULUM.md    saveDataToLocalStorage(); // ÖNCE kaydet

│   └── TEST_CHECKLIST.md    renderApp(); // SONRA render et

├── dist/                         # Build output (ignored in git)}

├── release-final/                # Electron builds```

├── index.html                    # PWA ana HTML

├── manifest.json                 # PWA manifest### Veri Modelleri

├── service-worker.js             # PWA service workerUygulama 6 ana veri tipini yönetir (tümü global arrays):

├── vite.config.js                # Vite build config- **`vehiclesData`**: Araç bilgileri, dosya URL'leri, kiralama durumu

├── package.json                  # Dependencies & scripts- **`customersData`**: Müşteri bilgileri, ehliyet/kimlik dosyaları  

└── tsconfig.json                 # TypeScript config- **`rentalsData`**: Aktif kiralamalar, fiyat hesaplamaları

```- **`reservationsData`**: Gelecek rezervasyonlar

- **`maintenanceData`**: Bakım kayıtları ve programları

## 🔧 Kritik Path Referansları- **`activitiesData`**: Sistem etkinlik logları (Date objeleri)



### HTML Script Imports### Kritik Event Listener Deseni

```html```typescript

<!-- Ana stil dosyası -->// Event listener'lar her render sonrası yeniden bağlanır

<link rel="stylesheet" href="src/assets/styles/index.css">function attachEventListeners() {

    // Modal açma deseni

<!-- Firebase config (public'ten serve edilir) -->    document.querySelectorAll('.btn-rent').forEach(btn => {

<script src="firebase-config.js"></script>        const vehicleIndex = parseInt(btn.closest('.vehicle-card').dataset.vehicleIndex);

        btn.addEventListener('click', () => openModal('rental', vehicleIndex));

<!-- Ana uygulama -->    });

<script type="module" src="/src/index.js"></script>}

``````



### Package.json## 🔧 Geliştirme Komutları

```json

{### Build ve Çalıştırma

  "main": "electron/main.cjs",    // Electron entry point```bash

  "build": {yarn dev          # Geliştirme sunucusu (port 3000)

    "files": [yarn build        # Üretim build'i

      "dist/**/*",yarn preview      # Build'i önizleme

      "electron/main.cjs",          // Electron main process```

      "!dist/**/*.map"

    ]### TypeScript Transpilation

  }Uygulama `index.tsx` → `index.js` şeklinde transpile edilir. **Her TypeScript değişikliğinden sonra build gereklidir.**

}

```## 🎯 Kritik Kod Desenleri



### Electron Path Resolution### Modal Yönetimi

```javascript```typescript

// electron/main.cjs içinde// Modal açma - mutlaka openModal() fonksiyonu ile

// Paketlenmiş modda dist path'iopenModal('rental', vehicleIndex); // vehicleIndex opsiyonel

const filePath = path.join(__dirname, '..', 'dist', 'index.html');

```// Modal kapama - closeModal() ile

closeModal(); // Tüm modalları kapatır

## 📦 State Yönetimi Deseni```



### Global State Object### Veri Kaydetme/Yükleme

```typescript```typescript

let state = {// LocalStorage kaydetme (otomatik)

    activePage: 'dashboard',saveDataToLocalStorage(); // JSON serialize

    isVehicleModalOpen: false,

    editingVehicleIndex: null,// Uygulama başlangıcında yükleme

    selectedVehicleForAction: null,loadDataFromLocalStorage(); // Date objeleri deserialize

    theme: 'light',```

    settings: { /* uygulama ayarları */ }

};### Activity Logging

```typescript

// State güncellemesi MUTLAKA bu fonksiyon ile yapılırlogActivity('fa-solid fa-car', 'Yeni araç eklendi: 34 ABC 123');

function setState(newState) {// Otomatik timestamp ve icon ile log

    state = { ...state, ...newState };```

    saveDataToLocalStorage(); // ÖNCE kaydet

    renderApp(); // SONRA render et## 🔄 Firebase Entegrasyonu

}

```### Konfigürasyon

Firebase ayarları `state.settings.firebaseConfig` içinde saklanır. Test bağlantısı:

### Veri Modelleri```javascript

Uygulama 6 ana veri tipini yönetir (tümü global arrays):testFirebaseConnection() // Promise<boolean>

- **`vehiclesData`**: Araç bilgileri, dosya URL'leri, kiralama durumu```

- **`customersData`**: Müşteri bilgileri, ehliyet/kimlik dosyaları  

- **`rentalsData`**: Aktif kiralamalar, fiyat hesaplamaları### Veri Senkronizasyonu  

- **`reservationsData`**: Gelecek rezervasyonlar```javascript

- **`maintenanceData`**: Bakım kayıtları ve programlarısendDataToFirebase()    // Tüm veriyi Firebase'e gönder

- **`activitiesData`**: Sistem etkinlik logları (Date objeleri)loadDataFromFirebase()  // Firebase'den veri çek ve merge et

```

## 🔧 Geliştirme Komutları

## 📱 PWA Özellikleri

### Build ve Çalıştırma

```bash### Service Worker

npm run dev          # Geliştirme sunucusu (port 4000)Cache stratejisi: **Cache First** + **Network Fallback**

npm run build        # Üretim build'i- Statik dosyalar aggressive cache

npm run preview      # Build'i önizleme (port 3000)- API çağrıları network-first

```

### Install Prompt

### Electron Desktop```javascript

```bash// PWA kurulum butonu - settings sayfasında

npm run electron:start   # Electron dev modebeforeinstallprompt event handling

npm run electron:build   # Electron EXE oluştur```

```

## ⚠️ Önemli Kurallar

### Firebase Deploy

```bash### State Güncellemeleri

npm run deploy      # Web'e deploy (rehber-filo.web.app)- **ASLA** state'i doğrudan değiştirme: `state.activePage = 'x'` ❌

```- **MUTLAKA** `setState()` kullan: `setState({activePage: 'x'})` ✅



## 🎯 Kritik Kod Desenleri### Date Objeleri

- `activitiesData` Date objesi içerir - JSON serialize/deserialize dikkat

### Modal Yönetimi- Kiralamalar için `startDate`/`endDate` string olarak saklanır

```typescript

// Modal açma - mutlaka openModal() fonksiyonu ile### Form Handling

openModal('rental', vehicleIndex); // vehicleIndex opsiyonel```typescript

// Form submit pattern

// Modal kapama - closeModal() ilefunction handleVehicleFormSubmit(e: Event) {

closeModal(); // Tüm modalları kapatır    e.preventDefault();

```    const form = e.target as HTMLFormElement;

    const formData = new FormData(form);

### Veri Kaydetme/Yükleme    // FormData ile veri çekme

```typescript    const plateValue = formData.get('plate') as string;

// LocalStorage kaydetme (otomatik)}

saveDataToLocalStorage(); // JSON serialize```



// Uygulama başlangıcında yükleme### File Upload Deseni

loadDataFromLocalStorage(); // Date objeleri deserializeDosyalar Base64 string olarak `vehiclesData[].insuranceFileUrl` gibi alanlarda saklanır.

```

## 🧪 Test ve Debug

### Activity Logging

```typescript### Console Logging

logActivity('fa-solid fa-car', 'Yeni araç eklendi: 34 ABC 123');Hata durumlarında detaylı console.error mesajları:

// Otomatik timestamp ve icon ile log```javascript

```console.error("!!! HATA: handleVehicleFormSubmit içinde:", error);

```

## 🔄 Firebase Entegrasyonu

### LocalStorage İnceleme

### Konfigürasyon```javascript

Firebase ayarları `state.settings.firebaseConfig` içinde saklanır. Config dosyası:// Browser dev tools'da

- Kaynak: `src/config/firebase-config.js`JSON.parse(localStorage.getItem('rehberOtomotivData'))

- Public kopya: `public/firebase-config.js` (Vite build için)```



### Veri Senkronizasyonu  ## 📦 Bağımlılıklar

```javascript

sendDataToFirebase()    // Tüm veriyi Firebase'e gönder### CDN Kütüphaneleri (index.html)

loadDataFromFirebase()  // Firebase'den veri çek ve merge et- Firebase v9 (compat mode)

```- jsPDF (PDF oluşturma)

- Toastify.js (bildirimler)

## 📱 PWA Özellikleri- Font Awesome (ikonlar)



### Service Worker### NPM Dependencies

Cache stratejisi: **Cache First** + **Network Fallback**- Vite (build tool)

- Statik dosyalar aggressive cache- TypeScript (tip kontrolü)

- API çağrıları network-first- Firebase SDK (realtime database)



### Install Prompt## 🎨 UI Conventions

```javascript

// PWA kurulum butonu - settings sayfasında### CSS Class Naming

beforeinstallprompt event handling- `.vehicle-card[data-vehicle-index]` - araç kartları

```- `.btn-rent`, `.btn-checkin` - aksiyon butonları

- Modal ID pattern: `#vehicle-modal`, `#rental-modal`

## ⚠️ Önemli Kurallar

### Toast Notifications

### State Güncellemeleri```javascript

- **ASLA** state'i doğrudan değiştirme: `state.activePage = 'x'` ❌showToast('Mesaj', 'success'|'error'|'info');

- **MUTLAKA** `setState()` kullan: `setState({activePage: 'x'})` ✅```



### Date ObjeleriBu talimatlar kodu değiştirirken **mevcut desenleri korumanı** ve **state yönetimi kurallarına uymanı** sağlar.
- `activitiesData` Date objesi içerir - JSON serialize/deserialize dikkat
- Kiralamalar için `startDate`/`endDate` string olarak saklanır

### File Upload Deseni
Dosyalar Base64 string olarak `vehiclesData[].insuranceFileUrl` gibi alanlarda saklanır.

## 🧪 Test ve Debug

### Console Logging
Hata durumlarında detaylı console.error mesajları:
```javascript
console.error("!!! HATA: handleVehicleFormSubmit içinde:", error);
```

### LocalStorage İnceleme
```javascript
// Browser dev tools'da
JSON.parse(localStorage.getItem('rehberOtomotivData'))
```

## 📦 Bağımlılıklar

### CDN Kütüphaneleri (index.html)
- Firebase v9 (compat mode)
- jsPDF (PDF oluşturma)
- Toastify.js (bildirimler)
- Font Awesome (ikonlar)

### NPM Dependencies
- Vite (build tool)
- TypeScript (tip kontrolü)
- Firebase SDK (realtime database)
- Electron (desktop app)

## 🎨 UI Conventions

### CSS Class Naming
- `.vehicle-card[data-vehicle-index]` - araç kartları
- `.btn-rent`, `.btn-checkin` - aksiyon butonları
- Modal ID pattern: `#vehicle-modal`, `#rental-modal`

### Toast Notifications
```javascript
showToast('Mesaj', 'success'|'error'|'info');
```

## 📝 Dosya Organizasyonu Prensipleri

1. **Kaynak kodlar** → `src/` altında
2. **Public assets** → `public/` altında (build'e kopyalanır)
3. **Dökümanlar** → `docs/` altında
4. **Electron kodu** → `electron/` altında
5. **Config dosyaları** → Root'ta (package.json, vite.config.js, etc.)

Bu talimatlar kodu değiştirirken **mevcut desenleri korumanı** ve **state yönetimi kurallarına uymanı** sağlar.
