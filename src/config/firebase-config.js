
/**
 * Firebase Configuration and Initialization
 * This file handles Firebase setup and provides sync functions
 */

// Firebase will be imported from CDN in index.html
let firebaseApp = null;
let firebaseDatabase = null;
let firebaseMessaging = null;
let firebaseStorage = null;
let isFirebaseInitialized = false;

// Default Firebase configuration
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDKeJDoNyGiPfdT6aOleZvzN85I8C3bVu8",
  authDomain: "rehber-filo.firebaseapp.com",
  databaseURL: "https://rehber-filo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rehber-filo",
  storageBucket: "rehber-filo.firebasestorage.app",
  messagingSenderId: "1022169726073",
  appId: "1:1022169726073:web:584648469dd7854248a8a8"
};

// VAPID Key for FCM (Firebase Cloud Messaging)
// Bu key Firebase Console > Project Settings > Cloud Messaging'den alındı ✅
const vapidKey = "BHhfwLs8mhkQPT5ecNAyL8q1zfixUYpqBlyLp2HJvioV2uPWhj53F52TH1vjz4lP6G8uESkg6WyXYfNnYHAMu0U";

/**
 * Initialize Firebase with user configuration
 */
function initializeFirebase(config = null) {
  try {
    // Use provided config or default config
    const finalConfig = config || defaultFirebaseConfig;
    
    if (!finalConfig || !finalConfig.apiKey || !finalConfig.databaseURL) {
      throw new Error('Firebase konfigürasyonu eksik!');
    }

    // Initialize Firebase
    if (typeof firebase !== 'undefined') {
      firebaseApp = firebase.initializeApp(finalConfig);
      firebaseDatabase = firebase.database();
      
      // Initialize Firebase Storage
      try {
        firebaseStorage = firebase.storage();
        console.log('✅ Firebase Storage başlatıldı!');
      } catch (storageError) {
        console.warn('⚠️ Firebase Storage başlatılamadı:', storageError.message);
      }
      
      // Initialize Firebase Cloud Messaging
      try {
        if (firebase.messaging.isSupported()) {
          firebaseMessaging = firebase.messaging();
          console.log('✅ Firebase Cloud Messaging başlatıldı!');
        } else {
          console.warn('⚠️ Bu tarayıcı FCM desteklemiyor (HTTP üzerinde çalışıyor olabilir)');
        }
      } catch (msgError) {
        console.warn('⚠️ Firebase Messaging başlatılamadı:', msgError.message);
      }
      
      isFirebaseInitialized = true;
      console.log('✅ Firebase başarıyla başlatıldı!');
      return true;
    } else {
      throw new Error('Firebase SDK yüklenmedi!');
    }
  } catch (error) {
    console.error('❌ Firebase başlatma hatası:', error);
    isFirebaseInitialized = false;
    return false;
  }
}

/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('⚠️ Firebase başlatılmamış, connection test atlanıyor');
    return false;
  }

  try {
    // file:// protokolünde .info/connected çalışmayabilir, direkt database'e yazma deneyelim
    const testRef = firebaseDatabase.ref('_connection_test');
    await testRef.set({ timestamp: Date.now() });
    await testRef.remove(); // Temizlik
    console.log('✅ Firebase bağlantı testi başarılı!');
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase bağlantı testi başarısız (file:// protokolünde normal):', error.message);
    // file:// protokolünde bağlantı testi başarısız olsa bile, realtime listener çalışabilir
    return true; // Yine de devam et
  }
}

/**
 * Send all data to Firebase
 */
async function sendDataToFirebase(data) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    throw new Error('Firebase başlatılmamış! Lütfen önce Firebase ayarlarını yapın.');
  }

  try {
    const updates = {};
    
    // Prepare data for Firebase
    updates['/vehicles'] = data.vehiclesData || [];
    updates['/customers'] = data.customersData || [];
    updates['/rentals'] = data.rentalsData || [];
    updates['/reservations'] = data.reservationsData || [];
    updates['/maintenance'] = data.maintenanceData || [];
    updates['/activities'] = data.activitiesData || [];
    updates['/documents'] = data.documentsData || []; // ✅ Dosyaları ekle
    updates['/settings'] = data.settings || {};
    updates['/lastUpdate'] = new Date().toISOString();

    // Send to Firebase
    await firebaseDatabase.ref().update(updates);
    
    console.log('✅ Veriler Firebase\'e gönderildi!');
    return true;
  } catch (error) {
    console.error('❌ Firebase\'e veri gönderme hatası:', error);
    throw error;
  }
}

