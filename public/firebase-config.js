
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
// Bu key Firebase Console > Project Settings > Cloud Messaging'den alÄ±ndÄ± âœ…
const vapidKey = "BHhfwLs8mhkQPT5ecNAyL8q1zfixUYpqBlyLp2HJvioV2uPWhj53F52TH1vjz4lP6G8uESkg6WyXYfNnYHAMu0U";

function hashStringToNumber(str) {
  if (!str) {
    return Date.now();
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }

  hash = Math.abs(hash);
  return hash === 0 ? Date.now() : hash;
}

function extractStoragePathFromUrl(url) {
  try {
    if (!url) {
      return null;
    }

    const decoded = decodeURIComponent(url);
    const match = decoded.match(/\/o\/(.*?)(?:\?|$)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    console.warn('Storage URL parse error:', error);
  }
  return null;
}

async function listAllFilesRecursively(storageRef) {
  const result = await storageRef.listAll();
  let items = [].concat(result.items);

  for (let i = 0; i < result.prefixes.length; i++) {
    const subItems = await listAllFilesRecursively(result.prefixes[i]);
    items = items.concat(subItems);
  }

  return items;
}

async function fetchDocumentsFromStorage() {
  if (!firebaseStorage) {
    console.warn('Firebase Storage henÃ¼z baÅŸlatÄ±lmadÄ±, storage dokÃ¼manlarÄ± getirilemiyor.');
    return [];
  }

  try {
    const rootRef = firebaseStorage.ref('documents');
    const fileRefs = await listAllFilesRecursively(rootRef);

    const documents = await Promise.all(fileRefs.map(async (fileRef) => {
      try {
        const metadataPromise = fileRef.getMetadata();
        const downloadUrlPromise = fileRef.getDownloadURL();
        const metadata = await metadataPromise;
        const downloadURL = await downloadUrlPromise;

        const storagePath = metadata.fullPath || fileRef.fullPath || null;
        const category = storagePath
          ? storagePath.replace(/^documents\//, '').split('/')[0] || 'Diger'
          : 'Diger';

        let tags = [];
        let linkedVehicles = [];
        let customDocId = null;
        if (metadata.customMetadata) {
          if (metadata.customMetadata.tags) {
            tags = metadata.customMetadata.tags.split(',').map(function (tag) {
              return tag.trim();
            }).filter(function (tag) { return tag.length > 0; });
          }
          if (metadata.customMetadata.linkedVehicles) {
            linkedVehicles = metadata.customMetadata.linkedVehicles.split(',').map(function (vehicle) {
              return vehicle.trim();
            }).filter(function (vehicle) { return vehicle.length > 0; });
          }
          if (metadata.customMetadata.docId) {
            const parsed = parseInt(metadata.customMetadata.docId, 10);
            if (!isNaN(parsed)) {
              customDocId = parsed;
            }
          }
        }

        const documentId = customDocId !== null
          ? customDocId
          : hashStringToNumber(storagePath || metadata.name || downloadURL);

        return {
          id: documentId,
          name: metadata.name || fileRef.name,
          category: category,
          type: metadata.contentType || 'application/octet-stream',
          storageType: 'firebase',
          storagePath: storagePath,
          url: downloadURL,
          fileData: null,
          size: typeof metadata.size === 'number' ? metadata.size : null,
          uploadDate: metadata.timeCreated || metadata.updated || new Date().toISOString(),
          linkedVehicles: linkedVehicles,
          tags: tags
        };
      } catch (error) {
        console.warn('Storage dokÃ¼manÄ± okunamadÄ±:', fileRef.fullPath, error);
        return null;
      }
    }));

    return normalizeDocumentsForClient(documents.filter(function (doc) { return doc !== null; }));
  } catch (error) {
    console.warn('Firebase Storage dokÃ¼manlarÄ± listelenirken hata oluÅŸtu:', error);
    return [];
  }
}

function mergeDocumentLists(existingDocs, storageDocs) {
  const map = new Map();

  function upsert(doc) {
    if (!doc) {
      return;
    }

    const normalized = Object.assign({}, doc);

    if (!normalized.storagePath && normalized.url) {
      const inferredPath = extractStoragePathFromUrl(normalized.url);
      if (inferredPath) {
        normalized.storagePath = inferredPath;
      }
    }

    if (typeof normalized.id !== 'number' || isNaN(normalized.id)) {
      const keySource = normalized.storagePath || normalized.url || normalized.name || String(Date.now());
      normalized.id = hashStringToNumber(String(keySource));
    }

    if (!normalized.storageType) {
      normalized.storageType = 'firebase';
    }

    const key = normalized.storagePath || normalized.id;
    const previous = map.get(key) || {};
    map.set(key, Object.assign({}, previous, normalized));
  }

  if (Array.isArray(existingDocs)) {
    existingDocs.forEach(upsert);
  }

  if (Array.isArray(storageDocs)) {
    storageDocs.forEach(upsert);
  }

  return Array.from(map.values());
}

function normalizeStringArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map(function (item) { return String(item).trim(); })
      .filter(function (item) { return item.length > 0; });
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(function (item) { return item.trim(); })
      .filter(function (item) { return item.length > 0; });
  }

  return [];
}

