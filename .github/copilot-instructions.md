# Araç Filo Yönetimi - AI Kodlama Ajanı Talimatları

## 📋 Proje Genel Bakışı
Bu, **TypeScript/Vanilla JS** ile yazılmış bir **PWA (Progressive Web App)** araç kiralama ve filo yönetim sistemidir. Uygulama offline çalışır, Firebase ile senkronize olabilir ve masaüstü/mobil cihazlara kurulabilir.

## 🏗️ Mimari ve Önemli Yapılar

### Dosya Yapısı
- **`index.tsx`**: Ana uygulama kodu (3300+ satır) - tüm state yönetimi, UI, event handlers
- **`index.js`**: Transpile edilmiş JavaScript versiyonu
- **`index.html`**: PWA manifest ve CDN bağımlılıkları
- **`firebase-config.js`**: Firebase entegrasyonu ve sync fonksiyonları  
- **`service-worker.js`**: PWA cache stratejisi ve offline çalışma
- **`vite.config.js`**: Vite build konfigürasyonu

### State Yönetimi Deseni
```typescript
// Global state object - tüm UI durumu burada
let state = {
    activePage: 'dashboard',
    isVehicleModalOpen: false,
    // ... diğer modal durumları
    editingVehicleIndex: null,
    selectedVehicleForAction: null,
    theme: 'light',
    settings: { /* uygulama ayarları */ }
};

// State güncellemesi MUTLAKA bu fonksiyon ile yapılır
function setState(newState) {
    state = { ...state, ...newState };
    saveDataToLocalStorage(); // ÖNCE kaydet
    renderApp(); // SONRA render et
}
```

### Veri Modelleri
Uygulama 6 ana veri tipini yönetir (tümü global arrays):
- **`vehiclesData`**: Araç bilgileri, dosya URL'leri, kiralama durumu
- **`customersData`**: Müşteri bilgileri, ehliyet/kimlik dosyaları  
- **`rentalsData`**: Aktif kiralamalar, fiyat hesaplamaları
- **`reservationsData`**: Gelecek rezervasyonlar
- **`maintenanceData`**: Bakım kayıtları ve programları
- **`activitiesData`**: Sistem etkinlik logları (Date objeleri)

### Kritik Event Listener Deseni
```typescript
// Event listener'lar her render sonrası yeniden bağlanır
function attachEventListeners() {
    // Modal açma deseni
    document.querySelectorAll('.btn-rent').forEach(btn => {
        const vehicleIndex = parseInt(btn.closest('.vehicle-card').dataset.vehicleIndex);
        btn.addEventListener('click', () => openModal('rental', vehicleIndex));
    });
}
```

## 🔧 Geliştirme Komutları

### Build ve Çalıştırma
```bash
yarn dev          # Geliştirme sunucusu (port 3000)
yarn build        # Üretim build'i
yarn preview      # Build'i önizleme
```

### TypeScript Transpilation
Uygulama `index.tsx` → `index.js` şeklinde transpile edilir. **Her TypeScript değişikliğinden sonra build gereklidir.**

## 🎯 Kritik Kod Desenleri

### Modal Yönetimi
```typescript
// Modal açma - mutlaka openModal() fonksiyonu ile
openModal('rental', vehicleIndex); // vehicleIndex opsiyonel

// Modal kapama - closeModal() ile
closeModal(); // Tüm modalları kapatır
```

### Veri Kaydetme/Yükleme
```typescript
// LocalStorage kaydetme (otomatik)
saveDataToLocalStorage(); // JSON serialize

// Uygulama başlangıcında yükleme
loadDataFromLocalStorage(); // Date objeleri deserialize
```

### Activity Logging
```typescript
logActivity('fa-solid fa-car', 'Yeni araç eklendi: 34 ABC 123');
// Otomatik timestamp ve icon ile log
```

## 🔄 Firebase Entegrasyonu

### Konfigürasyon
Firebase ayarları `state.settings.firebaseConfig` içinde saklanır. Test bağlantısı:
```javascript
testFirebaseConnection() // Promise<boolean>
```

### Veri Senkronizasyonu  
```javascript
sendDataToFirebase()    // Tüm veriyi Firebase'e gönder
loadDataFromFirebase()  // Firebase'den veri çek ve merge et
```

## 📱 PWA Özellikleri

### Service Worker
Cache stratejisi: **Cache First** + **Network Fallback**
- Statik dosyalar aggressive cache
- API çağrıları network-first

### Install Prompt
```javascript
// PWA kurulum butonu - settings sayfasında
beforeinstallprompt event handling
```

## ⚠️ Önemli Kurallar

### State Güncellemeleri
- **ASLA** state'i doğrudan değiştirme: `state.activePage = 'x'` ❌
- **MUTLAKA** `setState()` kullan: `setState({activePage: 'x'})` ✅

### Date Objeleri
- `activitiesData` Date objesi içerir - JSON serialize/deserialize dikkat
- Kiralamalar için `startDate`/`endDate` string olarak saklanır

### Form Handling
```typescript
// Form submit pattern
function handleVehicleFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    // FormData ile veri çekme
    const plateValue = formData.get('plate') as string;
}
```

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

## 🎨 UI Conventions

### CSS Class Naming
- `.vehicle-card[data-vehicle-index]` - araç kartları
- `.btn-rent`, `.btn-checkin` - aksiyon butonları
- Modal ID pattern: `#vehicle-modal`, `#rental-modal`

### Toast Notifications
```javascript
showToast('Mesaj', 'success'|'error'|'info');
```

Bu talimatlar kodu değiştirirken **mevcut desenleri korumanı** ve **state yönetimi kurallarına uymanı** sağlar.