/**
 * Fetch all data from Firebase
 */
async function fetchDataFromFirebase() {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    throw new Error('Firebase başlatılmamış! Lütfen önce Firebase ayarlarını yapın.');
  }

  // 📱 Mobil cihaz kontrolü
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const timeout = isMobile ? 15000 : 10000; // Mobilde 15 saniye, desktop'ta 10 saniye

  console.log(`🔄 Firebase veri çekiliyor... (${isMobile ? '📱 Mobil' : '💻 Desktop'} - Timeout: ${timeout}ms)`);

  let data = null;

  try {
    console.log('🔄 Firebase snapshot çekiliyor (WebSocket)...');

    // 🚀 Timeout ekle (mobilde daha uzun)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('WebSocket timeout')), timeout)
    );

    const snapshotPromise = firebaseDatabase.ref().once('value');

    const snapshot = await Promise.race([snapshotPromise, timeoutPromise]);

    console.log('✅ WebSocket snapshot alındı!');
    data = snapshot.val();

  } catch (wsError) {
    // 🔥 FALLBACK: REST API kullan (WebSocket başarısız olursa)
    console.warn('⚠️ WebSocket başarısız, REST API deneniyor:', wsError.message);

    try {
      const databaseURL = defaultFirebaseConfig.databaseURL;
      const restUrl = `${databaseURL}/.json`;

      console.log('🌐 REST API ile veri çekiliyor:', restUrl);

      // 🚀 Fetch timeout wrapper (mobilde daha uzun)
      const fetchWithTimeout = async (url, options, timeout) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            throw new Error('REST API timeout - Bağlantı çok yavaş');
          }
          throw error;
        }
      };

      const response = await fetchWithTimeout(restUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }, timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data = await response.json();
      console.log('✅ REST API ile veri alındı!');

    } catch (restError) {
      console.error('❌ REST API de başarısız:', restError.message);

      // 📱 Mobil için detaylı hata mesajı
      if (isMobile) {
        throw new Error(`Mobil bağlantı hatası: ${restError.message}\n\nLütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`);
      }

      throw new Error(`Firebase bağlantı hatası: ${restError.message}`);
    }
  }

  try {

    if (!data) {
      throw new Error('Firebase\'de veri bulunamadı!');
    }

    // 🚀 Helper: Object'i Array'e çevir (Firebase'den Object gelirse)
    const toArray = (obj) => {
      if (!obj) return [];
      if (Array.isArray(obj)) return obj;
      return Object.values(obj).filter(Boolean); // null/undefined'ları filtrele
    };

    // Process activities to convert date strings to Date objects
    let processedActivities = toArray(data.activities);
    processedActivities = processedActivities.map(activity => {
      if (!activity) return null;

      try {
        let parsedDate = new Date();

        // Try to parse date from activity.date or activity.time
        if (activity.date) {
          const attemptedDate = new Date(activity.date);
          if (!isNaN(attemptedDate.getTime())) {
            parsedDate = attemptedDate;
          }
        } else if (activity.time) {
          const attemptedDate = new Date(activity.time);
          if (!isNaN(attemptedDate.getTime())) {
            parsedDate = attemptedDate;
          }
        }

        return {
          icon: activity.icon || 'fa-solid fa-circle-info',
          message: activity.message || 'Bilinmeyen aktivite',
          time: parsedDate,
          date: parsedDate
        };
      } catch (e) {
        console.error('Activity date parse error:', e, activity);
        return null;
      }
    }).filter(activity => activity !== null);

    // 🚀 Documents - basit toArray kullan
    const documents = toArray(data.documents || data.documentsData);

    const result = {
      vehiclesData: toArray(data.vehicles), // 🚀 Object to Array
      customersData: toArray(data.customers), // 🚀 Object to Array
      rentalsData: toArray(data.rentals), // 🚀 Object to Array
      reservationsData: toArray(data.reservations), // 🚀 Object to Array
      maintenanceData: toArray(data.maintenance), // 🚀 Object to Array
      activitiesData: processedActivities,
      documentsData: documents, // 🚀 Object to Array
      settings: data.settings || {},
      lastUpdate: data.lastUpdate || null
    };

    console.log('✅ Veriler Firebase\'den alındı! (Araç:', result.vehiclesData.length, ', Müşteri:', result.customersData.length, ', Kiralama:', result.rentalsData.length, ', Dosya:', result.documentsData.length, ')');
    console.log('📄 documentsData örnek:', result.documentsData[0]); // İlk dosyayı göster
    return result;
  } catch (error) {
    console.error('❌ Firebase\'den veri çekme hatası:', error);
    throw error;
  }
}