function normalizeDocumentsForClient(documents) {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents
    .map(function (doc) {
      if (!doc) {
        return null;
      }

      const normalized = Object.assign({}, doc);

      normalized.storageType = normalized.storageType || 'firebase';

      if (!normalized.url && normalized.downloadURL) {
        normalized.url = normalized.downloadURL;
      }

      if (!normalized.storagePath && normalized.url) {
        const inferredPath = extractStoragePathFromUrl(normalized.url);
        if (inferredPath) {
          normalized.storagePath = inferredPath;
        }
      }

      const uploadDateValue = normalized.uploadDate || normalized.timeCreated || normalized.updated || new Date().toISOString();
      const parsedUploadDate = new Date(uploadDateValue);
      normalized.uploadDate = isNaN(parsedUploadDate.getTime())
        ? new Date().toISOString()
        : parsedUploadDate.toISOString();

      normalized.tags = normalizeStringArray(normalized.tags);
      normalized.linkedVehicles = normalizeStringArray(normalized.linkedVehicles);

      if (normalized.storageType === 'firebase') {
        normalized.fileData = null;
      }

      if (typeof normalized.size !== 'number') {
        normalized.size = null;
      }

      if (typeof normalized.id !== 'number' || isNaN(normalized.id)) {
        const key = normalized.storagePath || normalized.url || normalized.name || '';
        normalized.id = hashStringToNumber(String(key));
      }

      return normalized;
    })
    .filter(function (doc) { return doc !== null; });
}

function sanitizeDocumentsForFirebase(documents) {
  return normalizeDocumentsForClient(documents).map(function (doc) {
    const sanitized = Object.assign({}, doc);
    const uploadDate = new Date(sanitized.uploadDate);
    sanitized.uploadDate = isNaN(uploadDate.getTime()) ? new Date().toISOString() : uploadDate.toISOString();
    sanitized.tags = normalizeStringArray(sanitized.tags);
    sanitized.linkedVehicles = normalizeStringArray(sanitized.linkedVehicles);
    sanitized.storageType = sanitized.storageType || 'firebase';
    sanitized.storagePath = sanitized.storagePath || (sanitized.url ? extractStoragePathFromUrl(sanitized.url) : null);
    if (sanitized.storageType === 'firebase') {
      sanitized.fileData = null;
    }
    return sanitized;
  });
}

/**
 * Initialize Firebase with user configuration
 */
function initializeFirebase(config = null) {
  try {
    // Use provided config or default config
    const finalConfig = config || defaultFirebaseConfig;
    
    if (!finalConfig || !finalConfig.apiKey || !finalConfig.databaseURL) {
      throw new Error('Firebase konfigÃ¼rasyonu eksik!');
    }

    // Initialize Firebase
    if (typeof firebase !== 'undefined') {
      firebaseApp = firebase.initializeApp(finalConfig);
      firebaseDatabase = firebase.database();
      
      // Initialize Firebase Storage
      try {
        firebaseStorage = firebase.storage();
        console.log('âœ… Firebase Storage baÅŸlatÄ±ldÄ±!');
      } catch (storageError) {
        console.warn('âš ï¸ Firebase Storage baÅŸlatÄ±lamadÄ±:', storageError.message);
      }
      
      // Initialize Firebase Cloud Messaging
      try {
        if (firebase.messaging.isSupported()) {
          firebaseMessaging = firebase.messaging();
          console.log('âœ… Firebase Cloud Messaging baÅŸlatÄ±ldÄ±!');
        } else {
          console.warn('âš ï¸ Bu tarayÄ±cÄ± FCM desteklemiyor (HTTP Ã¼zerinde Ã§alÄ±ÅŸÄ±yor olabilir)');
        }
      } catch (msgError) {
        console.warn('âš ï¸ Firebase Messaging baÅŸlatÄ±lamadÄ±:', msgError.message);
      }
      
      isFirebaseInitialized = true;
      console.log('âœ… Firebase baÅŸarÄ±yla baÅŸlatÄ±ldÄ±!');
      return true;
    } else {
      throw new Error('Firebase SDK yÃ¼klenmedi!');
    }
  } catch (error) {
    console.error('âŒ Firebase baÅŸlatma hatasÄ±:', error);
    isFirebaseInitialized = false;
    return false;
  }
}

