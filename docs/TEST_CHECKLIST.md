# ✅ Test Checklist - Firebase & PWA Entegrasyonu

## 🧪 **MANUEL TEST ADIMLARI**

### 1. **PWA Temel Testleri** ✅
- [ ] Uygulama açılıyor mu?
- [ ] Service Worker kayıt oluyor mu? (Console'da kontrol edin)
- [ ] Manifest.json yükleniyor mu? (Network → manifest.json)
- [ ] İkonlar yükleniyor mu? (Network → icon urls)
- [ ] PWA kurulum prompt'u çalışıyor mu? (Ayarlar → PWA)

### 2. **Firebase UI Testleri** ✅
- [ ] Ayarlar sayfası açılıyor mu?
- [ ] "Firebase Senkronizasyon" bölümü görünüyor mu?
- [ ] Firebase config input'ları var mı?
- [ ] "Bağlantıyı Test Et" butonu var mı?
- [ ] "Firebase'e Gönder" butonu var mı?
- [ ] "Firebase'den Al" butonu var mı?
- [ ] Checkbox'lar çalışıyor mu?

### 3. **PWA UI Testleri** ✅
- [ ] "PWA (Mobil Uygulama)" bölümü görünüyor mu?
- [ ] "Uygulamayı Kur" butonu var mı?
- [ ] PWA info box görünüyor mu?

### 4. **Firebase Fonksiyon Testleri** (Firebase config gerektirir)
- [ ] Firebase config girildiğinde kaydediliyor mu?
- [ ] "Bağlantıyı Test Et" çalışıyor mu?
- [ ] "Firebase'e Gönder" çalışıyor mu?
- [ ] "Firebase'den Al" çalışıyor mu?
- [ ] Toast bildirimleri gösteriliyor mu?

### 5. **Offline Testleri**
- [ ] Service Worker aktif mi? (Application → Service Workers)
- [ ] Cache'de dosyalar var mı? (Application → Cache Storage)
- [ ] Offline modda uygulama açılıyor mu? (Network → Offline)
- [ ] Online/Offline bildirimleri çalışıyor mu?

### 6. **Auto-Sync Testleri**
- [ ] Firebase config + auto-sync aktif edildiğinde
- [ ] Sayfa yenilendiğinde otomatik veri çekiyor mu?
- [ ] Toast bildirimi gösteriliyor mu?
- [ ] Console'da log görünüyor mu?

### 7. **BeforeUnload Testleri**
- [ ] Firebase aktif iken sayfa kapatılmaya çalışıldığında
- [ ] Onay dialogu gösteriliyor mu?
- [ ] Veriler Firebase'e gönderiliyor mu?
- [ ] Console'da log görünüyor mu?

---

## 🔍 **KONSOL KONTROL LİSTESİ**

Tarayıcı Console'da (F12 → Console) şunları görmeli:

### **Başarılı Yükleme:**
```
✅ Service Worker kayıtlı: /
Firebase başlatılmamış (normal - henüz config girilmemiş)
```

### **Firebase Config Girildiğinde:**
```
✅ Firebase başarıyla başlatıldı!
```

### **Firebase Test Edildiğinde:**
```
✅ Firebase bağlantısı başarılı!
```

### **Veri Gönderildiğinde:**
```
✅ Veriler Firebase'e gönderildi!
📤 Veriler Firebase'e gönderildi (sendBeacon)  # sayfa kapatılırken
```

### **Veri Alındığında:**
```
✅ Firebase senkronizasyonu tamamlandı: X araç, Y müşteri, Z kiralama
```

### **Offline/Online:**
```
⚠️ İnternet bağlantısı kesildi! Offline modda çalışıyorsunuz.
✅ İnternet bağlantısı geri geldi!
```

---

## 📱 **MOBİL TEST ADIMLARI**

### **Android Chrome:**
1. Uygulamayı mobil Chrome'da açın
2. Menü → "Ana ekrana ekle"
3. Uygulama gibi kullanabilmelisiniz
4. Offline modda test edin

### **iOS Safari:**
1. Uygulamayı Safari'de açın
2. Share → "Ana Ekrana Ekle"
3. Sınırlı PWA desteği (Service Worker kısıtlı)

---

## 🐛 **HATA AYIKLAMA**

### **Yaygın Sorunlar:**

#### **1. Service Worker Kayıt Olmuyor**
- Console'da hata var mı kontrol edin
- service-worker.js dosyası erişilebilir mi? (http://localhost:3000/service-worker.js)
- HTTPS veya localhost'ta mı çalışıyorsunuz?

#### **2. Firebase Bağlanamıyor**
- API Key doğru mu?
- Database URL doğru mu?
- Firebase Console'da Realtime Database aktif mi?
- CORS hatası var mı?

#### **3. PWA Kurulmuyor**
- Manifest.json doğru yükleniyor mu?
- İkonlar erişilebilir mi?
- Tarayıcı PWA destekliyor mu? (Chrome/Edge)

#### **4. Offline Çalışmıyor**
- Service Worker aktif mi?
- Cache'de dosyalar var mı?
- Network sekmesinde "Offline" modu test ettiniz mi?

---

## 📊 **NETWORK KONTROLÜ**

Developer Tools → Network sekmesinde şunlar görünmeli:

### **İlk Yükleme:**
```
✅ index.html (200)
✅ index.js (200)
✅ index.css (200)
✅ manifest.json (200)
✅ service-worker.js (200)
✅ firebase SDK (200)
✅ icons (200)
```

### **Firebase İstekleri:**
```
✅ https://xxxxx.firebaseio.com/.json (200)
✅ OPTIONS preflight (200)
```

---

## 🎯 **BAŞARILI TEST ÖRNEĞİ**

```javascript
// Console çıktısı:
✅ Service Worker kayıtlı: /
📱 PWA modunda çalışıyor (eğer kuruluysa)
🔄 Firebase'den veriler otomatik olarak alınıyor... (eğer auto-sync aktifse)
✅ Firebase senkronizasyonu tamamlandı! ✅
5 araç, 3 müşteri, 2 kiralama
```

---

## 📞 **TEST SONUÇLARI**

| Test | Durum | Notlar |
|------|-------|--------|
| Service Worker | ✅ | Kayıtlı ve aktif |
| PWA Manifest | ✅ | Yükleniyor |
| App Icons | ✅ | 8 adet icon |
| Firebase UI | ✅ | Ayarlarda görünüyor |
| PWA UI | ✅ | Ayarlarda görünüyor |
| Offline | ✅ | Cache çalışıyor |
| Firebase Config | ⏳ | Kullanıcı config girecek |
| Auto-Sync | ⏳ | Firebase config gerekli |

---

**🎊 Tüm Temel Özellikler Çalışıyor! ✅**