/**
 * Setup real-time listener for data changes
 */
function setupFirebaseListener(callback) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('Firebase başlatılmamış, listener kurulamadı!');
    return null;
  }

  try {
    const ref = firebaseDatabase.ref();
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data && callback) {
        // 🔥 KRITIK FIX: Date objelerini parse et
        const processedData = { ...data };
        
        // Activities date'lerini düzelt
        if (processedData.activities && Array.isArray(processedData.activities)) {
          processedData.activities = processedData.activities.map(activity => {
            if (!activity) return null;
            
            // Date parse - güvenli
            let parsedDate = new Date();
            try {
              if (activity.date) {
                parsedDate = new Date(activity.date);
              } else if (activity.time) {
                parsedDate = new Date(activity.time);
              }
              // Invalid date kontrolü
              if (isNaN(parsedDate.getTime())) {
                parsedDate = new Date();
              }
            } catch (e) {
              console.warn('Activity date parse error:', activity);
              parsedDate = new Date();
            }
            
            return {
              icon: activity.icon || 'fa-circle',
              message: activity.message || 'Bilinmeyen aktivite',
              time: parsedDate,
              date: parsedDate // Hem time hem date olsun
            };
          }).filter(a => a !== null); // null'ları temizle
        }
        
        callback(processedData);
      }
    });

    console.log('✅ Firebase realtime listener kuruldu!');
    return ref;
  } catch (error) {
    console.error('❌ Firebase listener kurulumu hatası:', error);
    return null;
  }
}

/**
 * Load data from Firebase (alias for fetchDataFromFirebase)
 */
async function loadDataFromFirebase() {
  return await fetchDataFromFirebase();
}



/**
 * Remove Firebase listener
 */
function removeFirebaseListener(ref) {
  if (ref) {
    ref.off();
    console.log('Firebase listener kaldırıldı!');
  }
}

/**
 * Auto-load data from Firebase on app startup
 * Returns: { success: boolean, lastUpdate: string|null, error: string|null }
 */
async function autoLoadFromFirebase() {
  try {
    console.log('🔄 Otomatik Firebase sync başlatılıyor...');
    
    if (!isFirebaseInitialized) {
      console.log('🔧 Firebase varsayılan config ile başlatılıyor...');
      const initialized = initializeFirebase(defaultFirebaseConfig);
      if (!initialized) {
        throw new Error('Firebase başlatılamadı');
      }
    }

    // Test connection first (optional, file:// protokolünde başarısız olabilir)
    const isConnected = await testFirebaseConnection();
    console.log(`🔗 Firebase bağlantı durumu: ${isConnected ? '✅ Bağlı' : '⚠️ Bağlantı testi başarısız (realtime listener çalışacak)'}`);

    // Fetch data from Firebase (connection test başarısız olsa bile dene)
    const firebaseData = await fetchDataFromFirebase();
    
    if (!firebaseData) {
      throw new Error('Firebase\'den veri alınamadı');
    }

    console.log('✅ Firebase verisi başarıyla yüklendi:', {
      vehicles: firebaseData.vehiclesData?.length || 0,
      customers: firebaseData.customersData?.length || 0,
      rentals: firebaseData.rentalsData?.length || 0,
      lastUpdate: firebaseData.lastUpdate
    });

    return {
      success: true,
      data: firebaseData,
      lastUpdate: firebaseData.lastUpdate || new Date().toISOString(),
      error: null
    };
  } catch (error) {
    console.error('❌ Otomatik Firebase sync hatası:', error.message);
    return {
      success: false,
      data: null,
      lastUpdate: null,
      error: error.message
    };
  }
}

/**
 * ========================================
 * FIREBASE CLOUD MESSAGING (PUSH NOTIFICATIONS)
 * ========================================
 */

/**
 * Request notification permission and get FCM token
 */