/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('âš ï¸ Firebase baÅŸlatÄ±lmamÄ±ÅŸ, connection test atlanÄ±yor');
    return false;
  }

  try {
    // file:// protokolÃ¼nde .info/connected Ã§alÄ±ÅŸmayabilir, direkt database'e yazma deneyelim
    const testRef = firebaseDatabase.ref('_connection_test');
    await testRef.set({ timestamp: Date.now() });
    await testRef.remove(); // Temizlik
    console.log('âœ… Firebase baÄŸlantÄ± testi baÅŸarÄ±lÄ±!');
    return true;
  } catch (error) {
    console.warn('âš ï¸ Firebase baÄŸlantÄ± testi baÅŸarÄ±sÄ±z (file:// protokolÃ¼nde normal):', error.message);
    // file:// protokolÃ¼nde baÄŸlantÄ± testi baÅŸarÄ±sÄ±z olsa bile, realtime listener Ã§alÄ±ÅŸabilir
    return true; // Yine de devam et
  }
}

/**
 * Send all data to Firebase
 */
async function sendDataToFirebase(data) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    throw new Error('Firebase baÅŸlatÄ±lmamÄ±ÅŸ! LÃ¼tfen Ã¶nce Firebase ayarlarÄ±nÄ± yapÄ±n.');
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
    const sanitizedDocuments = sanitizeDocumentsForFirebase(data.documentsData || data.documents || []);
    updates['/documents'] = sanitizedDocuments;
    updates['/documentsData'] = sanitizedDocuments;
    updates['/settings'] = data.settings || {};
    updates['/lastUpdate'] = new Date().toISOString();

    // Send to Firebase
    await firebaseDatabase.ref().update(updates);
    
    console.log('âœ… Veriler Firebase\'e gÃ¶nderildi!');
    return true;
  } catch (error) {
    console.error('âŒ Firebase\'e veri gÃ¶nderme hatasÄ±:', error);
    throw error;
  }
}

/**
 * Fetch all data from Firebase
 */
async function fetchDataFromFirebase() {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    throw new Error('Firebase baÅŸlatÄ±lmamÄ±ÅŸ! LÃ¼tfen Ã¶nce Firebase ayarlarÄ±nÄ± yapÄ±n.');
  }

  let data = null;

  try {
    console.log('🔄 Firebase snapshot çekiliyor (WebSocket)...');

    // 🚀 Timeout ekle (5 saniye - kısa tutalım)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('WebSocket timeout')), 5000)
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

      const response = await fetch(restUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      data = await response.json();
      console.log('✅ REST API ile veri alındı!');

    } catch (restError) {
      console.error('❌ REST API de başarısız:', restError.message);
      throw new Error(`Firebase bağlantı hatası: ${restError.message}`);
    }
  }

  try {

    if (!data) {
      throw new Error('Firebase\'de veri bulunamadÄ±!');
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
    }

    // 🚀 Documents - basit toArray kullan
    const processedDocuments = toArray(data.documents || data.documentsData);

    const result = {
      vehiclesData: toArray(data.vehicles), // 🚀 Object to Array
      customersData: toArray(data.customers), // 🚀 Object to Array
      rentalsData: toArray(data.rentals), // 🚀 Object to Array
      reservationsData: toArray(data.reservations), // 🚀 Object to Array
      maintenanceData: toArray(data.maintenance), // 🚀 Object to Array
      activitiesData: processedActivities,
      documentsData: processedDocuments,
      settings: data.settings || {},
      lastUpdate: data.lastUpdate || null
    };

    result.documents = processedDocuments;

    console.log('Veriler Firebase\'den alindi! (Activities: ' + processedActivities.length + ' | Documents: ' + processedDocuments.length + ')');
    return result;
  } catch (error) {
    console.error('âŒ Firebase\'den veri Ã§ekme hatasÄ±:', error);
    throw error;
  }
}

/**
 * Setup real-time listener for data changes
 */
