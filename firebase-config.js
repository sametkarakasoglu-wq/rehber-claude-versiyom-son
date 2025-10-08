
/**
 * Firebase Configuration and Initialization
 * This file handles Firebase setup and provides sync functions
 */

// Firebase will be imported from CDN in index.html
let firebaseApp = null;
let firebaseDatabase = null;
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
    throw new Error('Firebase başlatılmamış!');
  }

  try {
    // Try to read from database
    const testRef = firebaseDatabase.ref('.info/connected');
    const snapshot = await testRef.once('value');
    return snapshot.val() === true;
  } catch (error) {
    console.error('Firebase bağlantı testi başarısız:', error);
    return false;
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

  try {
    const snapshot = await firebaseDatabase.ref().once('value');
    const data = snapshot.val();

    if (!data) {
      throw new Error('Firebase\'de veri bulunamadı!');
    }

    const result = {
      vehiclesData: data.vehicles || [],
      customersData: data.customers || [],
      rentalsData: data.rentals || [],
      reservationsData: data.reservations || [],
      maintenanceData: data.maintenance || [],
      activitiesData: data.activities || [],
      settings: data.settings || {},
      lastUpdate: data.lastUpdate || null
    };

    console.log('✅ Veriler Firebase\'den alındı!');
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
        callback(data);
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