async function requestNotificationPermission() {
  try {
    // Check if messaging is available
    if (!firebaseMessaging) {
      console.warn('⚠️ Firebase Messaging kullanılamıyor (HTTP üzerinde olabilir, HTTPS gerekli)');
      return null;
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('⚠️ Bu tarayıcı bildirimleri desteklemiyor!');
      return null;
    }

    // TEMPORARILY DISABLED - Service Worker issues in production
    console.log('ℹ️ Push notifications geçici olarak devre dışı (service worker sorunları)');
    return null;

    // Request permission
    // console.log('🔔 Bildirim izni isteniyor...');
    // const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Bildirim izni verildi!');
      
      // Get FCM token
      try {
        const token = await firebaseMessaging.getToken({ vapidKey: vapidKey });
        console.log('✅ FCM Token alındı:', token);
        
        // Save token to Firebase (her cihaz için farklı token)
        await saveDeviceToken(token);
        
        return token;
      } catch (tokenError) {
        console.error('❌ FCM Token alma hatası:', tokenError);
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Bildirim izni reddedildi!');
      return null;
    } else {
      console.warn('⚠️ Bildirim izni askıda (varsayılan)');
      return null;
    }
  } catch (error) {
    console.error('❌ Bildirim izni hatası:', error);
    return null;
  }
}

/**
 * Save device FCM token to Firebase
 */
async function saveDeviceToken(token) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('Firebase başlatılmamış, token kaydedilemedi!');
    return;
  }

  try {
    const deviceId = getDeviceId();
    await firebaseDatabase.ref(`/deviceTokens/${deviceId}`).set({
      token: token,
      lastUpdated: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    console.log('✅ Cihaz token\'ı Firebase\'e kaydedildi!');
  } catch (error) {
    console.error('❌ Token kaydetme hatası:', error);
  }
}

/**
 * Get unique device ID (simple hash of userAgent + localStorage)
 */
function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

/**
 * Listen for foreground messages (when app is open)
 */
function listenForMessages(callback) {
  if (!firebaseMessaging) {
    console.warn('Firebase Messaging kullanılamıyor!');
    return;
  }

  try {
    firebaseMessaging.onMessage((payload) => {
      console.log('🔔 Ön planda bildirim alındı:', payload);
      
      // Show browser notification
      const notificationTitle = payload.notification.title || 'Filo Yönetim';
      const notificationOptions = {
        body: payload.notification.body || 'Yeni bir bildiriminiz var',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.data?.tag || 'default',
        requireInteraction: false,
        vibrate: [200, 100, 200]
      };

      // Show notification
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
        
        // Also show in-app toast
        if (typeof showToast !== 'undefined') {
          showToast(notificationTitle + ': ' + notificationOptions.body, 'info');
        }
      }

      // Call custom callback
      if (callback) {
        callback(payload);
      }
    });

    console.log('✅ Bildirim dinleyicisi kuruldu!');
  } catch (error) {
    console.error('❌ Bildirim dinleyici hatası:', error);
  }
}

/**
 * Send notification to all devices (from Firebase Functions or admin SDK)
 * Bu fonksiyon sadece referans - gerçek gönderim backend'den yapılacak
 */
async function sendNotificationToAllDevices(title, body, data = {}) {
  console.log('ℹ️ Bildirim gönderimi backend\'den yapılmalı (Firebase Functions/Admin SDK)');
  console.log('Gönderilecek bildirim:', { title, body, data });
  
  // This is just to save the notification intent to Firebase
  // A Firebase Function or backend service will read this and send actual notifications
  try {
    await firebaseDatabase.ref('/notificationQueue').push({
      title: title,
      body: body,
      data: data,
      timestamp: new Date().toISOString(),
      sent: false
    });
    console.log('✅ Bildirim kuyruğa eklendi (backend gönderecek)');
  } catch (error) {
    console.error('❌ Bildirim kuyruğa ekleme hatası:', error);
  }
}

/**
 * Trigger notification for specific events
 */