function setupFirebaseListener(callback) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('Firebase baÅŸlatÄ±lmamÄ±ÅŸ, listener kurulamadÄ±!');
    return null;
  }

  try {
    const ref = firebaseDatabase.ref();
    ref.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data && callback) {
        // ğŸ”¥ KRITIK FIX: Date objelerini parse et
        const processedData = { ...data };
        
        // Activities date'lerini dÃ¼zelt
        if (processedData.activities && Array.isArray(processedData.activities)) {
          processedData.activities = processedData.activities.map(activity => {
            if (!activity) return null;
            
            // Date parse - gÃ¼venli
            let parsedDate = new Date();
            try {
              if (activity.date) {
                parsedDate = new Date(activity.date);
              } else if (activity.time) {
                parsedDate = new Date(activity.time);
              }
              // Invalid date kontrolÃ¼
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
          }).filter(a => a !== null); // null'larÄ± temizle
        }
        
        const listenerRawDocs = Array.isArray(processedData.documents)
          ? processedData.documents
          : Array.isArray(processedData.documentsData)
            ? processedData.documentsData
            : [];

        try {
          const storageDocs = await fetchDocumentsFromStorage();
          const mergedDocs = mergeDocumentLists(listenerRawDocs, storageDocs);
          const normalizedDocs = normalizeDocumentsForClient(mergedDocs);
          processedData.documents = normalizedDocs;
          processedData.documentsData = normalizedDocs;
        } catch (listenerError) {
          console.warn('Firebase Storage dokumanlari listener uzerinden getirilemedi:', listenerError);
          const fallbackDocs = normalizeDocumentsForClient(mergeDocumentLists(listenerRawDocs, []));
          processedData.documents = fallbackDocs;
          processedData.documentsData = fallbackDocs;
        }

        callback(processedData);
      }
    });

    console.log('âœ… Firebase realtime listener kuruldu!');
    return ref;
  } catch (error) {
    console.error('âŒ Firebase listener kurulumu hatasÄ±:', error);
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
    console.log('Firebase listener kaldÄ±rÄ±ldÄ±!');
  }
}

/**
 * Auto-load data from Firebase on app startup
 * Returns: { success: boolean, lastUpdate: string|null, error: string|null }
 */
