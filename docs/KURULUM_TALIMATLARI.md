# 📱 Araç Filo Yönetimi - Kurulum Talimatları

## 🌐 Web Adresi
**URL:** https://rehber-filo.web.app

---

## 📱 MOBİL CIHAZLARA KURULUM

### 🍎 iPhone / iPad (iOS)

1. **Safari** tarayıcısında web adresini aç: `https://rehber-filo.web.app`
2. Alttaki **Paylaş** butonuna bas (⬆️ ikonu)
3. Aşağı kaydır ve **"Ana Ekrana Ekle"** seçeneğini bul
4. **"Ekle"** butonuna bas
5. ✅ **Uygulama ana ekranda!** Artık uygulama gibi çalışacak

**Özellikler:**
- ✅ Offline çalışma
- ✅ Tam ekran mod (Safari bar'ı yok)
- ✅ Bildirimler (izin verilirse)
- ✅ Ana ekrandan hızlı erişim

---

### 🤖 Android Telefonlar

#### **Chrome Tarayıcı:**
1. **Chrome**'da aç: `https://rehber-filo.web.app`
2. Sağ üstteki **3 nokta** menüye tıkla
3. **"Ana Ekrana Ekle"** veya **"Uygulama Yükle"** seçeneğine bas
4. **"Yükle"** butonuna bas
5. ✅ **Uygulama ana ekranda ve app drawer'da!**

#### **Samsung Internet:**
1. Samsung Internet'te aç: `https://rehber-filo.web.app`
2. Alttaki **menü** butonuna bas
3. **"Sayfa Ekle"** → **"Ana Ekran"**
4. **"Ekle"** butonuna bas
5. ✅ **Ana ekranda uygulama ikonu oluştu!**

**Özellikler:**
- ✅ Offline çalışma
- ✅ Tam ekran uygulama modu
- ✅ Bildirimler
- ✅ Hızlı açılış

---

## 💻 MASAÜSTÜ BİLGİSAYARLARA KURULUM

### 🪟 Windows (Chrome / Edge)

1. **Chrome** veya **Edge** tarayıcısında aç: `https://rehber-filo.web.app`
2. Adres çubuğunun **sağındaki ikon**a tıkla (⊕ veya bilgisayar ikonu)
3. **"Yükle"** butonuna bas
4. ✅ **Masaüstünde ve Başlat menüsünde kısayol oluştu!**

**Alternatif Yöntem:**
1. Chrome → Sağ üst **3 nokta** menü
2. **"Uygulamaları Yükle"** veya **"Araç Filo Yönetimi'ni yükle"**
3. **"Yükle"** butonuna bas

**Özellikler:**
- ✅ Tam uygulama penceresi (tarayıcı bar'ı yok)
- ✅ Masaüstü kısayolu
- ✅ Başlat menüsünde görünür
- ✅ Offline çalışma
- ✅ Alt+Tab ile uygulama değiştirme

---

### 🍎 macOS (Chrome / Safari)

#### **Chrome:**
1. Chrome'da aç: `https://rehber-filo.web.app`
2. Adres çubuğundaki **yükle ikonuna** tıkla
3. **"Yükle"** butonuna bas
4. ✅ **Applications klasöründe ve Launchpad'de!**

#### **Safari:**
1. Safari'de aç: `https://rehber-filo.web.app`
2. **Dosya** menüsü → **"Dock'a Ekle"**
3. ✅ **Dock'ta uygulama ikonu oluştu!**

**Özellikler:**
- ✅ Native uygulama gibi çalışır
- ✅ Dock'tan hızlı erişim
- ✅ Offline destek

---

## 🔄 KURULUMDAN SONRA

### ✅ İlk Açılış
1. Uygulamayı aç (ana ekran veya masaüstünden)
2. **Ayarlar** → **Firebase Senkronizasyon**
3. **"Varsayılan Ayarları Yükle"** butonuna bas
4. **"Otomatik Senkronizasyon"** ✓ aktif et
5. ✅ **Hazır!** Artık tüm cihazlarında senkronize çalışacak

### 📂 Veri Yedekleme
- Veriler **otomatik** LocalStorage'da saklanır
- Firebase aktifse **otomatik** yedeklenir
- **"Firebase'e Gönder"** ile manuel yedek alabilirsin

### 🔄 Güncelleme
- Uygulama **otomatik** güncellenir
- Yeni versiyon çıktığında sayfa yenilenince güncellenir
- Service Worker cache'i otomatik temizlenir

---

## 🆘 SORUN GİDERME

### ❓ "Yükle" butonu görünmüyor
- **HTTPS** bağlantı kontrol et (HTTP değil)
- Tarayıcı güncel mi kontrol et
- Farklı tarayıcı dene (Chrome/Edge önerilir)

### ❓ Offline çalışmıyor
- En az 1 kez internete bağlıyken uygulamayı aç
- Service Worker aktif olana kadar bekle
- Tarayıcı cache'ini temizle ve tekrar aç

### ❓ Firebase senkronizasyonu çalışmıyor
- Ayarlar → Firebase → "Varsayılan Ayarları Yükle"
- "Bağlantıyı Test Et" butonuna bas
- İnternet bağlantısını kontrol et

### ❓ Uygulama donuyor/yavaş
- Tarayıcı cache'ini temizle
- LocalStorage'ı temizle: `localStorage.clear()` (Console'da)
- Uygulamayı kaldır ve yeniden kur

---

## 🎯 ÖNERİLEN KULLANIM

### 📱 Mobil Cihazlar
- ✅ Ana ekrana kur
- ✅ Offline modu aktif
- ✅ Firebase otomatik sync
- ✅ Bildirimler aktif

### 💻 Masaüstü
- ✅ Masaüstüne veya Dock'a kur
- ✅ Tam ekran mod
- ✅ Firebase senkronizasyon
- ✅ Keyboard shortcuts

### 🌐 Çoklu Cihaz
1. **Ana cihaz:** Firebase'e veri yükle
2. **Diğer cihazlar:** Firebase'den çek
3. **Otomatik sync** aktif olsun
4. ✅ Tüm cihazlar senkronize!

---

## 📞 DESTEK

**Web Adresi:** https://rehber-filo.web.app
**Firebase Console:** https://console.firebase.google.com/project/rehber-filo

---

## ✨ ÖZELLİKLER

- 🚗 Araç yönetimi (sigorta, muayene, ruhsat takibi)
- 👤 Müşteri yönetimi (ehliyet, kimlik saklama)
- 💰 Kiralama ve rezervasyon sistemi
- 🔧 Bakım planlama ve takibi
- 📁 Doküman yönetimi (PDF/resim saklama)
- 📊 Gelir-gider raporları (PDF çıktı)
- 🔔 Otomatik hatırlatmalar
- 🌙 Karanlık mod
- 📱 PWA - Offline çalışma
- ☁️ Firebase senkronizasyon
- 🌍 Çoklu cihaz desteği

---

**Güncel Versiyon:** v2.3 (15 Ekim 2025)