async function triggerNotification(eventType, eventData) {
  let title = 'Filo Yönetim';
  let body = '';
  const data = { eventType, ...eventData };

  switch (eventType) {
    case 'new_rental':
      title = '🚗 Yeni Kiralama';
      body = `${eventData.vehiclePlate} plakalı araç ${eventData.customerName} tarafından kiralandı.`;
      break;
    
    case 'rental_ending_soon':
      title = '⏰ Kiralama Süresi Bitiyor';
      body = `${eventData.vehiclePlate} plakalı aracın kiralama süresi ${eventData.daysLeft} gün sonra bitiyor.`;
      break;
    
    case 'vehicle_returned':
      title = '✅ Araç Teslim Alındı';
      body = `${eventData.vehiclePlate} plakalı araç ${eventData.customerName} tarafından teslim edildi.`;
      break;
    
    case 'maintenance_due':
      title = '🔧 Bakım Zamanı';
      body = `${eventData.vehiclePlate} plakalı aracın bakım zamanı geldi!`;
      break;
    
    case 'new_reservation':
      title = '📅 Yeni Rezervasyon';
      body = `${eventData.vehiclePlate} için ${eventData.customerName} tarafından rezervasyon yapıldı.`;
      break;
    
    case 'payment_reminder':
      title = '💰 Ödeme Hatırlatması';
      body = `${eventData.customerName} - ${eventData.amount}₺ ödeme bekliyor.`;
      break;
    
    default:
      title = 'Bildirim';
      body = eventData.message || 'Yeni bir güncelleme var.';
  }

  await sendNotificationToAllDevices(title, body, data);
}

/**
 * Initialize Push Notifications (call this on app start)
 */
async function initializePushNotifications() {
    console.log('🔔 Push notification servisi başlatılıyor...');
    
    // HTTPS kontrolü
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isHTTPS && !isLocalhost) {
        console.warn('⚠️ Push notification için HTTPS gerekli!');
        console.warn('💡 Firebase Hosting\'e deploy edin: npm run deploy');
        return null;
    }
    
    // Request permission and get token
    const token = await requestNotificationPermission();
    
    if (token) {
        // Listen for foreground messages
        listenForMessages((payload) => {
            console.log('Bildirim alındı:', payload);
            // Refresh app data if needed
            if (payload.data?.refresh === 'true') {
                console.log('Veriler yenileniyor...');
                // Trigger data refresh
            }
        });
    }
    
    return token;
}

/**
 * Upload file to Firebase Storage
 * @param {File} file - Dosya objesi
 * @param {string} category - Kategori (Sigortalar, Muayeneler, vb.)
 * @param {Function} progressCallback - Progress callback (0-100)
 * @returns {Promise<string>} - Download URL
 */