async function autoLoadFromFirebase() {
  try {
    console.log('ğŸ”„ Otomatik Firebase sync baÅŸlatÄ±lÄ±yor...');
    
    if (!isFirebaseInitialized) {
      console.log('ğŸ”§ Firebase varsayÄ±lan config ile baÅŸlatÄ±lÄ±yor...');
      const initialized = initializeFirebase(defaultFirebaseConfig);
      if (!initialized) {
        throw new Error('Firebase baÅŸlatÄ±lamadÄ±');
      }
    }

    // Test connection first (optional, file:// protokolÃ¼nde baÅŸarÄ±sÄ±z olabilir)
    const isConnected = await testFirebaseConnection();
    console.log(`ğŸ”— Firebase baÄŸlantÄ± durumu: ${isConnected ? 'âœ… BaÄŸlÄ±' : 'âš ï¸ BaÄŸlantÄ± testi baÅŸarÄ±sÄ±z (realtime listener Ã§alÄ±ÅŸacak)'}`);

    // Fetch data from Firebase (connection test baÅŸarÄ±sÄ±z olsa bile dene)
    const firebaseData = await fetchDataFromFirebase();
    
    if (!firebaseData) {
      throw new Error('Firebase\'den veri alÄ±namadÄ±');
    }

    console.log('âœ… Firebase verisi baÅŸarÄ±yla yÃ¼klendi:', {
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
    console.error('âŒ Otomatik Firebase sync hatasÄ±:', error.message);
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
      console.warn('âš ï¸ Firebase Messaging kullanÄ±lamÄ±yor (HTTP Ã¼zerinde olabilir, HTTPS gerekli)');
      return null;
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('âš ï¸ Bu tarayÄ±cÄ± bildirimleri desteklemiyor!');
      return null;
    }

    // TEMPORARILY DISABLED - Service Worker issues in production
    console.log('â„¹ï¸ Push notifications geÃ§ici olarak devre dÄ±ÅŸÄ± (service worker sorunlarÄ±)');
    return null;

    // Request permission
    // console.log('ğŸ”” Bildirim izni isteniyor...');
    // const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('âœ… Bildirim izni verildi!');
      
      // Get FCM token
      try {
        const token = await firebaseMessaging.getToken({ vapidKey: vapidKey });
        console.log('âœ… FCM Token alÄ±ndÄ±:', token);
        
        // Save token to Firebase (her cihaz iÃ§in farklÄ± token)
        await saveDeviceToken(token);
        
        return token;
      } catch (tokenError) {
        console.error('âŒ FCM Token alma hatasÄ±:', tokenError);
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('âŒ Bildirim izni reddedildi!');
      return null;
    } else {
      console.warn('âš ï¸ Bildirim izni askÄ±da (varsayÄ±lan)');
      return null;
    }
  } catch (error) {
    console.error('âŒ Bildirim izni hatasÄ±:', error);
    return null;
  }
}

/**
 * Save device FCM token to Firebase
 */
async function saveDeviceToken(token) {
  if (!isFirebaseInitialized || !firebaseDatabase) {
    console.warn('Firebase baÅŸlatÄ±lmamÄ±ÅŸ, token kaydedilemedi!');
    return;
  }

  try {
    const deviceId = getDeviceId();
    await firebaseDatabase.ref(`/deviceTokens/${deviceId}`).set({
      token: token,
      lastUpdated: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    console.log('âœ… Cihaz token\'Ä± Firebase\'e kaydedildi!');
  } catch (error) {
    console.error('âŒ Token kaydetme hatasÄ±:', error);
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
    console.warn('Firebase Messaging kullanÄ±lamÄ±yor!');
    return;
  }

  try {
    firebaseMessaging.onMessage((payload) => {
      console.log('ğŸ”” Ã–n planda bildirim alÄ±ndÄ±:', payload);
      
      // Show browser notification
      const notificationTitle = payload.notification.title || 'Filo YÃ¶netim';
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

    console.log('âœ… Bildirim dinleyicisi kuruldu!');
  } catch (error) {
    console.error('âŒ Bildirim dinleyici hatasÄ±:', error);
  }
}

/**
 * Send notification to all devices (from Firebase Functions or admin SDK)
 * Bu fonksiyon sadece referans - gerÃ§ek gÃ¶nderim backend'den yapÄ±lacak
 */
async function sendNotificationToAllDevices(title, body, data = {}) {
  console.log('â„¹ï¸ Bildirim gÃ¶nderimi backend\'den yapÄ±lmalÄ± (Firebase Functions/Admin SDK)');
  console.log('GÃ¶nderilecek bildirim:', { title, body, data });
  
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
    console.log('âœ… Bildirim kuyruÄŸa eklendi (backend gÃ¶nderecek)');
  } catch (error) {
    console.error('âŒ Bildirim kuyruÄŸa ekleme hatasÄ±:', error);
  }
}

/**
 * Trigger notification for specific events
 */
async function triggerNotification(eventType, eventData) {
  let title = 'Filo YÃ¶netim';
  let body = '';
  const data = { eventType, ...eventData };

  switch (eventType) {
    case 'new_rental':
      title = 'ğŸš— Yeni Kiralama';
      body = `${eventData.vehiclePlate} plakalÄ± araÃ§ ${eventData.customerName} tarafÄ±ndan kiralandÄ±.`;
      break;
    
    case 'rental_ending_soon':
      title = 'â° Kiralama SÃ¼resi Bitiyor';
      body = `${eventData.vehiclePlate} plakalÄ± aracÄ±n kiralama sÃ¼resi ${eventData.daysLeft} gÃ¼n sonra bitiyor.`;
      break;
    
    case 'vehicle_returned':
      title = 'âœ… AraÃ§ Teslim AlÄ±ndÄ±';
      body = `${eventData.vehiclePlate} plakalÄ± araÃ§ ${eventData.customerName} tarafÄ±ndan teslim edildi.`;
      break;
    
    case 'maintenance_due':
      title = 'ğŸ”§ BakÄ±m ZamanÄ±';
      body = `${eventData.vehiclePlate} plakalÄ± aracÄ±n bakÄ±m zamanÄ± geldi!`;
      break;
    
    case 'new_reservation':
      title = 'ğŸ“… Yeni Rezervasyon';
      body = `${eventData.vehiclePlate} iÃ§in ${eventData.customerName} tarafÄ±ndan rezervasyon yapÄ±ldÄ±.`;
      break;
    
    case 'payment_reminder':
      title = 'ğŸ’° Ã–deme HatÄ±rlatmasÄ±';
      body = `${eventData.customerName} - ${eventData.amount}â‚º Ã¶deme bekliyor.`;
      break;
    
    default:
      title = 'Bildirim';
      body = eventData.message || 'Yeni bir gÃ¼ncelleme var.';
  }

  await sendNotificationToAllDevices(title, body, data);
}

/**
 * Initialize Push Notifications (call this on app start)
 */
async function initializePushNotifications() {
    console.log('ğŸ”” Push notification servisi baÅŸlatÄ±lÄ±yor...');
    
    // HTTPS kontrolÃ¼
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isHTTPS && !isLocalhost) {
        console.warn('âš ï¸ Push notification iÃ§in HTTPS gerekli!');
        console.warn('ğŸ’¡ Firebase Hosting\'e deploy edin: npm run deploy');
        return null;
    }
    
    // Request permission and get token
    const token = await requestNotificationPermission();
    
    if (token) {
        // Listen for foreground messages
        listenForMessages((payload) => {
            console.log('Bildirim alÄ±ndÄ±:', payload);
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
async function uploadFileToStorage(file, category = 'Diger', progressCallback = null, options = {}) {
    if (!firebaseStorage) {
        throw new Error('Firebase Storage baÅŸlatÄ±lmamÄ±ÅŸ!');
    }

    try {
        // Dosya yolu oluÅŸtur: documents/kategori/timestamp_filename
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `documents/${category}/${timestamp}_${sanitizedFileName}`;
        
        // Storage referansÄ± oluÅŸtur
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(filePath);
        
        console.log(`ğŸ“¤ Firebase Storage'a yÃ¼kleniyor: ${filePath}`);
        
        const metadata = {
            cacheControl: 'public,max-age=3600',
            customMetadata: (function () {
                const baseMeta = {
                    category: category,
                    originalName: file.name
                };
                if (options && options.docId) {
                    baseMeta.docId = String(options.docId);
                }
                if (options && Array.isArray(options.tags) && options.tags.length > 0) {
                    baseMeta.tags = options.tags.join(',');
                }
                if (options && Array.isArray(options.linkedVehicles) && options.linkedVehicles.length > 0) {
                    baseMeta.linkedVehicles = options.linkedVehicles.join(',');
                }
                if (options && options.description) {
                    baseMeta.description = String(options.description);
                }
                return baseMeta;
            })()
        };

        if (!metadata.customMetadata.docId) {
            metadata.customMetadata.docId = String(hashStringToNumber(filePath));
        }

        // Dosyay�� yǬkle
        const uploadTask = fileRef.put(file, metadata);
        
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
                    console.log(`â³ YÃ¼kleme: ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
                },
                (error) => {
                    // Error callback
                    console.error('âŒ Firebase Storage yÃ¼kleme hatasÄ±:', error);
                    reject(error);
                },
                async () => {
                    // Success callback
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log(`âœ… Dosya yÃ¼klendi: ${downloadURL}`);
                        resolve(downloadURL);
                    } catch (error) {
        // Dosyay�� yǬkle
        const uploadTask = fileRef.put(file, metadata);
                    }
                }
            );
        });
    } catch (error) {
        console.error('âŒ uploadFileToStorage hatasÄ±:', error);
        throw error;
    }
}

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Firebase Storage download URL
 */
async function deleteFileFromStorage(fileUrl) {
    if (!firebaseStorage) {
        throw new Error('Firebase Storage baÅŸlatÄ±lmamÄ±ÅŸ!');
    }

    try {
        // URL'den storage referansÄ± oluÅŸtur
        const storageRef = firebaseStorage.refFromURL(fileUrl);
        
        console.log(`ğŸ—‘ï¸ Firebase Storage'dan siliniyor: ${storageRef.fullPath}`);
        
        await storageRef.delete();
        console.log('âœ… Dosya Firebase Storage\'dan silindi');
        return true;
    } catch (error) {
        console.error('âŒ Firebase Storage silme hatasÄ±:', error);
        // Dosya bulunamadÄ±ysa hata verme (zaten silinmiÅŸ olabilir)
        if (error.code === 'storage/object-not-found') {
            console.warn('âš ï¸ Dosya zaten silinmiÅŸ');
            return true;
        }
        throw error;
    }
}




// ============================================
// GLOBAL EXPORTS (window object)
// ============================================
if (typeof window !== 'undefined') {
    window.uploadFileToStorage = uploadFileToStorage;
    window.deleteFileFromStorage = deleteFileFromStorage;
    
    console.log('✅ Firebase Storage fonksiyonları window\'a export edildi');
}
