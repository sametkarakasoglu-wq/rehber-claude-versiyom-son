
# 🚗 Araç Filo Yönetimi - Kullanım Kılavuzu

## 🚀 Uygulamayı Başlatma

### Yöntem 1: Basit Başlatma (Önerilen)
```bash
cd /home/ubuntu/filo_yonetim_app
python3 -m http.server 3000
```

Ardından tarayıcınızda açın: **http://localhost:3000**

### Yöntem 2: Başlatma Scripti İle
```bash
cd /home/ubuntu/filo_yonetim_app
chmod +x start-server.sh
./start-server.sh
```

### Yöntem 3: Arka Planda Çalıştırma
```bash
cd /home/ubuntu/filo_yonetim_app
nohup python3 -m http.server 3000 > server.log 2>&1 &
```

## ⚠️ ÖNEMLİ NOTLAR

### ❌ VITE KULLANMAYIN
Bu uygulama **vanilla HTML/CSS/JS** uygulamasıdır. Vite dev server kullanmayın çünkü CSS dosyalarını JavaScript modüllerine dönüştürür ve stiller yüklenmez.

**YANLIŞ:**
```bash
npm exec vite --host 0.0.0.0 --port 3000  # ❌ Stiller bozulur
```

**DOĞRU:**
```bash
python3 -m http.server 3000  # ✅ Doğru yöntem
```

### 🔧 Sorun Giderme

#### Stil Sorunları
Eğer stiller yüklenmiyorsa:

1. **Vite çalışıyor mu kontrol edin:**
```bash
ps aux | grep vite
pkill -f vite  # Vite'ı durdurun
```

2. **Service Worker cache'i temizleyin:**
   - Tarayıcınızda F12 ile geliştirici konsolunu açın
   - Application → Service Workers → Unregister
   - Application → Storage → Clear site data

3. **Sunucuyu yeniden başlatın:**
```bash
pkill -f "python3 -m http.server"
python3 -m http.server 3000
```

4. **Hard refresh yapın:**
   - Chrome/Firefox: Ctrl+Shift+R
   - Safari: Cmd+Shift+R

#### Port 3000 Kullanımda
```bash
# Kullanımda olan portu temizle
lsof -ti:3000 | xargs kill -9
# Sunucuyu yeniden başlat
python3 -m http.server 3000
```

## 📱 PWA Özellikleri

Uygulama bir **Progressive Web App** olduğu için:
- Masaüstüne yüklenebilir
- Offline çalışabilir
- Uygulama gibi davranır

### PWA Kurulumu
1. Uygulamayı tarayıcıda açın
2. Adres çubuğundaki "Yükle" butonuna tıklayın
3. Veya Ayarlar sayfasında "Uygulamayı Kur" butonunu kullanın

## 🔥 Firebase Entegrasyonu

Firebase kullanarak çoklu cihaz senkronizasyonu yapabilirsiniz:

1. **Ayarlar** sayfasına gidin
2. **Firebase Senkronizasyon** bölümünü bulun
3. Firebase yapılandırmanızı girin
4. "Bağlantıyı Test Et" ile kontrol edin
5. "Firebase'e Gönder" / "Firebase'den Al" butonlarıyla senkronize edin

## 📂 Proje Yapısı

```
filo_yonetim_app/
├── index.html          # Ana HTML dosyası
├── index.css           # Tüm stiller
├── index.js            # Uygulama mantığı
├── firebase-config.js  # Firebase yapılandırması
├── service-worker.js   # PWA service worker
├── manifest.json       # PWA manifest
├── start-server.sh     # Başlatma scripti
└── README-CALISMA.md   # Bu dosya
```

## 💾 Veri Saklama

- **LocalStorage:** Tarayıcı yerel depolama
- **Firebase:** Bulut senkronizasyonu (opsiyonel)
- **Service Worker Cache:** Offline kullanım

## 🆘 Yardım

Sorun yaşıyorsanız:
1. Bu dosyayı okuyun
2. Console'da hata mesajları kontrol edin (F12)
3. Sunucunun çalıştığından emin olun
4. Vite'ın çalışmadığından emin olun

---

**✅ İyi Kullanımlar!**