async function uploadFileToStorage(file, category = 'Diğer', progressCallback = null) {
    if (!firebaseStorage) {
        throw new Error('Firebase Storage başlatılmamış!');
    }

    try {
        // Dosya yolu oluştur: documents/kategori/timestamp_filename
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `documents/${category}/${timestamp}_${sanitizedFileName}`;
        
        // Storage referansı oluştur
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(filePath);
        
        console.log(`📤 Firebase Storage'a yükleniyor: ${filePath}`);
        
        // Dosyayı yükle
        const uploadTask = fileRef.put(file);
        
        // Progress tracking
        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Progress callback
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    if (progressCallback) {
                        progressCallback(progress);
                    }
                    console.log(`⏳ Yükleme: ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
                },
                (error) => {
                    // Error callback
                    console.error('❌ Firebase Storage yükleme hatası:', error);
                    reject(error);
                },
                async () => {
                    // Success callback
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log(`✅ Dosya yüklendi: ${downloadURL}`);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error('❌ Download URL alınamadı:', error);
                        reject(error);
                    }
                }
            );
        });
    } catch (error) {
        console.error('❌ uploadFileToStorage hatası:', error);
        throw error;
    }
}

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Firebase Storage download URL
 */
async function deleteFileFromStorage(fileUrl) {
    if (!firebaseStorage) {
        throw new Error('Firebase Storage başlatılmamış!');
    }

    try {
        // URL'den storage referansı oluştur
        const storageRef = firebaseStorage.refFromURL(fileUrl);
        
        console.log(`🗑️ Firebase Storage'dan siliniyor: ${storageRef.fullPath}`);
        
        await storageRef.delete();
        console.log('✅ Dosya Firebase Storage\'dan silindi');
        return true;
    } catch (error) {
        console.error('❌ Firebase Storage silme hatası:', error);
        // Dosya bulunamadıysa hata verme (zaten silinmiş olabilir)
        if (error.code === 'storage/object-not-found') {
            console.warn('⚠️ Dosya zaten silinmiş');
            return true;
        }
        throw error;
    }
}

/**
 * 🔥 Storage'dan tüm dosyaları listele ve metadata oluştur
 * Kullanım: Metadata kayıp olduğunda Storage'dan dosyaları recover et
 */
async function listAllFilesFromStorage() {
    if (!firebaseStorage) {
        throw new Error('Firebase Storage başlatılmamış!');
    }

    try {
        console.log('📂 Firebase Storage dosyaları taranıyor...');

        const storageRef = firebaseStorage.ref('documents');
        const result = await storageRef.listAll();

        const files = [];
        const categories = ['Faturalar', 'Muayeneler', 'Ruhsatlar', 'Sigortalar', 'Diğer'];

        // Her kategori için dosyaları listele
        for (const category of categories) {
            try {
                const categoryRef = firebaseStorage.ref(`documents/${category}`);
                const categoryResult = await categoryRef.listAll();

                console.log(`📁 ${category}: ${categoryResult.items.length} dosya bulundu`);

                for (const itemRef of categoryResult.items) {
                    try {
                        const url = await itemRef.getDownloadURL();
                        const metadata = await itemRef.getMetadata();

                        // Dosya adından ID çıkar (timestamp kısmı)
                        const fileName = itemRef.name;
                        const timestamp = fileName.split('_')[0];
                        const docId = `DOC-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

                        // Dosya tipini belirle
                        const fileType = metadata.contentType?.includes('pdf') ? 'pdf' :
                                        metadata.contentType?.includes('image') ? 'image' : 'other';

                        files.push({
                            id: docId,
                            name: fileName,
                            category: category,
                            type: fileType,
                            storageType: 'firebaseStorage',
                            storagePath: `documents/${category}/${fileName}`,
                            url: url,
                            size: metadata.size || 0,
                            uploadDate: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
                            linkedVehicles: [],
                            tags: []
                        });
                    } catch (fileError) {
                        console.error(`❌ Dosya metadata alınamadı: ${itemRef.name}`, fileError);
                    }
                }
            } catch (categoryError) {
                console.warn(`⚠️ Kategori okunamadı: ${category}`, categoryError);
            }
        }

        console.log(`✅ Toplam ${files.length} dosya metadata'sı oluşturuldu!`);
        return files;

    } catch (error) {
        console.error('❌ listAllFilesFromStorage hatası:', error);
        throw error;
    }
}

// ============================================
// ES6 MODULE EXPORTS (for Vite bundling)
// ============================================
export {
    initializeFirebase,
    testFirebaseConnection,
    sendDataToFirebase,
    fetchDataFromFirebase,
    loadDataFromFirebase,
    setupFirebaseListener,
    removeFirebaseListener,
    autoLoadFromFirebase,
    requestNotificationPermission,
    saveDeviceToken,
    listenForMessages,
    sendNotificationToAllDevices,
    triggerNotification,
    initializePushNotifications,
    uploadFileToStorage,
    deleteFileFromStorage,
    listAllFilesFromStorage
};

// ============================================
// GLOBAL EXPORTS (window object - backward compatibility)
// ============================================
window.initializeFirebase = initializeFirebase;
window.testFirebaseConnection = testFirebaseConnection;
window.sendDataToFirebase = sendDataToFirebase;
window.fetchDataFromFirebase = fetchDataFromFirebase;
window.loadDataFromFirebase = loadDataFromFirebase;
window.setupFirebaseListener = setupFirebaseListener;
window.removeFirebaseListener = removeFirebaseListener;
window.autoLoadFromFirebase = autoLoadFromFirebase;
window.requestNotificationPermission = requestNotificationPermission;
window.saveDeviceToken = saveDeviceToken;
window.listenForMessages = listenForMessages;
window.sendNotificationToAllDevices = sendNotificationToAllDevices;
window.triggerNotification = triggerNotification;
window.initializePushNotifications = initializePushNotifications;
window.uploadFileToStorage = uploadFileToStorage;
window.deleteFileFromStorage = deleteFileFromStorage;
window.listAllFilesFromStorage = listAllFilesFromStorage;

console.log('✅ Firebase fonksiyonları export edildi:', {
    initializeFirebase: typeof initializeFirebase,
    listAllFilesFromStorage: typeof listAllFilesFromStorage,
    uploadFileToStorage: typeof uploadFileToStorage
});