/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Declare global Firebase
declare var firebase: any;

console.log('🚀 index.tsx başladı yüklenmeye...');

// Firebase will be imported from CDN in index.html
let firebaseApp = null;
let firebaseDatabase = null;
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

/**
 * Initialize Firebase with user configuration
 */
function initializeFirebase(config = null) {
  console.log('🔥 initializeFirebase() çağrıldı, config:', config);
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

// Firebase function declarations (defined in firebase-config.js)
// declare function initializeFirebase(config: any): boolean;
// declare function testFirebaseConnection(): Promise<boolean>;
// declare function sendDataToFirebase(data: any): Promise<void>;
// declare function loadDataFromFirebase(): Promise<any>;

// 🔒 Event listener guard - prevent duplicate listeners
let eventListenersAttached = false;

// Simple pseudo-ReactDOM render function
function render(element: string, container: HTMLElement | null) {
  if (container) {
    container.innerHTML = element;
    
    // ⚡ CRITICAL FIX: Attach event listeners ONLY ONCE
    if (!eventListenersAttached) {
      console.log('🔗 Event listeners ilk kez bağlanıyor...');
      attachEventListeners();
      eventListenersAttached = true;
    }
  }
}
// State management
let state = {
    activePage: 'dashboard',
    isVehicleModalOpen: false,
    isRentalModalOpen: false,
    isCustomerModalOpen: false,
    isCheckInModalOpen: false,
    isReservationModalOpen: false,
    isMaintenanceModalOpen: false,
    isRentalEditModalOpen: false,
    isReservationEditModalOpen: false,
    isMaintenanceEditModalOpen: false,
    editingVehicleIndex: null as number | null,
    editingReservationId: null as number | null,
    editingMaintenanceId: null as number | null,
    editingCustomerIndex: null as number | null,
    editingRentalId: null as number | null,
    selectedVehicleForAction: null as any | null,
    theme: 'light' as 'light' | 'dark', // For theme switching
    vehicleStatusFilter: null as string | null, // For dashboard filtering
    searchTerm: '', // For search functionality
    filterExpiring: false, // For vehicle page expiring filter
    rentalFormCustomerType: 'existing' as 'existing' | 'new', // For the rental modal
    notificationFilter: 'all' as 'all' | 'reminders' | 'activities', // For notifications page
    readNotifications: [] as number[], // Array of timestamps for read notifications
    settings: {
        // Dashboard
        db_metric_total: true,
        db_metric_rented: true,
        db_metric_maintenance: true,
        db_metric_income: true,
        // Vehicle & Reminders
        reminder_days: 30,
        vehicle_btn_rent: true,
        vehicle_btn_checkin: true,
        vehicle_btn_edit: true,
        // Notifications
        notif_type_insurance: true,
        notif_type_inspection: true,
        notif_type_activity: true,
        // Firebase Settings - Varsayılan config ile dolduruldu
        firebaseConfig: {
            apiKey: "AIzaSyDKeJDoNyGiPfdT6aOleZvzN85I8C3bVu8",
            authDomain: "rehber-filo.firebaseapp.com",
            databaseURL: "https://rehber-filo-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "rehber-filo",
            storageBucket: "rehber-filo.firebasestorage.app",
            messagingSenderId: "1022169726073",
            appId: "1:1022169726073:web:584648469dd7854248a8a8"
        },
        firebaseEnabled: true, // Firebase'i varsayılan olarak aktifleştir
        firebaseAutoSync: true, // Otomatik senkronizasyonu da aktifleştir
        firebaseMasterPassword: '1259', // 🔒 Varsayılan master password
        // PDF Settings
        companyInfo: {
            name: 'Rehber Rent a Car',
            address: 'Örnek Mah. Test Sk. No:1, İstanbul',
            phone: '0212 123 45 67',
            email: 'info@rehberrent.com',
            iban: 'TR00 0000 0000 0000 0000 0000',
            logo: null as string | null, // Will store base64
            pdfBackground: null as string | null, // NEW: For PDF background image
        },
        pdfSettings: {
            showLogo: true,
            showFooter: true,
            showBackground: true, // NEW: Toggle for background
        }
    }
};

// 🔒 Render guard - concurrent render prevention
let isRendering = false;

// State update function
async function setState(newState: Partial<typeof state>, skipRender: boolean = false) {
  state = { ...state, ...newState };
  await saveDataToLocalStorage(); // ÖNCE veriyi kaydet. Bu, eklenti çakışmalarını önler.
  
  if (!skipRender) {
    renderApp();
  }
}

// Verileri localStorage'a kaydetme fonksiyonu
async function saveDataToLocalStorage() {
  try {
    const appData = {
      vehiclesData,
      customersData,
      rentalsData,
      reservationsData,
      maintenanceData,
      activitiesData,
      theme: state.theme,
      readNotifications: state.readNotifications,
      settings: state.settings,
    };
    
    // LocalStorage'a kaydet (backup için)
    localStorage.setItem('rehberOtomotivData', JSON.stringify(appData));
    
    // Firebase'e kaydet (eğer aktifse)
    if (state.settings?.firebaseEnabled && typeof sendDataToFirebase === 'function') {
      try {
        await sendDataToFirebase(appData);
        console.log('✅ Veriler Firebase\'e kaydedildi!');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase kaydetme hatası:', firebaseError);
        // Firebase hatası olsa bile localStorage'a kaydetmeye devam et
      }
    }
  } catch (error) {
    console.error("!!! HATA: Veri kaydedilirken bir sorun oluştu:", error);
  }
}

// Navigation function
function navigateTo(pageId: string) {
  setState({ 
    activePage: pageId, 
    searchTerm: '', 
    vehicleStatusFilter: null,
    filterExpiring: false, // Reset expiring filter on page change
  });
}

// Data for navigation links
const navItems = [
  { id: 'dashboard', icon: 'fa-solid fa-chart-pie', text: 'Gösterge Paneli' },
  { id: 'vehicles', icon: 'fa-solid fa-car', text: 'Araçlar' },
  { id: 'customers', icon: 'fa-solid fa-users', text: 'Müşteriler' },
  { id: 'rentals', icon: 'fa-solid fa-file-contract', text: 'Kiralamalar' },
  { id: 'reservations', icon: 'fa-solid fa-calendar-days', text: 'Rezervasyonlar' },
  { id: 'maintenance', icon: 'fa-solid fa-screwdriver-wrench', text: 'Bakım' },
  { id: 'reports', icon: 'fa-solid fa-file-pdf', text: 'Raporlar' },
  { id: 'notifications', icon: 'fa-solid fa-bell', text: 'Bildirimler' },
  { id: 'settings', icon: 'fa-solid fa-gear', text: 'Ayarlar' },
];

// Data for quick access buttons
const quickAccessItems = [
    { id: 'vehicles', icon: 'fa-solid fa-car-side', text: 'Araç Ekle', className: 'btn-add-vehicle' },
    { id: 'customers', icon: 'fa-solid fa-user-plus', text: 'Müşteri Ekle', className: 'btn-add-customer' },
    { id: 'rentals', icon: 'fa-solid fa-file-signature', text: 'Kiralama Başlat', className: 'btn-start-rental' },
    { id: 'maintenance', icon: 'fa-solid fa-oil-can', text: 'Bakım Kaydı', className: 'btn-add-maintenance' },
];

// Data for recent activities (will be populated dynamically)
type Activity = {
    icon: string;
    message: string;
    time: Date; // This was correct, but the implementation was wrong.
};
let activitiesData: Activity[] = [];

function logActivity(icon: string, message: string) {
    activitiesData.unshift({ icon, message, time: new Date() }); // Store as Date object
    if (activitiesData.length > 10) activitiesData.pop(); // Keep the list size manageable
}

// Data for vehicles - Updated with file info and rentedBy
type Vehicle = {
    plate: string;
    brand: string;
    km: string;
    status: string;
    insuranceDate: string | null;
    inspectionDate: string | null;
    insuranceFile: string | null;
    inspectionFile: string | null;
    licenseFile: string | null;
    insuranceFileUrl: string | null;
    inspectionFileUrl: string | null;
    licenseFileUrl: string | null;
    rentedBy?: { name: string; phone: string; };
    activeRentalId?: number;
};

let vehiclesData: Vehicle[] = [
    { plate: '34 ABC 123', brand: 'Ford Focus', km: '120,500', status: 'Müsait', insuranceDate: '2025-10-15', inspectionDate: '2025-08-01', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '06 XYZ 789', brand: 'Renault Clio', km: '85,200', status: 'Kirada', insuranceDate: '2024-12-20', inspectionDate: '2025-01-10', insuranceFile: 'sigorta.pdf', inspectionFile: null, licenseFile: 'ruhsat.jpg', rentedBy: { name: 'Mehmet Öztürk', phone: '0544 567 89 01'}, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null, activeRentalId: 1 },
    { plate: '35 DEF 456', brand: 'Fiat Egea', km: '45,000', status: 'Bakımda', insuranceDate: '2025-05-01', inspectionDate: '2024-11-22', insuranceFile: null, inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '16 GHI 789', brand: 'Volkswagen Passat', km: '180,000', status: 'Müsait', insuranceDate: '2025-02-28', inspectionDate: '2025-03-15', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: null, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '41 JKL 123', brand: 'Hyundai i20', km: '62,300', status: 'Kirada', insuranceDate: '2024-09-05', inspectionDate: '2025-09-05', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', rentedBy: { name: 'Ayşe Kaya', phone: '0533 987 65 43' }, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null, activeRentalId: 2 },
];

// Data for customers
type Customer = {
    id: number;
    name: string;
    tc: string;
    phone: string;
    email: string;
    address: string;
    licenseNumber: string;
    licenseDate: string;
    idFile: string | null;
    idFileUrl: string | null;
    licenseFile: string | null;
    licenseFileUrl: string | null;
    rentals: { plate: string; date: string; status: string; }[];
};

let customersData: Customer[] = [
    {
        id: 1,
        name: 'Ahmet Yılmaz',
        tc: '12345678901',
        phone: '0555 123 45 67',
        email: 'ahmet.yilmaz@example.com',
        address: 'Örnek Mah. Test Sk. No: 1 Daire: 2, İstanbul',
        licenseNumber: 'A1234567',
        licenseDate: '25.10.2015',
        idFile: 'kimlik.jpg', idFileUrl: null,
        licenseFile: 'ehliyet.jpg', licenseFileUrl: null,
        rentals: [
            { plate: '34 ABC 123', date: '15.01.2024 - 20.01.2024', status: 'Tamamlandı' },
            { plate: '06 XYZ 789', date: '01.12.2023 - 05.12.2023', status: 'Tamamlandı' },
        ]
    },
    {
        id: 2,
        name: 'Ayşe Kaya',
        tc: '98765432109',
        phone: '0533 987 65 43',
        email: 'ayse.kaya@example.com',
        address: 'Deneme Mah. Prova Sk. No: 3 Daire: 4, Ankara',
        licenseNumber: 'B7654321',
        licenseDate: '10.05.2018',
        idFile: null, idFileUrl: null,
        licenseFile: 'ehliyet.jpg', licenseFileUrl: null,
        rentals: [
             { plate: '41 JKL 123', date: '10.02.2024 - 15.02.2024', status: 'Aktif' },
        ]
    },
     {
        id: 3,
        name: 'Mehmet Öztürk',
        tc: '56789012345',
        phone: '0544 567 89 01',
        email: 'mehmet.ozturk@example.com',
        address: 'Yazılım Mah. Kod Sk. No: 5 Daire: 6, İzmir',
        licenseNumber: 'C5678901',
        licenseDate: '01.02.2012',
        idFile: null, idFileUrl: null,
        licenseFile: null, licenseFileUrl: null,
        rentals: []
    },
];

// Data for rentals
type Rental = {
    id: number;
    vehiclePlate: string;
    customerId: number;
    startDate: string;
    endDate: string | null;
    startKm: number;
    endKm: number | null;
    price: number;
    priceType: 'daily' | 'monthly';
    totalCost: number | null;
    contractFile: string | null;
    contractFileUrl: string | null;
    invoiceFile: string | null;
    invoiceFileUrl: string | null;
    status: 'active' | 'completed';
};

let rentalsData: Rental[] = [
    { id: 1, vehiclePlate: '06 XYZ 789', customerId: 3, startDate: '2024-05-10', endDate: null, startKm: 85200, endKm: null, price: 1200, priceType: 'daily', totalCost: null, contractFile: null, contractFileUrl: null, invoiceFile: null, invoiceFileUrl: null, status: 'active' },
    { id: 2, vehiclePlate: '41 JKL 123', customerId: 2, startDate: '2024-05-15', endDate: null, startKm: 62300, endKm: null, price: 25000, priceType: 'monthly', totalCost: null, contractFile: 'sozlesme.pdf', contractFileUrl: null, invoiceFile: null, invoiceFileUrl: null, status: 'active' },
];

// Data for Reservations
type Reservation = {
    id: number;
    vehiclePlate: string;
    customerId: number;
    startDate: string;
    endDate: string;
    deliveryLocation: string;
    notes: string | null;
    status: 'active' | 'completed' | 'cancelled';
};

let reservationsData: Reservation[] = [
    { id: 1, vehiclePlate: '34 ABC 123', customerId: 1, startDate: '2024-06-20', endDate: '2024-06-25', deliveryLocation: 'Havaalanı', notes: 'Bebek koltuğu talep edildi.', status: 'active' },
];

// Data for Maintenance
type Maintenance = {
    id: number;
    vehiclePlate: string;
    maintenanceDate: string;
    maintenanceKm: number;
    type: string;
    cost: number;
    description: string;
    nextMaintenanceKm: number;
    nextMaintenanceDate: string;
};

let maintenanceData: Maintenance[] = [
    { id: 1, vehiclePlate: '35 DEF 456', maintenanceDate: '2024-05-01', maintenanceKm: 45000, type: 'Periyodik Bakım', cost: 2500, description: 'Yağ ve filtreler değişti. Genel kontrol yapıldı.', nextMaintenanceKm: 60000, nextMaintenanceDate: '2025-05-01' },
];

const getStatusClass = (status: string) => {
    if (status === 'Müsait' || status === 'completed') return 'available';
    if (status === 'Kirada' || status === 'active') return 'rented';
    if (status === 'Bakımda') return 'maintenance';
    return '';
};


const DashboardPage = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const daysUntil = (dateStr: string | null): number => {
        if (!dateStr) return Infinity;
        const today = new Date();
        const targetDate = new Date(dateStr);
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate dynamic stats
    const totalVehicles = vehiclesData.length;
    const activeRentals = vehiclesData.filter(v => v.status === 'Kirada').length;
    const totalCustomers = customersData.length;
    const maintenanceVehicles = vehiclesData.filter(v => v.status === 'Bakımda').length;
    const monthlyIncome = rentalsData
        .filter(r => {
            if (!r.endDate) return false;
            const endDate = new Date(r.endDate);
            return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + (r.totalCost || 0), 0);

    const allStatCards = [
        { key: 'db_metric_total', id: 'vehicles', label: 'Toplam Araç', value: totalVehicles, icon: 'fa-car', color: 'blue' },
        { key: 'db_metric_rented', id: 'rentals', label: 'Aktif Kiralama', value: activeRentals, icon: 'fa-key', color: 'orange' },
        { key: 'db_metric_maintenance', id: 'maintenance', label: 'Bakımdaki Araçlar', value: maintenanceVehicles, icon: 'fa-screwdriver-wrench', color: 'purple' },
        { key: 'db_metric_income', id: 'invoices', label: 'Bu Ayki Gelir', value: `₺${monthlyIncome.toLocaleString('tr-TR')}`, icon: 'fa-wallet', color: 'red' },
    ];

    // Filter stat cards based on settings
    const statCardsData = allStatCards.filter(card => {
        // This is a trick to use a string key to access a property of the settings object
        const settingsKey = card.key as keyof typeof state.settings;
        // If the setting exists and is false, filter it out. Otherwise, keep it.
        return state.settings[settingsKey] !== false;
    });


    // Vehicle distribution data
    const availableVehiclesCount = vehiclesData.filter(v => v.status === 'Müsait').length;
    const distributionData = [
        { label: 'Müsait Araçlar', status: 'Müsait', count: availableVehiclesCount, colorClass: 'available', icon: 'fa-check-circle' },
        { label: 'Kiradaki Araçlar', status: 'Kirada', count: activeRentals, colorClass: 'rented', icon: 'fa-key' },
        { label: 'Bakımdaki Araçlar', status: 'Bakımda', count: maintenanceVehicles, colorClass: 'maintenance', icon: 'fa-screwdriver-wrench' },
    ];

    // Calculate upcoming reminders
    const upcomingReminders: any[] = [];
    vehiclesData.forEach(v => {
        const insuranceDays = daysUntil(v.insuranceDate);
        if (insuranceDays >= 0 && insuranceDays <= 30) {
            upcomingReminders.push({ type: 'Sigorta', vehiclePlate: v.plate, days: insuranceDays, date: v.insuranceDate });
        }
        const inspectionDays = daysUntil(v.inspectionDate);
        if (inspectionDays >= 0 && inspectionDays <= 30) {
            upcomingReminders.push({ type: 'Muayene', vehiclePlate: v.plate, days: inspectionDays, date: v.inspectionDate });
        }
    });
    maintenanceData.forEach(m => {
        const maintenanceDays = daysUntil(m.nextMaintenanceDate);
        if (maintenanceDays >= 0 && maintenanceDays <= 30) {
            // Check if this is the latest maintenance for the vehicle to avoid duplicates
            const latestMaint = maintenanceData
                .filter(mx => mx.vehiclePlate === m.vehiclePlate)
                .sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime())[0];
            if (m.id === latestMaint.id) {
                upcomingReminders.push({ type: 'Bakım', vehiclePlate: m.vehiclePlate, days: maintenanceDays, date: m.nextMaintenanceDate });
            }
        }
    });

    upcomingReminders.sort((a, b) => a.days - b.days);

    const getReminderUrgency = (days: number) => {
        if (days <= 7) return 'urgent';
        if (days <= 15) return 'warning';
        return 'normal';
    };

    const getReminderText = (days: number) => {
        if (days < 0) return 'Geçti!';
        if (days === 0) return 'Bugün Son Gün!';
        if (days === 1) return 'Yarın Son Gün!';
        return `Son ${days} gün`;
    };

    const getReminderIcon = (type: string) => {
        if (type === 'Sigorta') return 'fa-shield-halved';
        if (type === 'Muayene') return 'fa-clipboard-check';
        if (type === 'Bakım') return 'fa-oil-can';
        return 'fa-bell';
    };

    return `
      <header class="page-header">
        <h1>Ana Gösterge Paneli</h1>
        <p>${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>
      <section class="stats-grid">
        ${statCardsData.map((stat) => `
          <div class="stat-card" data-page-id="${stat.id}">
            <div class="icon-wrapper ${stat.color}">
              <i class="fa-solid ${stat.icon}"></i>
            </div>
            <div class="info">
              <h3>${stat.value}</h3>
              <p>${stat.label}</p>
            </div>
          </div>
        `).join('')}
      </section>
      <div class="dashboard-grid">
    <section class="reminders-panel">
        <h3>Yaklaşan Hatırlatmalar (${upcomingReminders.length})</h3>
        <ul class="reminders-list">
            ${upcomingReminders.slice(0, 4).map(reminder => `
                <li class="reminder-item ${getReminderUrgency(reminder.days)}">
                    <div class="reminder-icon">
                        <i class="fa-solid ${getReminderIcon(reminder.type)}"></i>
                    </div>
                    <div class="reminder-info">
                        <strong>${reminder.vehiclePlate}</strong>
                        <span>${reminder.type} Bitiş Tarihi</span>
                    </div>
                    <div class="reminder-days">
                        <span>${getReminderText(reminder.days)}</span>
                    </div>
                </li>
            `).join('')}
            ${upcomingReminders.length === 0 ? '<li class="no-data-item">Yaklaşan hatırlatma bulunmuyor.</li>' : ''}
        </ul>
    </section>
    <section class="quick-access-panel">
      <h3>Hızlı İşlemler</h3>
      <div class="quick-access-buttons">
        ${quickAccessItems.map(item => `
          <button class="quick-access-btn ${item.className}" data-tooltip="${item.text}" data-page-id="${item.id}">
            <i class="${item.icon}"></i>
          </button>
        `).join('')}
      </div>
    </section>
    <section class="recent-activities-panel">
      <h3>Son Yapılan İşlemler</h3>
      <ul class="activity-list">
          ${activitiesData.filter(activity => activity && activity.icon && activity.message).map(activity => `
              <li class="activity-item">
                  <div class="activity-icon">
                      <i class="fa-solid ${activity.icon}"></i>
                  </div>
                  <div class="activity-details">
                      <p>${activity.message}</p>
                      <span>${activity.time ? formatTimeAgo(activity.time) : 'Bilinmiyor'}</span>
                  </div>
              </li>
          `).join('')}
      </ul>
    </section>
    <section class="vehicle-distribution-panel">
      <h3>Filo Durum Dağılımı</h3>
      <ul class="distribution-list-reimagined">
        ${distributionData.map(item => `
          <li class="distribution-item-reimagined dist-item-${item.colorClass}" data-status-filter="${item.status}">
            <div class="dist-item-icon">
              <i class="fa-solid ${item.icon}"></i>
            </div>
            <span class="dist-item-label">${item.label}</span>
            <span class="dist-item-count">${item.count}</span>
          </li>
        `).join('')}
      </ul>
    </section>
      </div>
    `;
};

const VehiclesPage = (): string => {
    const daysUntil = (dateStr: string | null): number => {
        if (!dateStr) return Infinity;
        const today = new Date();
        const targetDate = new Date(dateStr);
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const reminderDays = state.settings.reminder_days || 30;

    return `
    <header class="page-header">
        <h1>Araç Yönetimi</h1>
        <p>Filodaki tüm araçları görüntüleyin ve yönetin.</p>
    </header>
    <div class="page-actions">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i> 
            <input type="text" id="vehicle-search" placeholder="Plaka veya marka ara..." value="${state.searchTerm}">
        </div>
        <button class="btn btn-secondary ${state.filterExpiring ? 'active' : ''}" id="filter-expiring-btn" title="Sigortası veya Muayenesi Yaklaşan Araçları Göster">
            <i class="fa-solid fa-bell"></i> 
            Yaklaşanlar
        </button>
        <button class="btn btn-primary" id="add-vehicle-btn">
            <i class="fa-solid fa-plus"></i> 
            Yeni Araç Ekle
        </button>
    </div>
    <div class="vehicles-grid">
        ${vehiclesData
            .map((v, index) => ({ ...v, originalIndex: index })) // Keep original index
            .filter(v => {
                if (!state.filterExpiring) return true;
                const insuranceDays = daysUntil(v.insuranceDate);
                const inspectionDays = daysUntil(v.inspectionDate);
                return (insuranceDays >= 0 && insuranceDays <= reminderDays) || (inspectionDays >= 0 && inspectionDays <= reminderDays);
            })
            .filter(v => 
                !state.vehicleStatusFilter || // If no filter, show all
                v.status === state.vehicleStatusFilter
            )
            .filter(v => 
                v.plate.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                v.brand.toLowerCase().includes(state.searchTerm.toLowerCase())
            )
            .map(v => `
            <div class="vehicle-card" data-vehicle-index="${v.originalIndex}" data-status="${v.status}">
                <div class="card-header">
                    <h3>${v.plate}</h3>
                    <div class="status-badge ${getStatusClass(v.status)}">${v.status}</div>
                </div>
                <div class="card-info">
                    <p>${v.brand}</p>
                    <span>${v.km} KM</span>
                </div>
                <div class="card-documents">
                    <h4>Belgeler</h4>
                     <div class="document-item">
                        <div class="document-info">
                            <i class="fa-solid fa-shield-halved"></i>
                            <div><span>Sigorta Bitiş</span><strong>${v.insuranceDate ? new Date(v.insuranceDate).toLocaleDateString('tr-TR') : 'Girilmemiş'}</strong></div>
                        </div>
                        ${v.insuranceFile ? 
                            (v.insuranceFileUrl ? `<a href="${v.insuranceFileUrl}" target="_blank" class="btn-view" title="${v.insuranceFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` : `<button class="btn-upload btn-edit-vehicle" title="Dosyayı yeniden yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yeniden Yükle</button>`) : 
                            `<button class="btn-upload btn-edit-vehicle" title="Dosya yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                    </div>
                    <div class="document-item">
                        <div class="document-info">
                            <i class="fa-solid fa-clipboard-check"></i>
                            <div><span>Muayene Bitiş</span><strong>${v.inspectionDate ? new Date(v.inspectionDate).toLocaleDateString('tr-TR') : 'Girilmemiş'}</strong></div>
                        </div>
                         ${v.inspectionFile ? 
                            (v.inspectionFileUrl ? `<a href="${v.inspectionFileUrl}" target="_blank" class="btn-view" title="${v.inspectionFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` : `<button class="btn-upload btn-edit-vehicle" title="Dosyayı yeniden yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yeniden Yükle</button>`) : 
                            `<button class="btn-upload btn-edit-vehicle" title="Dosya yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                    </div>
                    <div class="document-item">
                        <div class="document-info"><i class="fa-solid fa-id-card"></i><span>Ruhsat</span></div>
                         ${v.licenseFile ? 
                            (v.licenseFileUrl ? `<a href="${v.licenseFileUrl}" target="_blank" class="btn-view" title="${v.licenseFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` : `<button class="btn-upload btn-edit-vehicle" title="Dosyayı yeniden yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yeniden Yükle</button>`) : 
                            `<button class="btn-upload btn-edit-vehicle" title="Dosya yüklemek için düzenleyin"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                    </div>
                </div>
                <div class="card-actions">
                    ${v.status === 'Müsait' ? `<button class="btn btn-rent"><i class="fa-solid fa-key"></i> Kirala</button>` : ''}
                    ${v.status === 'Kirada' ? `<button class="btn btn-check-in"><i class="fa-solid fa-right-to-bracket"></i> Teslim Al</button>` : ''}
                    <div class="action-icons">
                       <button class="action-btn btn-view-maintenance" title="Bakım Geçmişini Görüntüle"><i class="fa-solid fa-screwdriver-wrench"></i></button>
                       <button class="action-btn btn-edit-vehicle" title="Düzenle"><i class="fa-solid fa-pencil"></i></button>
                       <button class="action-btn btn-delete-vehicle" title="Sil"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    `;
};

const CustomersPage = (): string => {
    return `
    <header class="page-header">
        <h1>Müşteri Yönetimi</h1>
        <p>Tüm müşterilerinizi görüntüleyin ve yönetin.</p>
    </header>
    <div class="page-actions">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i> 
            <input type="text" id="customer-search" placeholder="Müşteri adı, TC veya telefon ara..." value="${state.searchTerm}">
        </div>
        <button class="btn btn-primary" id="add-customer-btn">
            <i class="fa-solid fa-user-plus"></i> 
            Yeni Müşteri Ekle
        </button>
    </div>
    <div class="customer-list">
        ${customersData
            .map((c, index) => ({ ...c, originalIndex: index }))
            .filter(c => 
                c.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                c.tc.includes(state.searchTerm) ||
                c.phone.includes(state.searchTerm)
            ).map((customer) => {
                const customerRentals = rentalsData.filter(r => r.customerId === customer.id) || [];
                const totalRentals = customerRentals.length;
                const hasActiveRental = customerRentals.some(r => r.status === 'active');
                const initials = customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return `
            <div class="customer-accordion" data-customer-index="${customer.originalIndex}">
                <button class="accordion-header">
                    <div class="customer-card-top">
                        <div class="customer-avatar">${initials}</div>
                        <div class="customer-summary">
                            <span class="customer-name">${customer.name}</span>
                            <span class="customer-phone">${customer.phone}</span>
                        </div>
                        <i class="fa-solid fa-chevron-down accordion-arrow"></i>
                    </div>
                    <div class="customer-card-stats">
                        <div class="stat-item">
                            <i class="fa-solid fa-file-contract"></i>
                            <span>${totalRentals} Kiralama</span>
                        </div>
                        <div class="stat-item ${hasActiveRental ? 'active-rental' : 'no-active-rental'}">
                            <i class="fa-solid ${hasActiveRental ? 'fa-key' : 'fa-check'}"></i>
                            <span>${hasActiveRental ? 'Aktif Kiralaması Var' : 'Aktif Kiralaması Yok'}</span>
                        </div>
                    </div>
                </button>
                <div class="accordion-content">
                    <div class="customer-details-grid">
                        <div class="detail-item"><strong>TC Kimlik No:</strong><span>${customer.tc}</span></div>
                        <div class="detail-item"><strong>Email:</strong><span>${customer.email || '-'}</span></div>
                        <div class="detail-item"><strong>Ehliyet No:</strong><span>${customer.licenseNumber || '-'}</span></div>
                        <div class="detail-item"><strong>Ehliyet Tarihi:</strong><span>${customer.licenseDate || '-'}</span></div>
                        <div class="detail-item full-width"><strong>Adres:</strong><span>${customer.address || '-'}</span></div>
                    </div>
                    
                    <div class="accordion-section">
                        <div class="accordion-section-header">
                            <h4>Belgeler</h4>
                        </div>
                        <div class="card-documents">
                            <div class="document-item">
                                <div class="document-info"><i class="fa-solid fa-id-card"></i><span>Kimlik</span></div>
                                ${customer.idFile ? 
                                    `<a href="${customer.idFileUrl || '#'}" target="_blank" class="btn-view" title="${customer.idFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` : 
                                    `<button class="btn-upload btn-edit-customer"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                            </div>
                            <div class="document-item">
                                <div class="document-info"><i class="fa-solid fa-id-card-clip"></i><span>Ehliyet</span></div>
                                ${customer.licenseFile ? 
                                    `<a href="${customer.licenseFileUrl || '#'}" target="_blank" class="btn-view" title="${customer.licenseFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` : 
                                    `<button class="btn-upload btn-edit-customer"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                            </div>
                        </div>
                    </div>

                    <div class="accordion-section">
                        <div class="accordion-section-header">
                            <h4>Kiralama Geçmişi</h4>
                        </div>
                        ${customerRentals.length > 0 ? `
                            <table class="rental-history-table">
                                <thead>
                                    <tr>
                                        <th>Plaka</th>
                                        <th>Tarih Aralığı</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${customerRentals.map(rental => {
                                        const startDate = rental.startDate ? new Date(rental.startDate).toLocaleDateString('tr-TR') : '-';
                                        const endDate = rental.endDate ? new Date(rental.endDate).toLocaleDateString('tr-TR') : '-';
                                        const statusText = rental.status === 'active' ? 'Aktif' : 'Tamamlandı';
                                        return `
                                        <tr>
                                            <td>${rental.vehiclePlate}</td>
                                            <td>${startDate} - ${endDate}</td>
                                            <td><span class="status-badge ${rental.status === 'completed' ? 'available' : 'rented'}">${statusText}</span></td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="no-history">Bu müşterinin kiralama geçmişi bulunmuyor.</p>'}
                    </div>
                    <div class="accordion-section accordion-footer-actions">
                        <button class="btn btn-secondary btn-edit-customer">
                            <i class="fa-solid fa-user-pen"></i> Müşteriyi Düzenle
                        </button>
                        <button class="btn btn-danger btn-delete-customer">
                            <i class="fa-solid fa-user-slash"></i> Müşteriyi Sil
                        </button>
                    </div>
                </div>
            </div>
        `}).join('')}
    </div>
    `;
};
const ReservationsPage = (): string => {
    const getCustomerName = (customerId: number) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen Müşteri';
    };
    const getVehicleBrand = (plate: string) => {
        const vehicle = vehiclesData.find(v => v.plate === plate);
        return vehicle ? vehicle.brand : 'Bilinmeyen Araç';
    }
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR');

    return `
    <header class="page-header">
        <h1>Rezervasyon Yönetimi</h1>
        <p>Gelecek ve geçmiş tüm rezervasyonları görüntüleyin.</p>
    </header>
    <div class="page-actions">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i> 
            <input type="text" id="reservation-search" placeholder="Plaka veya müşteri adı ara..." value="${state.searchTerm}">
        </div>
        <button class="btn btn-primary" id="add-reservation-btn">
            <i class="fa-solid fa-calendar-plus"></i> 
            Yeni Rezervasyon Ekle
        </button>
    </div>
    <div class="reservations-list">
        ${reservationsData.map(res => `
            <div class="reservation-card" data-reservation-id="${res.id}">
                <div class="reservation-card-header">
                    <div class="reservation-vehicle">
                        <i class="fa-solid fa-car"></i>
                        <div>
                            <strong>${res.vehiclePlate}</strong>
                            <span>${getVehicleBrand(res.vehiclePlate)}</span>
                        </div>
                    </div>
                    <div class="status-badge ${getStatusClass(res.status)}">${res.status}</div>
                </div>
                <div class="reservation-card-body">
                    <div class="reservation-customer">
                        <i class="fa-solid fa-user"></i>
                        <span>${getCustomerName(res.customerId)}</span>
                    </div>
                    <div class="reservation-details">
                        <div class="detail-item">
                            <i class="fa-solid fa-calendar-arrow-down"></i>
                            <span>${formatDate(res.startDate)}</span>
                        </div>
                        <i class="fa-solid fa-arrow-right-long"></i>
                        <div class="detail-item">
                            <i class="fa-solid fa-calendar-arrow-up"></i>
                            <span>${formatDate(res.endDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="reservation-card-footer">
                    <div class="delivery-location">
                        <i class="fa-solid fa-map-location-dot"></i>
                        <span>Teslim Yeri: <strong>${res.deliveryLocation}</strong></span>
                    </div>
                    ${res.notes ? `<div class="reservation-notes" data-tooltip="${res.notes}"><i class="fa-solid fa-comment-dots"></i> Not Var</div>` : ''}
                </div>
                <div class="card-actions">
                    <div class="action-icons">
                        <button class="action-btn btn-edit-reservation" title="Düzenle"><i class="fa-solid fa-pencil"></i></button>
                        <button class="action-btn btn-delete-reservation" title="Sil"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    `;
};

const MaintenancePage = (): string => {
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('tr-TR');
    const formatKm = (km: number) => km.toLocaleString('tr-TR') + ' KM';

    return `
    <header class="page-header">
        ${state.searchTerm ? `<div class="filter-indicator">
            <i class="fa-solid fa-filter"></i> <span>Filtreleniyor: <strong>${state.searchTerm}</strong></span>
            <button id="clear-maintenance-filter" title="Filtreyi Temizle"><i class="fa-solid fa-xmark"></i></button>
        </div>` : ''}
        <h1>Bakım Geçmişi</h1>
        <p>Araçların bakım kayıtlarını yönetin.</p>
    </header>
    <div class="page-actions">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i> 
            <input type="text" id="maintenance-search" placeholder="Plaka veya bakım tipi ara..." value="${state.searchTerm}">
        </div>
        <button class="btn btn-primary" id="add-maintenance-btn">
            <i class="fa-solid fa-oil-can"></i> 
            Yeni Bakım Kaydı
        </button>
    </div>
    <div class="maintenance-list">
        ${maintenanceData
            .filter(m => 
                !state.searchTerm || 
                m.vehiclePlate.toLowerCase().includes(state.searchTerm.toLowerCase())
            ).map(maint => `
            <div class="maintenance-card" data-maintenance-id="${maint.id}">
                <div class="maintenance-card-header">
                    <h3>${maint.vehiclePlate}</h3>
                    <div class="action-icons">
                        <button class="action-btn btn-edit-maintenance" title="Düzenle"><i class="fa-solid fa-pencil"></i></button>
                        <button class="action-btn btn-delete-maintenance" title="Sil"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="maintenance-card-body">
                    <div class="maintenance-section">
                        <h4>Yapılan Bakım</h4>
                        <div class="maintenance-detail"><strong>Tarih:</strong><span>${formatDate(maint.maintenanceDate)}</span></div>
                        <div class="maintenance-detail"><strong>Kilometre:</strong><span>${formatKm(maint.maintenanceKm)}</span></div>
                        <div class="maintenance-detail"><strong>Tür:</strong><span>${maint.type}</span></div>
                        <div class="maintenance-detail"><strong>Maliyet:</strong><span>₺${maint.cost.toLocaleString('tr-TR')}</span></div>
                        <p class="maintenance-description">${maint.description}</p>
                    </div>
                    <div class="maintenance-section next-due">
                        <h4>Sonraki Bakım</h4>
                        <div class="maintenance-detail">
                            <i class="fa-solid fa-road"></i>
                            <span>${formatKm(maint.nextMaintenanceKm)}</span>
                        </div>
                        <div class="maintenance-detail">
                            <i class="fa-solid fa-calendar-alt"></i>
                            <span>${formatDate(maint.nextMaintenanceDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
        ${maintenanceData.length === 0 ? '<p class="no-data-item">Henüz bakım kaydı bulunmuyor.</p>' : ''}
    </div>
    `;
};

const SettingsPage = (): string => { // Tamamen yeniden yazıldı

  // 🔒 NULL CHECK: state.settings kontrolü
  if (!state.settings) {
    return `
      <header class="page-header">
          <h1>Ayarlar</h1>
          <p>Uygulama ayarları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
      </header>
      <div class="error-message" style="padding: 20px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px 0;">
          <i class="fa-solid fa-exclamation-triangle" style="color: #dc2626;"></i>
          <strong>Ayarlar yüklenemedi:</strong> state.settings tanımlı değil. Uygulamayı yeniden başlatmayı deneyin.
      </div>
    `;
  }

  // 🔒 Güvenli değişken tanımlamaları - nested objeler için
  const companyInfo = state.settings.companyInfo || {};
  const pdfSettings = state.settings.pdfSettings || {};
  const firebaseConfig = state.settings.firebaseConfig || {};

  const createSettingCard = (title: string, content: string) => `
      <div class="setting-content-card">
          <h4>${title}</h4>
          ${content}
      </div>
  `;

  const createCheckbox = (id: string, label: string, checked = true) => `
      <div class="setting-checkbox">
          <input type="checkbox" id="${id}" data-setting-key="${id}" ${checked ? 'checked' : ''}>
          <label for="${id}">${label}</label>
      </div>
  `;

  const createColorTag = (label: string, colorVar: string) => `
      <div class="setting-color-tag">
          <span class="color-swatch" style="background-color: var(${colorVar})"></span>
          ${label}
      </div>
  `;

  const sections = [
      {
          icon: 'fa-chart-pie',
          title: 'Gösterge Paneli',
          content: `
              ${createSettingCard('Metrik Görünürlüğü', `
                  ${createCheckbox('db_metric_total', 'Toplam Araç Kartı', state.settings?.db_metric_total ?? true)}
                  ${createCheckbox('db_metric_rented', 'Aktif Kiralama Kartı', state.settings?.db_metric_rented ?? true)}
                  ${createCheckbox('db_metric_maintenance', 'Bakımdaki Araçlar Kartı', state.settings?.db_metric_maintenance ?? true)}
                  ${createCheckbox('db_metric_income', 'Aylık Gelir Kartı', state.settings?.db_metric_income ?? true)}
              `)}
              ${createSettingCard('Panel Görünürlüğü', `
                  <p class="setting-description">Ana sayfadaki panellerin görünürlüğünü yönetin.</p>
                  ${createCheckbox('db_panel_reminders', 'Yaklaşan Hatırlatmalar Paneli')}
                  ${createCheckbox('db_panel_quick_access', 'Hızlı İşlemler Paneli')}
                  ${createCheckbox('db_panel_activities', 'Son İşlemler Paneli')}
                  ${createCheckbox('db_panel_distribution', 'Filo Durum Dağılımı Paneli')}
              `)}
          `
      },
      {
          icon: 'fa-car',
          title: 'Araç ve Hatırlatmalar',
          content: `
              ${createSettingCard('Hatırlatma Süresi', `
                  <p class="setting-description">Sigorta ve muayene gibi uyarıların kaç gün önceden gösterileceğini belirleyin.</p>
                  <input type="number" class="setting-input" data-setting-key="reminder_days" value="${state.settings?.reminder_days ?? 30}">
              `)}
              ${createSettingCard('Araç Kartı Butonları', `
                  <p class="setting-description">Araçlar sayfasındaki kartlarda görünecek işlem butonlarını seçin.</p>
                  ${createCheckbox('vehicle_btn_rent', 'Kirala Butonu', state.settings?.vehicle_btn_rent ?? true)}
                  ${createCheckbox('vehicle_btn_checkin', 'Teslim Al Butonu', state.settings?.vehicle_btn_checkin ?? true)}
                  ${createCheckbox('vehicle_btn_edit', 'Düzenle Butonu', state.settings?.vehicle_btn_edit ?? true)}
              `)}
          `
      },
      {
          icon: 'fa-bell',
          title: 'Bildirimler',
          content: `
              ${createSettingCard('Bildirim Türleri', `
                  <p class="setting-description">Hangi durumlarda bildirim almak istediğinizi seçin.</p>
                  ${createCheckbox('notif_type_insurance', 'Sigorta Bitiş Uyarısı', state.settings?.notif_type_insurance ?? true)}
                  ${createCheckbox('notif_type_inspection', 'Muayene Bitiş Uyarısı', state.settings?.notif_type_inspection ?? true)}
                  ${createCheckbox('notif_type_activity', 'Yeni Sistem Aktiviteleri', state.settings?.notif_type_activity ?? true)}
              `)}
          `
      },
      {
          icon: 'fa-solid fa-file-invoice',
          title: 'PDF & Rapor Ayarları',
          content: `
              ${createSettingCard('Şirket Bilgileri', `
                  <p class="setting-description">Raporlarda görünecek şirket bilgilerini buradan düzenleyebilirsiniz.</p>
                  <div class="form-group" style="margin-bottom: 12px;"><label>Şirket Ünvanı</label><input type="text" class="setting-input" data-company-key="name" value="${companyInfo.name || 'Rehber Rent a Car'}"></div>
                  <div class="form-group" style="margin-bottom: 12px;"><label>Adres</label><input type="text" class="setting-input" data-company-key="address" value="${companyInfo.address || 'Örnek Mah. Test Sk. No:1, İstanbul'}"></div>
                  <div class="form-row" style="margin-bottom: 12px;">
                      <div class="form-group"><label>Telefon</label><input type="text" class="setting-input" data-company-key="phone" value="${companyInfo.phone || '0212 123 45 67'}"></div>
                      <div class="form-group"><label>E-posta</label><input type="email" class="setting-input" data-company-key="email" value="${companyInfo.email || 'info@rehberrent.com'}"></div>
                  </div>
                  <div class="form-group"><label>IBAN / Hesap Bilgileri</label><input type="text" class="setting-input" data-company-key="iban" value="${companyInfo.iban || 'TR00 0000 0000 0000 0000 0000'}"></div>
              `)}
              ${createSettingCard('Logo ve Görünüm', `
                  <div class="file-upload-group" style="padding:0; border:0; background: transparent;">
                      <div class="file-input-wrapper">
                          <span><i class="fa-solid fa-image"></i> Logo Yükle (PNG/JPG)</span>
                          <input type="file" id="companyLogoFile" accept=".png,.jpg,.jpeg">
                      </div>
                      ${companyInfo.logo ? `
                        <div class="logo-preview-container">
                            <img src="${companyInfo.logo}" alt="Logo Önizleme" class="logo-preview-img"/>
                            <button id="remove-logo-btn" class="btn-remove-logo" title="Logoyu Kaldır"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      ` : ''}
                  </div>
                  <hr>
                  <div class="file-upload-group" style="padding:0; border:0; background: transparent;">
                      <div class="file-input-wrapper">
                          <span><i class="fa-solid fa-image"></i> PDF Arka Planı (PNG/JPG)</span>
                          <input type="file" id="companyPdfBackgroundFile" accept=".png,.jpg,.jpeg">
                      </div>
                      ${companyInfo.pdfBackground ? `
                        <div class="logo-preview-container">
                            <img src="${companyInfo.pdfBackground}" alt="Arka Plan Önizleme" class="logo-preview-img"/>
                            <button id="remove-pdf-background-btn" class="btn-remove-logo" title="Arka Planı Kaldır"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      ` : ''}
                  </div>
                  ${createCheckbox('pdf_show_logo', 'Logoyu Raporlarda Göster', pdfSettings.showLogo ?? true)}
                  ${createCheckbox('pdf_show_background', 'Arka Planı Raporlarda Göster', pdfSettings.showBackground ?? true)}
                  ${createCheckbox('pdf_show_footer', 'Alt Bilgiyi (Adres, Tel vb.) Göster', pdfSettings.showFooter ?? true)}
              `)}
          `
      },
      {
          icon: 'fa-palette',
          title: 'Görünüm ve Tema',
          content: `
              <div class="setting-card">
                  <div class="setting-info">
                      <h3>Karanlık Mod</h3>
                      <p>Uygulama arayüzünü açık veya koyu tema arasında değiştirin.</p>
                  </div>
                  <div class="theme-switcher">
                      <i class="fa-solid fa-sun"></i>
                      <label class="switch">
                          <input type="checkbox" id="theme-toggle" ${state.theme === 'dark' ? 'checked' : ''} />
                          <span class="slider round"></span>
                      </label>
                      <i class="fa-solid fa-moon"></i>
                  </div>
              </div>
          `
      },
      {
          icon: 'fa-brands fa-google',
          title: 'Firebase Senkronizasyon',
          content: `
              ${createSettingCard('Firebase Bağlantı Ayarları', `
                  <p class="setting-description">Firebase Realtime Database ile verilerinizi senkronize edin. Farklı cihazlardan erişim sağlayın.</p>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>API Key <span style="color: #ef4444;">*</span></label>
                      <input type="text" class="setting-input" id="firebase-apiKey" value="${firebaseConfig.apiKey || ''}" placeholder="AIzaSyD...">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Auth Domain</label>
                      <input type="text" class="setting-input" id="firebase-authDomain" value="${firebaseConfig.authDomain || ''}" placeholder="project-id.firebaseapp.com">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Database URL <span style="color: #ef4444;">*</span></label>
                      <input type="text" class="setting-input" id="firebase-databaseURL" value="${firebaseConfig.databaseURL || ''}" placeholder="https://project-id.firebaseio.com">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Project ID</label>
                      <input type="text" class="setting-input" id="firebase-projectId" value="${firebaseConfig.projectId || ''}" placeholder="project-id">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Storage Bucket</label>
                      <input type="text" class="setting-input" id="firebase-storageBucket" value="${firebaseConfig.storageBucket || ''}" placeholder="project-id.appspot.com">
                  </div>
                  <div class="form-row" style="margin-bottom: 12px;">
                      <div class="form-group">
                          <label>Messaging Sender ID</label>
                          <input type="text" class="setting-input" id="firebase-messagingSenderId" value="${firebaseConfig.messagingSenderId || ''}" placeholder="123456789">
                      </div>
                      <div class="form-group">
                          <label>App ID</label>
                          <input type="text" class="setting-input" id="firebase-appId" value="${firebaseConfig.appId || ''}" placeholder="1:123:web:abc">
                      </div>
                  </div>
                  ${createCheckbox('firebase_enabled', 'Firebase Senkronizasyonu Aktif', state.settings?.firebaseEnabled || false)}
                  ${createCheckbox('firebase_auto_sync', 'Otomatik Senkronizasyon (Uygulama Açılışında)', state.settings?.firebaseAutoSync || false)}
                  
                  <div class="form-group" style="margin-top: 16px; padding: 12px; background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px;">
                      <label style="display: flex; align-items: center; gap: 8px; color: #92400e; font-weight: 600;">
                          <i class="fa-solid fa-lock"></i> Ana Şifre (Güvenlik)
                      </label>
                      <input 
                          type="password" 
                          class="setting-input" 
                          id="firebase-master-password" 
                          data-setting-key="firebaseMasterPassword"
                          value="${state.settings?.firebaseMasterPassword || ''}"
                          placeholder="Firebase senkronizasyonu için ana şifre"
                          style="margin-top: 8px;"
                      >
                      <small style="display: block; margin-top: 8px; color: #92400e; font-size: 12px;">
                          <i class="fa-solid fa-info-circle"></i> Bu şifre olmadan Firebase'den veri çekilemez. Yabancı kişilerin verilerinize erişmesini engeller.
                      </small>
                  </div>
                  
                  <div class="backup-restore-buttons" style="margin-top: 16px;">
                      <button class="btn btn-primary" id="btn-test-firebase" ${!state.settings?.firebaseConfig?.apiKey || !state.settings?.firebaseConfig?.databaseURL ? 'disabled' : ''}>
                          <i class="fa-solid fa-plug"></i> Bağlantıyı Test Et
                      </button>
                  </div>
              `)}
              ${createSettingCard('Veri Senkronizasyonu', `
                  <p class="setting-description">Verilerinizi Firebase ile senkronize edin. Tüm araçlar, müşteriler, kiralamalar ve ayarlar yedeklenecektir.</p>
                  <div class="backup-restore-buttons">
                      <button class="btn btn-success" id="btn-send-to-firebase" ${!state.settings?.firebaseEnabled ? 'disabled' : ''}>
                          <i class="fa-solid fa-cloud-arrow-up"></i> Firebase'e Gönder
                      </button>
                      <button class="btn btn-info" id="btn-fetch-from-firebase" ${!state.settings?.firebaseEnabled ? 'disabled' : ''}>
                          <i class="fa-solid fa-cloud-arrow-down"></i> Firebase'den Al
                      </button>
                  </div>
                  <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 6px; font-size: 13px; color: #92400e;">
                      <i class="fa-solid fa-info-circle"></i> <strong>Bilgi:</strong> Firebase ayarlarını kaydettiğinizde, sayfa kapatılırken verileriniz otomatik olarak senkronize edilecektir.
                  </div>
              `)}
          `
      },
      {
          icon: 'fa-solid fa-mobile-screen',
          title: 'PWA (Mobil Uygulama)',
          content: `
              ${createSettingCard('Masaüstü/Ana Ekran Kurulumu', `
                  <p class="setting-description">Bu uygulamayı bilgisayarınıza veya telefonunuzun ana ekranına ekleyerek hızlı erişim sağlayın.</p>
                  <div class="pwa-info-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                      <i class="fa-solid fa-mobile-screen" style="font-size: 48px; margin-bottom: 12px;"></i>
                      <h4 style="margin: 0 0 8px 0; color: white;">Progressive Web App</h4>
                      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Offline çalışma, hızlı yükleme ve mobil deneyim</p>
                  </div>
                  <div class="backup-restore-buttons">
                      <button class="btn btn-primary" id="btn-install-pwa">
                          <i class="fa-solid fa-download"></i> Uygulamayı Kur
                      </button>
                  </div>
                  <div style="margin-top: 16px; padding: 12px; background: #e0f2fe; border-radius: 6px; font-size: 13px; color: #0c4a6e;">
                      <p style="margin: 0 0 8px 0;"><i class="fa-solid fa-check-circle"></i> <strong>Offline Çalışma:</strong> İnternet bağlantısı olmadan kullanın</p>
                      <p style="margin: 0 0 8px 0;"><i class="fa-solid fa-check-circle"></i> <strong>Hızlı Yükleme:</strong> Anında açılış süresi</p>
                      <p style="margin: 0;"><i class="fa-solid fa-check-circle"></i> <strong>Ana Ekranda:</strong> Uygulama gibi kullanın</p>
                  </div>
              `)}
          `
      },
      {
          icon: 'fa-solid fa-database',
          title: 'Yedekleme ve Geri Yükleme',
          content: `
              ${createSettingCard('Veri Yönetimi', `
                  <p class="setting-description">Uygulama verilerinizi (araçlar, müşteriler, kiralamalar vb.) bir JSON dosyası olarak yedekleyin veya daha önce aldığınız bir yedeği geri yükleyin.</p>
                  <div class="backup-restore-buttons">
                      <button class="btn btn-secondary" id="btn-export-data"><i class="fa-solid fa-download"></i> Verileri Dışa Aktar</button>
                      <button class="btn btn-secondary" id="btn-import-data"><i class="fa-solid fa-upload"></i> Verileri İçe Aktar</button>
                      <input type="file" id="import-file-input" accept=".json" style="display: none;">
                  </div>
              `)}
          `
      }
  ];

  const accordionsHTML = sections.map(section => `
      <div class="settings-accordion">
          <button class="settings-accordion-header">
              <div class="accordion-title">
                  <i class="fa-solid ${section.icon}"></i>
                  <span>${section.title}</span>
              </div>
              <i class="fa-solid fa-chevron-right accordion-arrow"></i>
          </button>
          <div class="settings-accordion-content">
              <div class="accordion-content-inner">
                  ${section.content}
              </div>
          </div>
      </div>
  `).join('');

  return `
      <header class="page-header">
          <h1>Ayarlar</h1>
          <p>Uygulama genelindeki tercihlerinizi ve görünümleri yönetin.</p>
      </header>
      <div class="settings-body">
          ${accordionsHTML}
      </div>
      <div class="settings-footer">
          <button class="btn-gradient-reset" disabled>Sıfırla</button>
          <button class="btn-gradient-save">Değişiklikleri Kaydet</button>
      </div>
  `;
};

const NotificationsPage = (): string => {
    const allNotifications: any[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const daysUntil = (dateStr: string | null): number => {
        if (!dateStr) return Infinity;
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getReminderText = (days: number) => {
        if (days < 0) return 'Geçti!';
        if (days === 0) return 'Bugün Son Gün!';
        if (days === 1) return 'Yarın Son Gün!';
        return `Son ${days} gün`;
    };

    // 1. Hatırlatmaları ekle
    vehiclesData.forEach((v, index) => {
        const insuranceDays = daysUntil(v.insuranceDate);
        if (insuranceDays >= 0 && insuranceDays <= 30) {
            allNotifications.push({ type: 'reminder', urgency: insuranceDays <= 7 ? 'urgent' : 'warning', icon: 'fa-shield-halved', message: `<strong>${v.plate}</strong> plakalı aracın sigortası yaklaşıyor.`, time: new Date(v.insuranceDate), daysText: getReminderText(insuranceDays), vehicleIndex: index });
        }
        const inspectionDays = daysUntil(v.inspectionDate);
        if (inspectionDays >= 0 && inspectionDays <= 30) {
            allNotifications.push({ type: 'reminder', urgency: inspectionDays <= 7 ? 'urgent' : 'warning', icon: 'fa-clipboard-check', message: `<strong>${v.plate}</strong> plakalı aracın muayenesi yaklaşıyor.`, time: new Date(v.inspectionDate), daysText: getReminderText(inspectionDays), vehicleIndex: index });
        }
    });
    maintenanceData.forEach(m => {
        const maintenanceDays = daysUntil(m.nextMaintenanceDate);
        if (maintenanceDays >= 0 && maintenanceDays <= 30) {
            const vehicleIndex = vehiclesData.findIndex(v => v.plate === m.vehiclePlate);
            allNotifications.push({ type: 'reminder', urgency: maintenanceDays <= 7 ? 'urgent' : 'warning', icon: 'fa-oil-can', message: `<strong>${m.vehiclePlate}</strong> plakalı aracın periyodik bakımı yaklaşıyor.`, time: new Date(m.nextMaintenanceDate), daysText: getReminderText(maintenanceDays), vehicleIndex });
        }
    });

    // 2. Son aktiviteleri ekle
    activitiesData.forEach(activity => {
        allNotifications.push({ type: 'activity', urgency: 'normal', icon: activity.icon, message: activity.message, time: activity.time });
    });

    // 3. Hepsini tarihe göre sırala
    allNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());

    const renderNotificationCard = (notification: any) => {
        const timeAgo = formatTimeAgo(notification.time);
        const isClickable = notification.type === 'reminder' && notification.vehicleIndex !== undefined && notification.vehicleIndex !== null;
        return `
            <div class="notification-card ${notification.urgency} ${isClickable ? 'clickable' : ''}" 
                 data-notification-id="${notification.time.getTime()}" 
                 ${isClickable ? `data-vehicle-index="${notification.vehicleIndex}"` : ''}>
                <div class="notification-icon">
                    <i class="fa-solid ${notification.icon}"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-message">${notification.message}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                ${notification.type === 'reminder' ? `<div class="notification-extra">${notification.daysText}</div>` : ''}
            </div>
        `;
    };

    return `
        <header class="page-header">
        <h1>Bildirimler</h1>
        <p>Uygulamadaki tüm önemli güncellemeler ve hatırlatmalar.</p>
        </header>
        <div class="notifications-container">
            ${allNotifications.length > 0 ? allNotifications.map(renderNotificationCard).join('') : '<p class="no-data-item">Gösterilecek bildirim yok.</p>'}
        </div>
    `;
};

const RentalsPage = (): string => {
    const getCustomerName = (customerId: number) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen Müşteri';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return `
    <header class="page-header">
        <h1>Kiralama Geçmişi</h1>
        <p>Tüm aktif ve tamamlanmış kiralamaları görüntüleyin.</p>
    </header>
    <div class="page-actions">
        <div class="search-bar">
            <i class="fa-solid fa-magnifying-glass"></i> 
            <input type="text" id="rental-search" placeholder="Plaka veya müşteri adı ara..." value="${state.searchTerm}">
        </div>
    </div>
    <div class="rentals-list">
        ${rentalsData
            .map(rental => {
                const customerName = getCustomerName(rental.customerId);
                return { ...rental, customerName };
            })
            .filter(rental => 
                rental.vehiclePlate.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                rental.customerName.toLowerCase().includes(state.searchTerm.toLowerCase())
            )
            .map(rental => `
            <div class="rental-card" data-rental-id="${rental.id}" data-status="${rental.status}">
                <div class="rental-card-header">
                    <div class="rental-card-title">
                        <h3>${rental.vehiclePlate}</h3>
                        <span>- ${rental.customerName}</span>
                    </div>
                    <div class="status-badge ${getStatusClass(rental.status)}">
                        ${rental.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                    </div>
                </div>
                <div class="rental-card-body">
                    <div class="rental-info-item">
                        <strong>Başlangıç:</strong>
                        <span>${formatDate(rental.startDate)}</span>
                    </div>
                    <div class="rental-info-item">
                        <strong>Bitiş:</strong>
                        <span>${formatDate(rental.endDate)}</span>
                    </div>
                    <div class="rental-info-item">
                        <strong>Başlangıç KM:</strong>
                        <span>${rental.startKm.toLocaleString('tr-TR')}</span>
                    </div>
                    <div class="rental-info-item">
                        <strong>Bitiş KM:</strong>
                        <span>${rental.endKm ? rental.endKm.toLocaleString('tr-TR') : '...'}</span>
                    </div>
                    <div class="rental-info-item">
                        <strong>Toplam Ücret:</strong>
                        <span>${rental.totalCost ? `₺${rental.totalCost.toLocaleString('tr-TR')}` : '...'}</span>
                    </div>
                </div>
                <div class="rental-card-footer">
                    <div class="document-buttons">
                        ${rental.contractFile ? 
                            `<button data-action="view-doc" data-doc-url="${rental.contractFileUrl}" class="btn-icon" title="Sözleşmeyi Görüntüle"><i class="fa-solid fa-file-contract"></i></button>` :
                            `<button data-action="upload-doc" class="btn-icon" title="Sözleşme Yükle"><i class="fa-solid fa-upload"></i></button>`
                        }
                        ${rental.invoiceFile ? 
                            `<button data-action="view-doc" data-doc-url="${rental.invoiceFileUrl}" class="btn-icon" title="Faturayı Görüntüle"><i class="fa-solid fa-file-invoice-dollar"></i></button>` :
                            `<button data-action="upload-doc" class="btn-icon" title="Fatura Yükle"><i class="fa-solid fa-upload"></i></button>`
                        }
                    </div>
                    <div class="action-icons">
                        <button data-action="edit-rental" class="action-btn" title="Düzenle"><i class="fa-solid fa-pencil"></i></button>
                        <button data-action="delete-rental" class="action-btn" title="Sil"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `).join('')}
        ${rentalsData.length === 0 ? '<p class="no-data-item">Henüz kiralama kaydı bulunmuyor.</p>' : ''}
    </div>
    `;
};

const ReportsPage = (): string => {
    const getCustomerName = (customerId: number) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '...';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return `
    <header class="page-header">
        <h1>Rapor Oluşturma</h1>
        <p>Belirli kayıtlar için özet raporlar ve belgeler oluşturun.</p>
    </header>
    <div class="reports-container">
        <div class="report-generator-card">
            <div class="report-generator-header">
                <div class="report-icon-wrapper">
                    <i class="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div class="report-title">
                    <h3>Kiralama Özeti Raporu</h3>
                    <p>Tamamlanmış veya aktif bir kiralama için PDF özeti oluşturun.</p>
                </div>
            </div>
            <div class="report-generator-body">
                <div class="report-controls">
                    <select id="report-rental-select" class="custom-select">
                        <option value="">-- Kiralama Kaydı Seçin --</option>
                        ${rentalsData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(rental => `
                            <option value="${rental.id}">
                                ${rental.vehiclePlate} | ${getCustomerName(rental.customerId)} | ${formatDate(rental.startDate)}
                            </option>
                        `).join('')}
                    </select>
                    <button id="generate-report-btn" class="btn-gradient-generate" disabled>
                        <i class="fa-solid fa-file-arrow-down"></i>
                        <span>PDF Oluştur</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
};


const PlaceholderPage = (pageName: string, icon: string): string => {
    return `
    <div class="placeholder-page">
        <i class="fa-solid ${icon}"></i>
        <h1>${pageName}</h1>
        <p>Bu sayfa yapım aşamasındadır. Çok yakında...</p>
    </div>
    `;
};

const VehicleModal = () => {
    const isEditing = state.editingVehicleIndex !== null;
    const vehicle = isEditing ? vehiclesData[state.editingVehicleIndex] : null;
    const modelParts = vehicle?.brand.split(' ') || ['', ''];
    const brand = modelParts[0];
    const model = modelParts.slice(1).join(' ');

    return `
    <div class="modal-overlay" id="vehicle-modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2>${isEditing ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}</h2>
                <button class="close-modal-btn" data-modal-id="vehicle-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="vehicle-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="plate">Plaka</label>
                        <input type="text" id="plate" name="plate" placeholder="34 ABC 123" value="${vehicle?.plate || ''}" required ${isEditing ? 'readonly' : ''} oninput="this.value = this.value.toUpperCase()">
                    </div>
                    <div class="form-group">
                        <label for="km">Kilometre</label>
                        <input type="number" id="km" name="km" placeholder="Örn: 85000" value="${vehicle?.km.replace(/,/, '') || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="brand">Marka</label>
                        <input type="text" id="brand" name="brand" placeholder="Ford" value="${brand || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="model">Model</label>
                        <input type="text" id="model" name="model" placeholder="Focus" value="${model || ''}" required>
                    </div>
                </div>
                 <div class="form-group">
                    <label for="status">Durum</label>
                    <select id="status" name="status" value="${vehicle?.status || 'Müsait'}">
                        <option value="Müsait" ${vehicle?.status === 'Müsait' ? 'selected' : ''}>Müsait</option>
                        <option value="Kirada" ${vehicle?.status === 'Kirada' ? 'selected' : ''}>Kirada</option>
                        <option value="Bakımda" ${vehicle?.status === 'Bakımda' ? 'selected' : ''}>Bakımda</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="insuranceDate">Sigorta Bitiş Tarihi</label>
                        <input type="date" id="insuranceDate" name="insuranceDate" value="${vehicle?.insuranceDate || ''}">
                    </div>
                    <div class="form-group">
                        <label for="inspectionDate">Muayene Bitiş Tarihi</label>
                        <input type="date" id="inspectionDate" name="inspectionDate" value="${vehicle?.inspectionDate || ''}">
                    </div>
                </div>
                <div class="file-upload-group">
                    <label>Belge Yükleme</label>
                    <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-shield-halved"></i> Sigorta</span>
                         <input type="file" id="insuranceFile" name="insuranceFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                     <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-clipboard-check"></i> Muayene</span>
                         <input type="file" id="inspectionFile" name="inspectionFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                     <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-id-card"></i> Ruhsat</span>
                         <input type="file" id="licenseFile" name="licenseFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="vehicle-modal">İptal</button>
                <button type="submit" form="vehicle-form" class="btn btn-primary">${isEditing ? 'Değişiklikleri Kaydet' : 'Aracı Kaydet'}</button>
            </div>
        </div>
    </div>
`};

const CustomerModal = () => {
    const isEditing = state.editingCustomerIndex !== null;
    const customer = isEditing ? customersData[state.editingCustomerIndex] : null;

    return `
    <div class="modal-overlay" id="customer-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>${isEditing ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</h2>
                <button class="close-modal-btn" data-modal-id="customer-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="customer-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-name">Ad Soyad</label>
                        <input type="text" id="customer-name" name="name" value="${customer?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-tc">TC Kimlik No</label>
                        <input type="text" id="customer-tc" name="tc" value="${customer?.tc || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-phone">Telefon</label>
                        <input type="tel" id="customer-phone" name="phone" value="${customer?.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-email">Email</label>
                        <input type="email" id="customer-email" name="email" value="${customer?.email || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-license-number">Ehliyet No</label>
                        <input type="text" id="customer-license-number" name="licenseNumber" value="${customer?.licenseNumber || ''}">
                    </div>
                    <div class="form-group">
                        <label for="customer-license-date">Ehliyet Tarihi</label>
                        <input type="date" id="customer-license-date" name="licenseDate" value="${customer?.licenseDate || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="customer-address">Adres</label>
                    <input type="text" id="customer-address" name="address" value="${customer?.address || ''}">
                </div>
                <div class="file-upload-group">
                    <label>Belge Yükleme</label>
                    <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-id-card"></i> Kimlik</span>
                         <input type="file" id="idFile" name="idFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                     <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-id-card-clip"></i> Ehliyet</span>
                         <input type="file" id="licenseFile" name="licenseFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="customer-modal">İptal</button>
                <button type="submit" form="customer-form" class="btn btn-primary">${isEditing ? 'Değişiklikleri Kaydet' : 'Müşteriyi Kaydet'}</button>
            </div>
        </div>
    </div>
`};


const RentalModal = () => {
    const vehicle = state.selectedVehicleForAction as Vehicle;
    if (!vehicle) return '';

    const today = (vehicle as any).preselectedStartDate || new Date().toISOString().split('T')[0];
    const preselectedCustomerId = (vehicle as any).preselectedCustomerId || null;

    return `
    <div class="modal-overlay" id="rental-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Kiralama Başlat: ${vehicle.plate}</h2>
                <button class="close-modal-btn" data-modal-id="rental-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="rental-form">
                <input type="hidden" name="vehiclePlate" value="${vehicle.plate}">
                
                <!-- Customer Selection -->
                <div class="form-group">
                    <label>Müşteri</label>
                    <div class="segmented-control">
                        <input type="radio" id="customer-type-existing" name="customerType" value="existing" ${state.rentalFormCustomerType === 'existing' ? 'checked' : ''}>
                        <label for="customer-type-existing">Mevcut Müşteri</label>
                        
                        <input type="radio" id="customer-type-new" name="customerType" value="new" ${state.rentalFormCustomerType === 'new' ? 'checked' : ''}>
                        <label for="customer-type-new">Yeni Müşteri</label>
                    </div>
                </div>

                <!-- Existing Customer Dropdown -->
                <div class="form-group" id="existing-customer-section" style="display: flex;">
                    <select name="customerId" id="customer-id-select">
                        <option value="">Müşteri Seçiniz...</option>
                        ${customersData.map(c => `<option value="${c.id}" ${c.id === preselectedCustomerId ? 'selected' : ''}>${c.name} - ${c.phone}</option>`).join('')}
                    </select>
                </div>

                <!-- New Customer Fields -->
                <div id="new-customer-section" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-customer-name">Ad Soyad</label>
                            <input type="text" id="new-customer-name" name="newCustomerName">
                        </div>
                        <div class="form-group">
                            <label for="new-customer-tc">TC Kimlik No</label>
                            <input type="text" id="new-customer-tc" name="newCustomerTc">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="new-customer-phone">Telefon</label>
                            <input type="tel" id="new-customer-phone" name="newCustomerPhone">
                        </div>
                        <div class="form-group">
                            <label for="new-customer-email">Email</label>
                            <input type="email" id="new-customer-email" name="newCustomerEmail">
                        </div>
                    </div>
                </div>

                <!-- Rental Details -->
                <div class="form-row">
                    <div class="form-group">
                        <label for="rental-price">Ücret</label>
                        <input type="number" id="rental-price" name="price" placeholder="Örn: 1500" required>
                    </div>
                    <div class="form-group">
                        <label>Ücret Tipi</label>
                        <div class="segmented-control">
                            <input type="radio" id="price-type-daily" name="priceType" value="daily" checked>
                            <label for="price-type-daily">Günlük</label>
                            <input type="radio" id="price-type-monthly" name="priceType" value="monthly">
                            <label for="price-type-monthly">Aylık</label>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="start-date">Kiralama Tarihi</label>
                        <input type="date" id="start-date" name="startDate" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label for="start-km">Başlangıç Kilometresi</label>
                        <input type="number" id="start-km" name="startKm" value="${vehicle.km.replace(/,/, '')}">
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="rental-modal">İptal</button>
                <button type="submit" form="rental-form" class="btn btn-primary">Kiralamayı Onayla</button>
            </div>
        </div>
    </div>
`};

const ReservationModal = () => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div class="modal-overlay" id="reservation-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Yeni Rezervasyon</h2>
                <button class="close-modal-btn" data-modal-id="reservation-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="reservation-form">
                <div class="form-group">
                    <label for="reservation-vehicle-select">Araç</label>
                    <select name="vehiclePlate" id="reservation-vehicle-select" required>
                        <option value="">Araç Seçiniz...</option>
                        ${vehiclesData.map(v => `<option value="${v.plate}">${v.plate} - ${v.brand}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Müşteri</label>
                    <div class="segmented-control">
                        <input type="radio" id="res-customer-type-existing" name="customerType" value="existing" checked>
                        <label for="res-customer-type-existing">Mevcut Müşteri</label>
                        <input type="radio" id="res-customer-type-new" name="customerType" value="new">
                        <label for="res-customer-type-new">Yeni Müşteri</label>
                    </div>
                </div>

                <div class="form-group" id="res-existing-customer-section">
                    <select name="customerId" id="res-customer-id-select" required>
                        <option value="">Müşteri Seçiniz...</option>
                        ${customersData.map(c => `<option value="${c.id}">${c.name} - ${c.phone}</option>`).join('')}
                    </select>
                </div>

                <div id="res-new-customer-section" style="display: none;">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="res-new-customer-name">Ad Soyad</label>
                            <input type="text" id="res-new-customer-name" name="newCustomerName">
                        </div>
                        <div class="form-group">
                            <label for="res-new-customer-phone">Telefon</label>
                            <input type="tel" id="res-new-customer-phone" name="newCustomerPhone">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group"><label for="res-start-date">Başlangıç Tarihi</label><input type="date" id="res-start-date" name="startDate" value="${today}" required></div>
                    <div class="form-group"><label for="res-end-date">Bitiş Tarihi</label><input type="date" id="res-end-date" name="endDate" required></div>
                </div>
                <div class="form-group"><label for="res-delivery-location">Teslim Yeri</label><input type="text" id="res-delivery-location" name="deliveryLocation" placeholder="Örn: Havaalanı Gelen Yolcu" required></div>
                <div class="form-group"><label for="res-notes">Notlar</label><textarea id="res-notes" name="notes" rows="3" placeholder="Rezervasyon ile ilgili notlar..."></textarea></div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="reservation-modal">İptal</button>
                <button type="submit" form="reservation-form" class="btn btn-primary">Rezervasyonu Kaydet</button>
            </div>
        </div>
    </div>
    `;
};

const ReservationEditModal = () => {
    if (state.editingReservationId === null) return '';
    const reservation = reservationsData.find(r => r.id === state.editingReservationId);
    if (!reservation) return '';

    return `
    <div class="modal-overlay" id="reservation-edit-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Rezervasyonu Düzenle</h2>
                <button class="close-modal-btn" data-modal-id="reservation-edit-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="reservation-edit-form">
                <input type="hidden" name="reservationId" value="${reservation.id}">
                <div class="form-group">
                    <label for="reservation-edit-vehicle-select">Araç</label>
                    <select name="vehiclePlate" id="reservation-edit-vehicle-select" required>
                        ${vehiclesData.map(v => `<option value="${v.plate}" ${reservation.vehiclePlate === v.plate ? 'selected' : ''}>${v.plate} - ${v.brand}</option>`).join('')}
                    </select>
                </div>

                 <div class="form-group">
                    <label for="reservation-edit-customer-select">Müşteri</label>
                    <select name="customerId" id="reservation-edit-customer-select" required>
                        ${customersData.map(c => `<option value="${c.id}" ${reservation.customerId === c.id ? 'selected' : ''}>${c.name} - ${c.phone}</option>`).join('')}
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group"><label for="res-edit-start-date">Başlangıç Tarihi</label><input type="date" id="res-edit-start-date" name="startDate" value="${reservation.startDate}" required></div>
                    <div class="form-group"><label for="res-edit-end-date">Bitiş Tarihi</label><input type="date" id="res-edit-end-date" name="endDate" value="${reservation.endDate}" required></div>
                </div>
                <div class="form-group"><label for="res-edit-delivery-location">Teslim Yeri</label><input type="text" id="res-edit-delivery-location" name="deliveryLocation" value="${reservation.deliveryLocation}" required></div>
                <div class="form-group"><label for="res-edit-notes">Notlar</label><textarea id="res-edit-notes" name="notes" rows="3" placeholder="Rezervasyon ile ilgili notlar...">${reservation.notes || ''}</textarea></div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="reservation-edit-modal">İptal</button>
                <button type="submit" form="reservation-edit-form" class="btn btn-primary">Değişiklikleri Kaydet</button>
            </div>
        </div>
    </div>
    `;
};

const RentalEditModal = () => {
    if (state.editingRentalId === null) return '';
    const rental = rentalsData.find(r => r.id === state.editingRentalId);
    if (!rental) return '';

    const customer = customersData.find(c => c.id === rental.customerId);

    return `
    <div class="modal-overlay" id="rental-edit-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Kiramayı Düzenle: ${rental.vehiclePlate}</h2>
                <button class="close-modal-btn" data-modal-id="rental-edit-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="rental-edit-form">
                <input type="hidden" name="rentalId" value="${rental.id}">
                <div class="customer-info-display" style="margin-bottom: 16px;">
                    <h4>Müşteri</h4>
                    <p><i class="fa-solid fa-user"></i> ${customer?.name || 'Bilinmiyor'}</p>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-start-date">Başlangıç Tarihi</label>
                        <input type="date" id="edit-start-date" name="startDate" value="${rental.startDate}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-end-date">Bitiş Tarihi</label>
                        <input type="date" id="edit-end-date" name="endDate" value="${rental.endDate || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-start-km">Başlangıç KM</label>
                        <input type="number" id="edit-start-km" name="startKm" value="${rental.startKm}">
                    </div>
                    <div class="form-group">
                        <label for="edit-end-km">Bitiş KM</label>
                        <input type="number" id="edit-end-km" name="endKm" value="${rental.endKm || ''}">
                    </div>
                </div>

                <div class="file-upload-group">
                    <label>Belge Yükleme</label>
                    <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-file-contract"></i> Sözleşme</span>
                         <input type="file" name="contractFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                     <div class="file-input-wrapper">
                         <span><i class="fa-solid fa-file-invoice-dollar"></i> Fatura</span>
                         <input type="file" name="invoiceFile" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="rental-edit-modal">İptal</button>
                <button type="submit" form="rental-edit-form" class="btn btn-primary">Değişiklikleri Kaydet</button>
            </div>
        </div>
    </div>
`};

const MaintenanceEditModal = () => {
    if (state.editingMaintenanceId === null) return '';
    const maint = maintenanceData.find(m => m.id === state.editingMaintenanceId);
    if (!maint) return '';

    return `
    <div class="modal-overlay" id="maintenance-edit-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Bakım Kaydını Düzenle</h2>
                <button class="close-modal-btn" data-modal-id="maintenance-edit-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="maintenance-edit-form">
                <input type="hidden" name="maintenanceId" value="${maint.id}">
                <div class="form-group"><label>Araç</label><input type="text" value="${maint.vehiclePlate}" readonly></div>
                <div class="form-row"><div class="form-group"><label>Bakım Tarihi</label><input type="date" name="maintenanceDate" value="${maint.maintenanceDate}" required></div><div class="form-group"><label>Bakım KM</label><input type="number" name="maintenanceKm" value="${maint.maintenanceKm}" required></div></div>
                <div class="form-row"><div class="form-group"><label>Bakım Türü</label><input type="text" name="type" value="${maint.type}" required></div><div class="form-group"><label>Maliyet (₺)</label><input type="number" name="cost" value="${maint.cost}" required></div></div>
                <div class="form-group"><label>Açıklama</label><textarea name="description" rows="3">${maint.description}</textarea></div>
                <div class="form-row"><div class="form-group"><label>Sonraki Bakım KM</label><input type="number" name="nextMaintenanceKm" value="${maint.nextMaintenanceKm}" required></div><div class="form-group"><label>Sonraki Bakım Tarihi</label><input type="date" name="nextMaintenanceDate" value="${maint.nextMaintenanceDate}" required></div></div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="maintenance-edit-modal">İptal</button>
                <button type="submit" form="maintenance-edit-form" class="btn btn-primary">Değişiklikleri Kaydet</button>
            </div>
        </div>
    </div>
    `;
};

const MaintenanceModal = () => {
    const today = new Date().toISOString().split('T')[0];

    return `
    <div class="modal-overlay" id="maintenance-modal-overlay">
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Yeni Bakım Kaydı</h2>
                <button class="close-modal-btn" data-modal-id="maintenance-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form class="modal-form" id="maintenance-form">
                <div class="form-group">
                    <label for="maintenance-vehicle-select">Araç</label>
                    <select name="vehiclePlate" id="maintenance-vehicle-select" required>
                        <option value="">Araç Seçiniz...</option>
                        ${vehiclesData.map(v => `<option value="${v.plate}">${v.plate} - ${v.brand}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="maintenance-date">Bakım Tarihi</label>
                        <input type="date" id="maintenance-date" name="maintenanceDate" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label for="maintenance-km">Bakım Kilometresi</label>
                        <input type="number" id="maintenance-km" name="maintenanceKm" placeholder="Örn: 95000" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="maintenance-type">Bakım Türü</label>
                        <input type="text" id="maintenance-type" name="type" placeholder="Örn: Periyodik Bakım" required>
                    </div>
                    <div class="form-group">
                        <label for="maintenance-cost">Maliyet (₺)</label>
                        <input type="number" id="maintenance-cost" name="cost" placeholder="Örn: 1500" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="maintenance-description">Açıklama / Yapılan İşlemler</label>
                    <textarea id="maintenance-description" name="description" rows="3" placeholder="Yağ, filtre değişimi..."></textarea>
                </div>
                <fieldset class="next-maintenance-fieldset">
                    <legend>Sonraki Bakım Bilgileri (Otomatik)</legend>
                    <div class="form-row">
                        <div class="form-group"><label for="next-maintenance-km">Sonraki Bakım KM</label><input type="number" id="next-maintenance-km" name="nextMaintenanceKm" readonly></div>
                        <div class="form-group"><label for="next-maintenance-date">Sonraki Bakım Tarihi</label><input type="date" id="next-maintenance-date" name="nextMaintenanceDate" readonly></div>
                    </div>
                </fieldset>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="maintenance-modal">İptal</button>
                <button type="submit" form="maintenance-form" class="btn btn-primary">Kaydı Oluştur</button>
            </div>
        </div>
    </div>
    `;
};

const CheckInModal = () => {
    const vehicle = state.selectedVehicleForAction as Vehicle;
    if (!vehicle || !vehicle.rentedBy) return '';
    const today = new Date().toISOString().split('T')[0];

    return `
    <div class="modal-overlay" id="check-in-modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Teslim Al: ${vehicle.plate}</h2>
                <button class="close-modal-btn" data-modal-id="check-in-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
             <form class="modal-form" id="check-in-form">
                <input type="hidden" name="rentalId" value="${vehicle.activeRentalId}">
                <div class="customer-info-display">
                    <h4>Mevcut Kiracı</h4>
                    <p><i class="fa-solid fa-user"></i> ${vehicle.rentedBy.name}</p>
                    <p><i class="fa-solid fa-phone"></i> ${vehicle.rentedBy.phone}</p>
                </div>
                <div class="form-row" style="margin-top: 16px;">
                    <div class="form-group">
                        <label for="return-date">Teslim Tarihi</label>
                        <input type="date" id="return-date" name="returnDate" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label for="return-km">Dönüş Kilometresi</label>
                        <input type="number" id="return-km" name="returnKm" placeholder="Örn: ${parseInt(vehicle.km.replace(/,/, '')) + 1000}" required>
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="check-in-modal">İptal</button>
                <button type="submit" form="check-in-form" class="btn btn-primary">Aracı Teslim Al</button>
            </div>
        </div>
    </div>
`};


const App = () => {
  let pageContent: string = '';

  switch (state.activePage) {
    case 'dashboard':
      pageContent = DashboardPage();
      break;
    case 'vehicles':
      pageContent = VehiclesPage();
      break;
    case 'customers':
      pageContent = CustomersPage();
      break;
    case 'rentals':
      pageContent = RentalsPage();
      break;
    case 'reservations':
      pageContent = ReservationsPage();
      break;
    case 'maintenance':
      pageContent = MaintenancePage();
      break;
    case 'reports':
      pageContent = ReportsPage();
      break;
    case 'notifications':
      pageContent = NotificationsPage();
      break;
    case 'settings':
      pageContent = SettingsPage();
      break;
    default:
      pageContent = DashboardPage();
  }

  return `
    <div class="app-container">
      <!-- Hamburger Menu Button (Mobile) - GÜNCEL -->
      <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Menüyü Aç/Kapat">
        <i class="fa-solid fa-bars" id="menu-icon"></i>
      </button>

      <!-- Sidebar Overlay (Mobile) -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>

      <nav class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <!-- Mobil Geri Butonu -->
          <button class="mobile-back-btn" id="mobile-back-btn" aria-label="Geri">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          
          <div class="sidebar-logo">
            ${state.settings.companyInfo.logo ? `
              <img src="${state.settings.companyInfo.logo}" alt="${state.settings.companyInfo.name}" style="max-height: 40px; max-width: 100%; object-fit: contain;" />
            ` : `
              <i class="fa-solid fa-car" style="font-size: 24px; margin-right: 10px; color: #007bff;"></i>
              <span style="font-size: 20px; font-weight: 700; color: #333;">${state.settings.companyInfo.name}</span>
            `}
          </div>
        </div>
      <ul class="nav-menu">
        ${navItems.map(item => `
          <li>
            <a href="#" class="nav-link ${state.activePage === item.id ? 'active' : ''}" data-page-id="${item.id}">
              <i class="${item.icon}"></i>
              <span>${item.text}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    
    <main class="main-content">
      ${pageContent}
    </main>
    
    ${state.isVehicleModalOpen ? VehicleModal() : ''}
    ${state.isRentalModalOpen ? RentalModal() : ''}
    ${state.isCustomerModalOpen ? CustomerModal() : ''}
    ${state.isCheckInModalOpen ? CheckInModal() : ''}
    ${state.isReservationModalOpen ? ReservationModal() : ''}
    ${state.isMaintenanceModalOpen ? MaintenanceModal() : ''}
    ${state.isMaintenanceEditModalOpen ? MaintenanceEditModal() : ''}
    ${state.isRentalEditModalOpen ? RentalEditModal() : ''}
    ${state.isReservationEditModalOpen ? ReservationEditModal() : ''}
    </div>
  `;
};

function renderApp() {
  // 🔒 Prevent concurrent renders
  if (isRendering) {
    console.log('⚠️ renderApp() zaten çalışıyor, atlandı');
    return;
  }
  
  isRendering = true;
  console.log('🎨 renderApp() fonksiyonu çağrıldı');
  try {
    // KRITIK FIX: activitiesData'yı temizle
    if (activitiesData && Array.isArray(activitiesData)) {
      activitiesData = activitiesData.filter(activity => {
        if (!activity || !activity.icon || !activity.message) return false;
        
        // time kontrolü - geçersiz Date objelerini temizle
        if (activity.time) {
          try {
            if (!(activity.time instanceof Date)) {
              activity.time = new Date(activity.time);
            }
            if (isNaN(activity.time.getTime())) {
              console.warn('⚠️ Geçersiz aktivite tarihi silindi:', activity);
              return false;
            }
          } catch (e) {
            console.warn('⚠️ Aktivite parse hatası, silindi:', activity);
            return false;
          }
        } else {
          activity.time = new Date(); // time yoksa şimdi ekle
        }
        
        return true;
      });
    }
    
    const root = document.getElementById('root');
    
    // KRITIK FIX: document.body null kontrolü
    const body = document.body;
    if (body && state && state.theme) {
      body.className = state.theme;
    }
    
    render(App(), root);
  } catch (error) {
    console.error('!!! HATA: renderApp fonksiyonunda bir sorun oluştu:', error);
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Uygulama Çizilirken Kritik Bir Hata Oluştu</h1><p>Lütfen konsolu (F12) kontrol edin.</p><pre>${error.message}</pre></div>`;
    }
  } finally {
    // 🔓 Release render lock
    isRendering = false;
  }
}

function attachEventListeners() {
    try {
        // console.log('Attaching event listeners...');
    
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('mobile-open');
            sidebarOverlay.classList.toggle('active');
            
            // Update icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('mobile-open')) {
                    icon.className = 'fa-solid fa-times';
                } else {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });
        
        // Close menu when clicking overlay
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fa-solid fa-bars';
            }
        });
        
        // Close menu when clicking nav link (mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-open');
                    sidebarOverlay.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    if (icon) {
                        icon.className = 'fa-solid fa-bars';
                    }
                }
            });
        });
        
        // Mobile Back Button
        const mobileBackBtn = document.getElementById('mobile-back-btn');
        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
            });
        }
    }
    
    // Theme switcher
    document.getElementById('theme-toggle')?.addEventListener('change', (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        const newTheme = isChecked ? 'dark' : 'light';
        if (document.body) {
            document.body.className = newTheme; // Apply theme to body
        }
        setState({ theme: newTheme });
    });

    // Settings Page Accordion - Mobile-friendly fix
    document.querySelectorAll('.settings-accordion-header').forEach(header => {
        const clickHandler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            
            const accordion = header.closest('.settings-accordion') || header.parentElement;
            if (!accordion) return;
            
            const content = accordion.querySelector('.settings-accordion-content') as HTMLElement;
            if (!content) return;
            
            // Toggle active class
            const isActive = accordion.classList.contains('active');
            
            if (isActive) {
                accordion.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                accordion.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        };
        
        // Both click and touch events for mobile compatibility
        header.addEventListener('click', clickHandler);
        header.addEventListener('touchend', clickHandler);
    });

    // Settings Page - Company Info & PDF settings
    document.querySelectorAll('[data-company-key]').forEach(input => {
        input.addEventListener('input', (e) => {
            const key = (e.target as HTMLElement).dataset.companyKey;
            const value = (e.target as HTMLInputElement).value;
            const newCompanyInfo = { ...state.settings.companyInfo, [key]: value };
            setState({ settings: { ...state.settings, companyInfo: newCompanyInfo } });
        });
    });

    document.getElementById('companyLogoFile')?.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newCompanyInfo = { ...state.settings.companyInfo, logo: base64String };
                setState({ settings: { ...state.settings, companyInfo: newCompanyInfo } });
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('remove-logo-btn')?.addEventListener('click', () => {
        const newCompanyInfo = { ...state.settings.companyInfo, logo: null };
        setState({ settings: { ...state.settings, companyInfo: newCompanyInfo } });
    });

    document.getElementById('companyPdfBackgroundFile')?.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newCompanyInfo = { ...state.settings.companyInfo, pdfBackground: base64String };
                setState({ settings: { ...state.settings, companyInfo: newCompanyInfo } });
            };
            reader.readAsDataURL(file);
        }
    });
    document.getElementById('remove-pdf-background-btn')?.addEventListener('click', () => {
        const newCompanyInfo = { ...state.settings.companyInfo, pdfBackground: null };
        setState({ settings: { ...state.settings, companyInfo: newCompanyInfo } });
    });
    
    // Firebase Master Password - FIX: Stop propagation to prevent accordion from closing
    const masterPasswordInput = document.getElementById('firebase-master-password');
    if (masterPasswordInput) {
        masterPasswordInput.addEventListener('input', (e) => {
            e.stopPropagation();
            const password = (e.target as HTMLInputElement).value;
            setState({ settings: { ...state.settings, firebaseMasterPassword: password } });
        });
        masterPasswordInput.addEventListener('click', (e) => e.stopPropagation());
        masterPasswordInput.addEventListener('focus', (e) => e.stopPropagation());
    }
    
    // Settings Page Controls - FIX: Stop propagation to prevent accordion from closing
    document.querySelectorAll('[data-setting-key]').forEach(el => {
        el.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent accordion from closing
            const key = (e.target as HTMLElement).dataset.settingKey;
            const value = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement).value;
            setState({ settings: { ...state.settings, [key]: value } });
            saveDataToLocalStorage(); // Ayar değiştiğinde kaydet
        });
    });
    // PDF Checkboxes - FIX: Stop propagation to prevent accordion from closing
    document.getElementById('pdf_show_logo')?.addEventListener('change', (e) => {
        e.stopPropagation();
        const isChecked = (e.target as HTMLInputElement).checked;
        const newPdfSettings = { ...state.settings.pdfSettings, showLogo: isChecked };
        setState({ settings: { ...state.settings, pdfSettings: newPdfSettings } });
    });
    document.getElementById('pdf_show_footer')?.addEventListener('change', (e) => {
        e.stopPropagation();
        const isChecked = (e.target as HTMLInputElement).checked;
        const newPdfSettings = { ...state.settings.pdfSettings, showFooter: isChecked };
        setState({ settings: { ...state.settings, pdfSettings: newPdfSettings } });
    });
    document.getElementById('pdf_show_background')?.addEventListener('change', (e) => {
        e.stopPropagation();
        const isChecked = (e.target as HTMLInputElement).checked;
        const newPdfSettings = { ...state.settings.pdfSettings, showBackground: isChecked };
        setState({ settings: { ...state.settings, pdfSettings: newPdfSettings } });
    });

    // Settings Page - Save Button
    document.querySelector('.btn-gradient-save')?.addEventListener('click', async () => {
        // Veriler her değişiklikte zaten kaydediliyor, bu buton sadece geri bildirim ve UI temizliği için.
        saveDataToLocalStorage(); // En son halini garantiye alarak kaydet.
        
        // 🔥 Firebase'e otomatik kaydet
        if (state.settings?.firebaseEnabled) {
            try {
                const dataToSend = {
                    vehiclesData,
                    customersData,
                    rentalsData,
                    reservationsData,
                    maintenanceData,
                    activitiesData,
                    settings: state.settings,
                };
                
                // Firebase'e gönder
                if (typeof sendDataToFirebase === 'function') {
                    await sendDataToFirebase(dataToSend);
                    showToast('✅ Ayarlar kaydedildi ve Firebase\'e yüklendi!', 'success');
                } else {
                    showToast('✅ Ayarlar kaydedildi!', 'success');
                }
            } catch (error) {
                console.error('Firebase kaydetme hatası:', error);
                showToast('✅ Ayarlar yerel olarak kaydedildi!', 'success');
            }
        } else {
            showToast('✅ Ayarlar başarıyla kaydedildi!', 'success');
        }

        // Tüm açık akordiyonları kapat
        document.querySelectorAll('.settings-accordion.active').forEach(accordion => {
            accordion.classList.remove('active');
            const content = accordion.querySelector('.settings-accordion-content') as HTMLElement;
            if (content) {
                content.style.maxHeight = '0';
            }
        });
    });

    // Settings Page - Backup and Restore
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
        const dataToExport = {
            vehiclesData,
            customersData,
            rentalsData,
            reservationsData,
            maintenanceData,
            activitiesData,
            theme: state.theme,
            readNotifications: state.readNotifications,
            settings: state.settings,
        };
        const dataStr = JSON.stringify(dataToExport, null, 2); // Pretty print JSON
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rehber-otomotiv-yedek-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const importFileInput = document.getElementById('import-file-input') as HTMLInputElement;
    document.getElementById('btn-import-data')?.addEventListener('click', () => {
        importFileInput.click();
    });

    // ==================== FIREBASE HANDLERS ====================
    // Firebase configuration inputs - FIX: Stop propagation to prevent accordion from closing
    document.querySelectorAll('#firebase-apiKey, #firebase-authDomain, #firebase-databaseURL, #firebase-projectId, #firebase-storageBucket, #firebase-messagingSenderId, #firebase-appId').forEach(input => {
        input.addEventListener('input', (e) => {
            e.stopPropagation();
            const inputId = (e.target as HTMLElement).id;
            const key = inputId.replace('firebase-', '');
            const value = (e.target as HTMLInputElement).value;
            const newFirebaseConfig = { ...state.settings.firebaseConfig, [key]: value };
            setState({ settings: { ...state.settings, firebaseConfig: newFirebaseConfig } });
        });
        
        // Also prevent click and focus events from bubbling
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('focus', (e) => e.stopPropagation());
    });

    // Firebase master password input
    document.getElementById('firebase-master-password')?.addEventListener('input', (e) => {
        e.stopPropagation();
        const value = (e.target as HTMLInputElement).value;
        setState({ settings: { ...state.settings, firebaseMasterPassword: value } });
    });
    document.getElementById('firebase-master-password')?.addEventListener('click', (e) => e.stopPropagation());
    document.getElementById('firebase-master-password')?.addEventListener('focus', (e) => e.stopPropagation());

    // Firebase enabled/auto-sync checkboxes
    document.getElementById('firebase_enabled')?.addEventListener('change', (e) => {
        e.stopPropagation();
        const isChecked = (e.target as HTMLInputElement).checked;
        setState({ settings: { ...state.settings, firebaseEnabled: isChecked } });
    });
    
    document.getElementById('firebase_auto_sync')?.addEventListener('change', (e) => {
        e.stopPropagation();
        const isChecked = (e.target as HTMLInputElement).checked;
        setState({ settings: { ...state.settings, firebaseAutoSync: isChecked } });
    });

    // Test Firebase connection
    document.getElementById('btn-test-firebase')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.target as HTMLButtonElement;
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Test Ediliyor...';
            
            // Check if testFirebaseConnection function exists
            if (typeof testFirebaseConnection === 'function') {
                const config = state.settings?.firebaseConfig;
                if (!config?.apiKey || !config?.databaseURL) {
                    throw new Error('API Key ve Database URL gerekli!');
                }
                
                // Initialize Firebase if not already
                if (typeof initializeFirebase === 'function') {
                    initializeFirebase(config);
                }
                
                const isConnected = await testFirebaseConnection();
                
                if (isConnected) {
                    showToast('Firebase bağlantısı başarılı! ✅', 'success');
                } else {
                    throw new Error('Bağlantı kurulamadı');
                }
            } else {
                throw new Error('Firebase fonksiyonları yüklenmedi');
            }
            
        } catch (error) {
            console.error('Firebase test error:', error);
            showToast(`Firebase bağlantı hatası: ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // Send data to Firebase
    document.getElementById('btn-send-to-firebase')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.target as HTMLButtonElement;
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gönderiliyor...';
            
            // Prepare data
            const dataToSend = {
                vehiclesData,
                customersData,
                rentalsData,
                reservationsData,
                maintenanceData,
                activitiesData,
                settings: state.settings,
            };
            
            // Check if Firebase functions exist
            if (typeof sendDataToFirebase === 'function') {
                // Initialize Firebase if not already
                const config = state.settings?.firebaseConfig;
                if (typeof initializeFirebase === 'function') {
                    initializeFirebase(config);
                }
                
                await sendDataToFirebase(dataToSend);
                
                const vehicleCount = vehiclesData?.length || 0;
                const customerCount = customersData?.length || 0;
                const rentalCount = rentalsData?.length || 0;
                
                showToast(`Veriler başarıyla gönderildi! 📤\n${vehicleCount} araç, ${customerCount} müşteri, ${rentalCount} kiralama`, 'success');
            } else {
                throw new Error('Firebase fonksiyonları yüklenmedi');
            }
            
        } catch (error) {
            showToast(`Firebase gönderme hatası: ${error.message}`, 'error');
            console.error('Firebase send error:', error);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
    
    // Fetch data from Firebase
    document.getElementById('btn-fetch-from-firebase')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.target as HTMLButtonElement;
        const originalText = btn.innerHTML;
        
        // 🔒 Password check before fetching
        const savedPassword = state.settings?.firebaseMasterPassword || '';
        const correctPassword = '1259';
        if (savedPassword !== correctPassword) {
            const enteredPassword = prompt('🔐 Firebase verilerini almak için ana şifreyi girin:');
            if (enteredPassword !== correctPassword) {
                showToast('❌ Yanlış şifre! Veriler alınamadı.', 'error');
                return;
            }
        }
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Alınıyor...';
            
            // Check if Firebase functions exist
            if (typeof fetchDataFromFirebase === 'function') {
                // Initialize Firebase if not already
                const config = state.settings?.firebaseConfig;
                if (typeof initializeFirebase === 'function') {
                    await initializeFirebase(config);
                }
                
                const data = await fetchDataFromFirebase();
                
                // Update local data
                if (data.vehiclesData) vehiclesData = data.vehiclesData;
                if (data.customersData) customersData = data.customersData;
                if (data.rentalsData) rentalsData = data.rentalsData;
                if (data.reservationsData) reservationsData = data.reservationsData;
                if (data.maintenanceData) maintenanceData = data.maintenanceData;
                if (data.activitiesData) activitiesData = data.activitiesData;
                if (data.settings) {
                    state.settings = { ...state.settings, ...data.settings };
                }
                
                // Save to localStorage
                saveDataToLocalStorage();
                
                const vehicleCount = vehiclesData?.length || 0;
                const customerCount = customersData?.length || 0;
                const rentalCount = rentalsData?.length || 0;
                
                showToast(`Veriler başarıyla alındı! 📥\n${vehicleCount} araç, ${customerCount} müşteri, ${rentalCount} kiralama`, 'success');
                
                // Re-render the app
                renderApp();
            } else {
                throw new Error('Firebase fonksiyonları yüklenmedi');
            }
            
        } catch (error) {
            showToast(`Firebase veri çekme hatası: ${error.message}`, 'error');
            console.error('Firebase fetch error:', error);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // PWA Install button
    document.getElementById('btn-install-pwa')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const deferredPrompt = (window as any).pwaInstallPrompt;
        
        if (!deferredPrompt) {
            showToast('Bu uygulama zaten kurulu veya tarayıcınız PWA kurulumunu desteklemiyor. 📱', 'success');
            return;
        }
        
        try {
            // Show the install prompt
            deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                showToast('Uygulama kuruluyor... 🎉', 'success');
                (window as any).pwaInstallPrompt = null;
            } else {
                showToast('Kurulum iptal edildi.', 'success');
            }
            
        } catch (error) {
            console.error('PWA install error:', error);
            showToast('Kurulum sırasında bir hata oluştu.', 'error');
        }
    });

    importFileInput?.addEventListener('change', (event) => {
        const file = (event.target as HTMLInputElement).files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result as string);
                    let dataToLoad: any = {};

                    if (importedData.vehiclesData) {
                        // Eğer bizim kendi yedek dosyamız ise, olduğu gibi al.
                        console.log("Standart yedek dosyası tespit edildi.");
                        dataToLoad = importedData;
                    } else if (importedData.vehicles || importedData.rentals || importedData.maintenance) {
                        console.log("Harici format tespit edildi, veriler dönüştürülüyor...");

                        // 1. Müşterileri Kiralamalardan Çıkar
                        let tempCustomersData = structuredClone(customersData); // Deep copy with better performance
                        let nextCustomerId = Math.max(0, ...tempCustomersData.map(c => c.id)) + 1;

                        if (importedData.rentals && Array.isArray(importedData.rentals)) {
                            importedData.rentals.forEach(rental => {
                                const customerName = rental.customer?.trim();
                                if (customerName && !tempCustomersData.some(c => c.name.toLowerCase() === customerName.toLowerCase())) {
                                    const newCustomer: Customer = {
                                        id: nextCustomerId++,
                                        name: customerName,
                                        tc: '', phone: '', email: '', address: '', licenseNumber: '', licenseDate: '',
                                        idFile: null, idFileUrl: null, licenseFile: null, licenseFileUrl: null,
                                        rentals: []
                                    };
                                    tempCustomersData.push(newCustomer);
                                }
                            });
                            dataToLoad.customersData = tempCustomersData;
                        } else {
                            // Eğer kiralama verisi yoksa, mevcut müşterileri koru
                            dataToLoad.customersData = tempCustomersData;
                        }

                        // 2. Araçları Dönüştür
                        if (importedData.vehicles && Array.isArray(importedData.vehicles)) {
                            const convertedVehicles = importedData.vehicles.map(v => {
                                const getFileName = (path) => path ? path.split('\\').pop().split('/').pop() : null;
                                return {
                                    plate: v.plate,
                                    brand: `${v.brand || ''} ${v.model || ''}`.trim(),
                                    km: (v.km || 0).toLocaleString('tr-TR'),
                                    status: 'Müsait', // Başlangıçta hepsini Müsait yap, sonra kiralamalara göre güncelleyeceğiz.
                                    insuranceDate: v.insurance || null, 
                                    inspectionDate: v.inspection || null,
                                    insuranceFile: v.gorseller ? getFileName(v.gorseller.sigorta) : null,
                                    inspectionFile: v.gorseller ? getFileName(v.gorseller.muayene) : null,
                                    licenseFile: v.gorseller ? getFileName(v.gorseller.ruhsat) : null,
                                    insuranceFileUrl: null, // Local paths cannot be used
                                    inspectionFileUrl: null,
                                    licenseFileUrl: null,
                                };
                            });
                            dataToLoad.vehiclesData = convertedVehicles;
                        }

                        // 3. Kiralamaları Dönüştür
                        if (importedData.rentals && Array.isArray(importedData.rentals)) {
                             const convertedRentals = importedData.rentals.map(r => {
                                const customer = tempCustomersData.find(c => c.name.toLowerCase() === r.customer?.toLowerCase());
                                const isActive = r.endDate === "" || !r.endDate;
                                return {
                                    id: Date.now() + Math.random(), // Use a more robust ID
                                    vehiclePlate: r.plate,
                                    customerId: customer ? customer.id : 0,
                                    startDate: r.startDate,
                                    endDate: isActive ? null : r.endDate,
                                    startKm: r.startKm || 0,
                                    endKm: isActive ? null : r.endKm,
                                    price: r.rate || 0,
                                    priceType: r.per === 'Aylık' ? 'monthly' : 'daily',
                                    totalCost: null, // Needs calculation on check-in
                                    contractFile: r.contract ? r.contract.split('\\').pop() : null,
                                    invoiceFile: r.invoice ? r.invoice.split('\\').pop() : null,
                                    contractFileUrl: null,
                                    invoiceFileUrl: null,
                                    status: isActive ? 'active' : 'completed',
                                };
                            });
                            dataToLoad.rentalsData = convertedRentals.filter(r => r.customerId !== 0);

                            // 3.5. Araç Durumlarını Kiralamalara Göre Güncelle
                            if (dataToLoad.vehiclesData) {
                                dataToLoad.vehiclesData.forEach(vehicle => {
                                    const activeRental = dataToLoad.rentalsData.find(rental => 
                                        rental.vehiclePlate === vehicle.plate && rental.status === 'active'
                                    );
                                    if (activeRental) {
                                        vehicle.status = 'Kirada';
                                        // İsteğe bağlı: Kiracı bilgisini de ekleyebiliriz
                                    }
                                });
                            }
                        }

                        // 4. Bakımları Dönüştür
                        if (importedData.maintenance && Array.isArray(importedData.maintenance)) {
                            dataToLoad.maintenanceData = importedData.maintenance.map(m => {
                                const maintenanceKm = m.km || 0;
                                const nextDate = new Date(m.date);
                                nextDate.setFullYear(nextDate.getFullYear() + 1);
                                return {
                                    id: Date.now() + Math.random(),
                                    vehiclePlate: m.plate,
                                    maintenanceDate: m.date,
                                    maintenanceKm: maintenanceKm,
                                    type: m.type || 'Genel Bakım',
                                    cost: m.cost || 0,
                                    description: m.note || '',
                                    nextMaintenanceKm: maintenanceKm + 15000,
                                    nextMaintenanceDate: nextDate.toISOString().split('T')[0],
                                };
                            });
                        }

                        // 5. Rezervasyonları ve Ayarları Dönüştür (varsa)
                        if (importedData.reservations) {
                            dataToLoad.reservationsData = importedData.reservations; // Assuming format is compatible
                        }
                        if (importedData.settings) {
                            dataToLoad.settings = importedData.settings;
                        }

                    } else {
                        throw new Error("Dosya beklenen formatta değil. 'vehicles', 'rentals', 'maintenance' veya 'vehiclesData' anahtarı bulunamadı.");
                    }
                    
                    if (confirm('Veriler içe aktarılacak. Bu işlem, dosyadaki verileri mevcut verilerinizin üzerine yazacaktır. Onaylıyor musunuz?')) {
                        // Mevcut verileri al
                        const currentData = JSON.parse(localStorage.getItem('rehberOtomotivData') || '{}');
                        
                        // İçe aktarılan veriyi mevcut verinin üzerine "birleştir".
                        // Bu sayede sadece içe aktarılan dosyada olan alanlar güncellenir.
                        const mergedData = {
                            ...currentData,
                            ...dataToLoad 
                        };
                        
                        localStorage.setItem('rehberOtomotivData', JSON.stringify(mergedData));
                        localStorage.setItem('showImportSuccessToast', 'true'); // Başarı mesajı için işaret bırak
                        // Kaydetme fonksiyonunu burada çağırmıyoruz, çünkü zaten localStorage'a yazdık.
                        window.location.reload(); // Sayfayı yeniden yükleyerek en temiz şekilde verileri almasını sağla
                    }
                } catch (err) {
                    showToast(`Hata: ${err.message}. Lütfen doğru formatta bir JSON dosyası seçtiğinizden emin olun.`, 'error');
                    console.error("Veri içe aktarılırken hata:", err);
                }
            };
            reader.readAsText(file);
        }
    });

    // Notification filter buttons
    document.querySelectorAll('.notification-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = (btn as HTMLElement).dataset.filter as any;
            setState({ notificationFilter: filter });
        });
    });

    // Notification card click (for reminders)
    document.querySelectorAll('.notification-card[data-vehicle-index]').forEach(card => {
        const vehicleIndexStr = (card as HTMLElement).dataset.vehicleIndex;
        const notificationId = parseInt((card as HTMLElement).dataset.notificationId, 10);

        const clickHandler = () => {
            // Mark as read logic
            if (!state.readNotifications.includes(notificationId)) {
                const newReadNotifications = [...state.readNotifications, notificationId];
                setState({ readNotifications: newReadNotifications }); // Update state properly
                saveDataToLocalStorage(); // Save the change
                card.classList.add('read'); // Update UI immediately
            }

            // Navigate to vehicle details by opening the modal if it's a reminder
            if (vehicleIndexStr && vehicleIndexStr !== "") {
                const vehicleIndex = parseInt(vehicleIndexStr, 10);
                setState({ activePage: 'vehicles', editingVehicleIndex: vehicleIndex, isVehicleModalOpen: true });
            }
        };
        card.addEventListener('click', clickHandler);
    });

    // Navigation
    document.querySelectorAll('.nav-link, .stat-card, .quick-access-btn').forEach(el => {
        const pageId = (el as HTMLElement).dataset.pageId;
        // Special handling for quick access buttons that open modals instead of navigating
        if (pageId === 'vehicles' && el.classList.contains('btn-add-vehicle')) return;
        if (pageId === 'customers' && el.classList.contains('btn-add-customer')) return;
        if (pageId === 'rentals' && el.classList.contains('btn-start-rental')) return;
        if (pageId === 'maintenance' && el.classList.contains('btn-add-maintenance')) return;

        if (pageId) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(pageId);
            });
        }
    });
    
    // Quick access buttons on dashboard
    document.querySelector('.btn-add-vehicle')?.addEventListener('click', () => openModal('vehicle'));
    document.querySelector('.btn-add-customer')?.addEventListener('click', () => openModal('customer'));
    // For now, other quick access buttons navigate to their pages, which is handled above.

    
    // Rent button on dashboard available vehicles list
    document.querySelectorAll('.btn-rent-small').forEach(btn => {
        const plate = (btn as HTMLElement).dataset.vehiclePlate;
        const vehicleIndex = vehiclesData.findIndex(v => v.plate === plate);
        if (vehicleIndex > -1) {
            btn.addEventListener('click', () => openModal('rental', vehicleIndex));
        }
    });

    const openModal = (modalType: 'vehicle' | 'rental' | 'check-in' | 'customer' | 'rental-edit' | 'reservation' | 'maintenance' | 'reservation-edit' | 'maintenance-edit', entityIndex?: number | string) => {
        const newState: Partial<typeof state> = { 
            editingVehicleIndex: null, 
            editingCustomerIndex: null,
            editingRentalId: null,
            editingReservationId: null,
            editingMaintenanceId: null,
        };

        if (modalType === 'vehicle') {
            newState.isVehicleModalOpen = true;
            if (typeof entityIndex === 'number') newState.editingVehicleIndex = entityIndex;
        }
        if (modalType === 'rental') {
            newState.isRentalModalOpen = true;
            newState.rentalFormCustomerType = 'existing'; // Reset to default
            if (typeof entityIndex === 'number') newState.selectedVehicleForAction = vehiclesData[entityIndex];
        }
        if (modalType === 'check-in') {
            newState.isCheckInModalOpen = true;
            if (typeof entityIndex === 'number') newState.selectedVehicleForAction = vehiclesData[entityIndex];
        }
        if (modalType === 'customer') {
            newState.isCustomerModalOpen = true;
            if (typeof entityIndex === 'number') newState.editingCustomerIndex = entityIndex;
        }
        if (modalType === 'rental-edit') {
            newState.isRentalEditModalOpen = true;
            if (entityIndex !== undefined) newState.editingRentalId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
        }
        if (modalType === 'reservation') {
            newState.isReservationModalOpen = true;
        }
        if (modalType === 'maintenance') {
            newState.isMaintenanceModalOpen = true;
        }
        if (modalType === 'maintenance-edit') {
            newState.isMaintenanceEditModalOpen = true;
            if (entityIndex !== undefined) newState.editingMaintenanceId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
        }
        if (modalType === 'reservation-edit') {
            newState.isReservationEditModalOpen = true;
            if (entityIndex !== undefined) newState.editingReservationId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
        }
        
        setState(newState);
    };

    // ⚠️ LOCAL closeModal ve openModal SİLİNDİ - GLOBAL window fonksiyonları kullanılıyor!
    // Artık window.closeModal() ve window.openModal() kullanılacak

    // Open vehicle modal
    document.getElementById('add-vehicle-btn')?.addEventListener('click', () => openModal('vehicle'));
    document.getElementById('add-customer-btn')?.addEventListener('click', () => openModal('customer'));
    // Open reservation/maintenance modals
    document.getElementById('add-reservation-btn')?.addEventListener('click', () => openModal('reservation'));
    document.getElementById('add-maintenance-btn')?.addEventListener('click', () => openModal('maintenance'));


    // Open rental/check-in modals
    document.querySelectorAll('.btn-rent').forEach(btn => {
        const card = btn.closest('.vehicle-card') as HTMLElement;
        const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
        btn.addEventListener('click', () => openModal('rental', vehicleIndex));
    });
    
    document.querySelectorAll('.btn-check-in').forEach(btn => {
        const card = btn.closest('.vehicle-card') as HTMLElement;
        const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
        btn.addEventListener('click', () => openModal('check-in', vehicleIndex));
    });

    // Edit/Delete vehicle buttons
    document.querySelectorAll('.btn-edit-vehicle').forEach(btn => {
        const card = btn.closest('.vehicle-card') as HTMLElement;
        const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
        btn.addEventListener('click', () => openModal('vehicle', vehicleIndex));
    });

    document.querySelectorAll('.btn-delete-vehicle').forEach(btn => {
        const card = btn.closest('.vehicle-card') as HTMLElement;
        const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
        btn.addEventListener('click', () => {
            const vehicle = vehiclesData[vehicleIndex];
            if (confirm(`'${vehicle.plate}' plakalı aracı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                vehiclesData.splice(vehicleIndex, 1);
                setState({}); // Trigger re-render and save which also calls saveDataToLocalStorage
            }
        });
    });

    // Edit/Delete customer buttons
    document.querySelectorAll('.btn-edit-customer').forEach(btn => {
        const accordion = btn.closest('.customer-accordion') as HTMLElement;
        const customerIndex = parseInt(accordion.dataset.customerIndex, 10);
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent accordion from opening/closing
            openModal('customer', customerIndex);
        });
    });

    document.querySelectorAll('.btn-delete-customer').forEach(btn => {
        const accordion = btn.closest('.customer-accordion') as HTMLElement;
        const customerIndex = parseInt(accordion.dataset.customerIndex, 10);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const customer = customersData[customerIndex];
            if (confirm(`'${customer.name}' adlı müşteriyi silmek istediğinizden emin misiniz?`)) {
                customersData.splice(customerIndex, 1);
                setState({}); // Trigger re-render and save
            }
        });
    });

    // View Maintenance History button on vehicle card
    document.querySelectorAll('.btn-view-maintenance').forEach(btn => {
        const card = btn.closest('.vehicle-card') as HTMLElement;
        const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
        const vehicle = vehiclesData[vehicleIndex];
        if (vehicle) {
            btn.addEventListener('click', () => {
                setState({ activePage: 'maintenance', searchTerm: vehicle.plate });
            });
        }
    });

    // --- PAGE-SPECIFIC EVENT LISTENERS ---

    // RENTALS PAGE: Card buttons
    if (state.activePage === 'rentals') {
        const rentalsList = document.querySelector('.rentals-list');
        if (rentalsList) {
            rentalsList.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const button = target.closest('[data-action]') as HTMLElement;
                if (!button) return;

                const action = button.dataset.action;
                const card = button.closest('.rental-card') as HTMLElement;
                const rentalId = card?.dataset.rentalId;
                const docUrl = button.dataset.docUrl;

                if (!action || !rentalId) return;

                if (action === 'delete-rental') {
                    if (confirm(`Bu kiralama kaydını silmek istediğinizden emin misiniz?`)) {
                        const rentalIndex = rentalsData.findIndex(r => r.id === parseInt(rentalId, 10));
                        if (rentalIndex > -1) {
                            rentalsData.splice(rentalIndex, 1);
                            setState({});
                            showToast('Kiralama kaydı silindi.', 'success');
                        }
                    }
                } else if (action === 'edit-rental' || action === 'upload-doc') {
                    openModal('rental-edit', rentalId);
                } else if (action === 'view-doc' && docUrl) {
                    window.open(docUrl, '_blank');
                }
            });
        }
    }

    // --- REPORTS PAGE LISTENERS ---
    if (state.activePage === 'reports') {
        const reportSelect = document.getElementById('report-rental-select') as HTMLSelectElement;
        const generateBtn = document.getElementById('generate-report-btn') as HTMLButtonElement;

        if (reportSelect && generateBtn) {
            reportSelect.addEventListener('change', () => {
                generateBtn.disabled = !reportSelect.value;
            });

            if (!generateBtn.dataset.listenerAttached) {
                generateBtn.addEventListener('click', () => {
                    if (reportSelect.value) {
                        const selectedRentalId = parseInt(reportSelect.value, 10);
                        const rental = rentalsData.find(r => r.id === selectedRentalId);
                        if (rental) generateRentalSummaryPDF(rental);
                    }
                });
                generateBtn.dataset.listenerAttached = 'true';
            }
        }
    }

    // Dashboard -> Vehicle Page filtering
    document.querySelectorAll('.distribution-item-reimagined').forEach(item => {
        const statusFilter = (item as HTMLElement).dataset.statusFilter;
        if (statusFilter) {
            item.addEventListener('click', () => {
                setState({ activePage: 'vehicles', vehicleStatusFilter: statusFilter, searchTerm: '' });
            });
        }
    });

    // Edit/Delete reservation buttons
    document.querySelectorAll('.btn-edit-reservation').forEach(btn => {
        const card = btn.closest('.reservation-card') as HTMLElement;
        const reservationId = card.dataset.reservationId;
        btn.addEventListener('click', () => openModal('reservation-edit', reservationId));
    });

    document.querySelectorAll('.btn-delete-reservation').forEach(btn => {
        const card = btn.closest('.reservation-card') as HTMLElement;
        const reservationId = parseInt(card.dataset.reservationId, 10);
        btn.addEventListener('click', () => {
            if (confirm(`Bu rezervasyon kaydını silmek istediğinizden emin misiniz?`)) {
                const resIndex = reservationsData.findIndex(r => r.id === reservationId);
                if (resIndex > -1) {
                    reservationsData.splice(resIndex, 1);
                    setState({}); // Trigger re-render and save
                }
            }
        });
    });

    // Edit/Delete maintenance buttons
    document.querySelectorAll('.btn-edit-maintenance').forEach(btn => {
        const card = btn.closest('.maintenance-card') as HTMLElement;
        const maintenanceId = card.dataset.maintenanceId;
        btn.addEventListener('click', () => openModal('maintenance-edit', maintenanceId));
    });

    document.querySelectorAll('.btn-delete-maintenance').forEach(btn => {
        const card = btn.closest('.maintenance-card') as HTMLElement;
        const maintenanceId = parseInt(card.dataset.maintenanceId, 10);
        btn.addEventListener('click', () => {
            if (confirm(`Bu bakım kaydını silmek istediğinizden emin misiniz?`)) {
                const maintIndex = maintenanceData.findIndex(m => m.id === maintenanceId);
                if (maintIndex > -1) {
                    maintenanceData.splice(maintIndex, 1);
                    setState({}); // Trigger re-render and save
                }
            }
        });
    });

    document.getElementById('vehicle-form')?.addEventListener('submit', handleVehicleFormSubmit);
    document.getElementById('customer-form')?.addEventListener('submit', handleCustomerFormSubmit);
    document.getElementById('rental-form')?.addEventListener('submit', handleRentalFormSubmit);
    document.getElementById('check-in-form')?.addEventListener('submit', handleCheckInFormSubmit);
    document.getElementById('rental-edit-form')?.addEventListener('submit', handleRentalEditFormSubmit);
    document.getElementById('reservation-form')?.addEventListener('submit', handleReservationFormSubmit);
    document.getElementById('reservation-edit-form')?.addEventListener('submit', handleReservationEditFormSubmit);
    document.getElementById('maintenance-form')?.addEventListener('submit', handleMaintenanceFormSubmit);
    document.getElementById('maintenance-edit-form')?.addEventListener('submit', handleMaintenanceEditFormSubmit);

    // Close modal listeners for buttons with data-modal-id
    document.querySelectorAll('.close-modal-btn, .modal-footer .btn-secondary').forEach(btn => {
        const modalIdWithSuffix = (btn as HTMLElement).dataset.modalId;
        if (modalIdWithSuffix) {
            const modalId = modalIdWithSuffix.replace('-modal', '');
            btn.addEventListener('click', () => closeModal(modalId as any));
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                const modalId = overlay.id.replace('-modal-overlay', '');
                closeModal(modalId as any);
            }
        });
    });

    // Customer Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const content = accordionItem.querySelector('.accordion-content') as HTMLElement;
            const arrow = header.querySelector('.accordion-arrow');
            
            accordionItem.classList.toggle('active');
            if (accordionItem.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 40 + "px"; // Add padding
                if(arrow) (arrow as HTMLElement).style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = null;
                if(arrow) (arrow as HTMLElement).style.transform = 'rotate(0deg)';
            }
        });
    });

    // Search functionality
    const handleSearch = (e: Event) => {
        const searchTerm = (e.target as HTMLInputElement).value;
        setState({ searchTerm });
    };
    document.getElementById('vehicle-search')?.addEventListener('input', handleSearch);
    document.getElementById('customer-search')?.addEventListener('input', handleSearch);
    document.getElementById('rental-search')?.addEventListener('input', handleSearch);
    document.getElementById('reservation-search')?.addEventListener('input', handleSearch);
    document.getElementById('maintenance-search')?.addEventListener('input', handleSearch);

    // Clear Maintenance Filter Button
    document.getElementById('clear-maintenance-filter')?.addEventListener('click', () => {
        setState({ searchTerm: '' });
    });

    // Vehicle Page Expiring Filter Button
    document.getElementById('filter-expiring-btn')?.addEventListener('click', () => {
        setState({ filterExpiring: !state.filterExpiring });
    });

    // Rental Modal Customer Type Toggle
    document.querySelectorAll('input[name="customerType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = (e.target as HTMLInputElement).value;
            
            // Toggle required attributes to fix form submission
            const customerSelect = document.getElementById('customer-id-select') as HTMLSelectElement;
            const newCustomerName = document.getElementById('new-customer-name') as HTMLInputElement;
            const newCustomerTc = document.getElementById('new-customer-tc') as HTMLInputElement;
            const newCustomerPhone = document.getElementById('new-customer-phone') as HTMLInputElement;

            if (value === 'new') {
                customerSelect.required = false;
                newCustomerName.required = true;
                newCustomerTc.required = true;
                newCustomerPhone.required = true;
            } else {
                customerSelect.required = true;
                newCustomerName.required = false;
                newCustomerTc.required = false;
                newCustomerPhone.required = false;
            }

            setState({ rentalFormCustomerType: value as 'existing' | 'new' });
        });
    });

    // Reservation Modal Customer Type Toggle
    document.querySelectorAll('input[name="customerType"][id^="res-"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = (e.target as HTMLInputElement).value;
            const existingSection = document.getElementById('res-existing-customer-section');
            const newSection = document.getElementById('res-new-customer-section');
            const customerSelect = document.getElementById('res-customer-id-select') as HTMLSelectElement;
            const newName = document.getElementById('res-new-customer-name') as HTMLInputElement;
            const newPhone = document.getElementById('res-new-customer-phone') as HTMLInputElement;

            existingSection.style.display = value === 'existing' ? 'flex' : 'none';
            newSection.style.display = value === 'new' ? 'block' : 'none';
            customerSelect.required = value === 'existing';
            newName.required = value === 'new';
            newPhone.required = value === 'new';
        });
    });

    // Auto-calculate next maintenance date/km
    const maintenanceKmInput = document.getElementById('maintenance-km') as HTMLInputElement;
    const maintenanceDateInput = document.getElementById('maintenance-date') as HTMLInputElement;
    const nextKmInput = document.getElementById('next-maintenance-km') as HTMLInputElement;
    const nextDateInput = document.getElementById('next-maintenance-date') as HTMLInputElement;

    const updateNextMaintenance = () => {
        if (maintenanceKmInput && nextKmInput) {
            nextKmInput.value = (parseInt(maintenanceKmInput.value || '0') + 15000).toString();
        }
        if (maintenanceDateInput && nextDateInput && maintenanceDateInput.value) {
            const nextDate = new Date(maintenanceDateInput.value);
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            nextDateInput.value = nextDate.toISOString().split('T')[0];
        }
    };

    maintenanceKmInput?.addEventListener('input', updateNextMaintenance);
    maintenanceDateInput?.addEventListener('input', updateNextMaintenance);
    // console.log('Event listeners attached successfully.');
    } catch (error) {
        console.error('!!! HATA: attachEventListeners fonksiyonunda bir sorun oluştu:', error);
    }
}

function handleVehicleFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
    const insuranceFile = formData.get('insuranceFile') as File; // Belge dosyalarını al
    const inspectionFile = formData.get('inspectionFile') as File;
    const licenseFile = formData.get('licenseFile') as File;

    const vehicleDataUpdate: any = {
        plate: formData.get('plate') as string,
        brand: `${formData.get('brand')} ${formData.get('model')}`,
        km: (formData.get('km') as string || '').replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        status: formData.get('status') as string, // Formdan gelen verileri al
        insuranceDate: formData.get('insuranceDate') as string,
        inspectionDate: formData.get('inspectionDate') as string,
    };

    if (state.editingVehicleIndex !== null) {
        // Editing existing vehicle
        const originalVehicle = vehiclesData[state.editingVehicleIndex];

        // Dosya güncellemelerini yönet: sadece yeni bir dosya seçilmişse güncelle
        if (insuranceFile && insuranceFile.size > 0) {
            if (originalVehicle.insuranceFileUrl) URL.revokeObjectURL(originalVehicle.insuranceFileUrl);
            vehicleDataUpdate.insuranceFile = insuranceFile.name;
            vehicleDataUpdate.insuranceFileUrl = URL.createObjectURL(insuranceFile);
        }
        if (inspectionFile && inspectionFile.size > 0) {
            if (originalVehicle.inspectionFileUrl) URL.revokeObjectURL(originalVehicle.inspectionFileUrl);
            vehicleDataUpdate.inspectionFile = inspectionFile.name;
            vehicleDataUpdate.inspectionFileUrl = URL.createObjectURL(inspectionFile);
        }
        if (licenseFile && licenseFile.size > 0) {
            if (originalVehicle.licenseFileUrl) URL.revokeObjectURL(originalVehicle.licenseFileUrl);
            vehicleDataUpdate.licenseFile = licenseFile.name;
            vehicleDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
        }

        vehiclesData[state.editingVehicleIndex] = { ...originalVehicle, ...vehicleDataUpdate };
    } else {
        // Adding new vehicle
        if (insuranceFile && insuranceFile.size > 0) {
            vehicleDataUpdate.insuranceFile = insuranceFile.name;
            vehicleDataUpdate.insuranceFileUrl = URL.createObjectURL(insuranceFile);
        }
        if (inspectionFile && inspectionFile.size > 0) {
            vehicleDataUpdate.inspectionFile = inspectionFile.name;
            vehicleDataUpdate.inspectionFileUrl = URL.createObjectURL(inspectionFile);
        }
        if (licenseFile && licenseFile.size > 0) {
            vehicleDataUpdate.licenseFile = licenseFile.name;
            vehicleDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
        }
        logActivity('fa-car-side', `<strong>${vehicleDataUpdate.plate}</strong> plakalı yeni araç filoya eklendi.`);
        vehiclesData.unshift(vehicleDataUpdate); // Add to the beginning of the array
    }

    setState({
        isVehicleModalOpen: false,
        editingVehicleIndex: null,
    });
    showToast(state.editingVehicleIndex !== null ? 'Araç başarıyla güncellendi.' : 'Yeni araç başarıyla eklendi.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleVehicleFormSubmit içinde:", error);
    }
}

function handleCustomerFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
    const idFile = formData.get('idFile') as File;
    const licenseFile = formData.get('licenseFile') as File;

    const customerDataUpdate: any = {
        name: formData.get('name') as string,
        tc: formData.get('tc') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        licenseNumber: formData.get('licenseNumber') as string,
        licenseDate: formData.get('licenseDate') as string,
        address: formData.get('address') as string,
    };

    if (state.editingCustomerIndex !== null) {
        // Editing existing customer
        const originalCustomer = customersData[state.editingCustomerIndex];
        if (idFile && idFile.size > 0) {
            if (originalCustomer.idFileUrl) URL.revokeObjectURL(originalCustomer.idFileUrl);
            customerDataUpdate.idFile = idFile.name;
            customerDataUpdate.idFileUrl = URL.createObjectURL(idFile);
        }
        if (licenseFile && licenseFile.size > 0) {
            if (originalCustomer.licenseFileUrl) URL.revokeObjectURL(originalCustomer.licenseFileUrl);
            customerDataUpdate.licenseFile = licenseFile.name;
            customerDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
        }
        customersData[state.editingCustomerIndex] = { ...originalCustomer, ...customerDataUpdate };
    } else {
        // Adding new customer
        if (idFile && idFile.size > 0) {
            customerDataUpdate.idFile = idFile.name;
            customerDataUpdate.idFileUrl = URL.createObjectURL(idFile);
        }
        if (licenseFile && licenseFile.size > 0) {
            customerDataUpdate.licenseFile = licenseFile.name;
            customerDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
        }
        const newCustomer: Customer = {
            id: Date.now(),
            rentals: [],
            ...customerDataUpdate
        };
        logActivity('fa-user-plus', `<strong>${newCustomer.name}</strong> adında yeni müşteri kaydedildi.`);
        customersData.unshift(newCustomer);
    }

    setState({
        isCustomerModalOpen: false,
        editingCustomerIndex: null,
    });
    showToast(state.editingCustomerIndex !== null ? 'Müşteri bilgileri güncellendi.' : 'Yeni müşteri başarıyla eklendi.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleCustomerFormSubmit içinde:", error);
    }
}

function handleRentalEditFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const rentalId = parseInt(formData.get('rentalId') as string, 10);

    try {
    const rentalIndex = rentalsData.findIndex(r => r.id === rentalId);
    if (rentalIndex === -1) return;

    const originalRental = rentalsData[rentalIndex];
    const contractFile = formData.get('contractFile') as File;
    const invoiceFile = formData.get('invoiceFile') as File;

    const rentalDataUpdate: any = {
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string || null,
        startKm: parseInt(formData.get('startKm') as string, 10),
        endKm: formData.get('endKm') ? parseInt(formData.get('endKm') as string, 10) : null,
    };

    if (contractFile && contractFile.size > 0) {
        if (originalRental.contractFileUrl) URL.revokeObjectURL(originalRental.contractFileUrl);
        rentalDataUpdate.contractFile = contractFile.name;
        rentalDataUpdate.contractFileUrl = URL.createObjectURL(contractFile);
    }
    if (invoiceFile && invoiceFile.size > 0) {
        if (originalRental.invoiceFileUrl) URL.revokeObjectURL(originalRental.invoiceFileUrl);
        rentalDataUpdate.invoiceFile = invoiceFile.name;
        rentalDataUpdate.invoiceFileUrl = URL.createObjectURL(invoiceFile);
    }

    rentalsData[rentalIndex] = { ...originalRental, ...rentalDataUpdate };
    setState({ isRentalEditModalOpen: false, editingRentalId: null });
    showToast('Kiralama kaydı güncellendi.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleRentalEditFormSubmit içinde:", error);
    }
}

function handleReservationEditFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const reservationId = parseInt(formData.get('reservationId') as string, 10);

    try {
    const resIndex = reservationsData.findIndex(r => r.id === reservationId);
    if (resIndex === -1) return;

    const originalReservation = reservationsData[resIndex];

    const updatedReservation: Reservation = {
        ...originalReservation,
        vehiclePlate: formData.get('vehiclePlate') as string,
        customerId: parseInt(formData.get('customerId') as string, 10),
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        deliveryLocation: formData.get('deliveryLocation') as string,
        notes: formData.get('notes') as string || null,
    };

    reservationsData[resIndex] = updatedReservation;
    setState({ isReservationEditModalOpen: false, editingReservationId: null });
    showToast('Rezervasyon güncellendi.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleReservationEditFormSubmit içinde:", error);
    }
}

function handleReservationFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
    let customerId: number;
    const customerType = formData.get('customerType');

    if (customerType === 'new') {
        const newCustomer: Customer = {
            id: Date.now(),
            name: formData.get('newCustomerName') as string,
            phone: formData.get('newCustomerPhone') as string,
            tc: '', email: '', address: '', licenseNumber: '', licenseDate: '',
            idFile: null, idFileUrl: null, licenseFile: null, licenseFileUrl: null,
            rentals: [],
        };
        customersData.unshift(newCustomer);
        customerId = newCustomer.id;
    } else {
        customerId = parseInt(formData.get('customerId') as string, 10);
        if (!customersData.some(c => c.id === customerId)) {
            showToast('Lütfen geçerli bir müşteri seçin.', 'error');
            return;
        }
    }

    const vehiclePlate = formData.get('vehiclePlate') as string;
    if (!vehiclesData.some(v => v.plate === vehiclePlate)) {
        showToast('Lütfen geçerli bir araç seçin.', 'error');
        return;
    }

    const newReservation: Reservation = {
        id: Date.now(),
        vehiclePlate: vehiclePlate,
        customerId: customerId,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        deliveryLocation: formData.get('deliveryLocation') as string,
        notes: formData.get('notes') as string || null,
        status: 'active',
    };

    reservationsData.unshift(newReservation);
    setState({ isReservationModalOpen: false });
    showToast('Yeni rezervasyon başarıyla oluşturuldu.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleReservationFormSubmit içinde:", error);
    }
}

function handleRentalFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
    let customerId: number;
    let customerName: string;
    let customerPhone: string;

    const customerType = formData.get('customerType');

    if (customerType === 'new') {
        // Create and add new customer
        const newCustomer: Customer = {
            id: Date.now(), // Simple unique ID
            name: formData.get('newCustomerName') as string,
            tc: formData.get('newCustomerTc') as string,
            phone: formData.get('newCustomerPhone') as string,
            email: formData.get('newCustomerEmail') as string,
            address: '',
            licenseNumber: '',
            licenseDate: '',
            idFile: null, idFileUrl: null,
            licenseFile: null, licenseFileUrl: null,
            rentals: [],
        };
        customersData.unshift(newCustomer);
        customerId = newCustomer.id;
        customerName = newCustomer.name;
        customerPhone = newCustomer.phone;
    } else {
        // Get existing customer
        customerId = parseInt(formData.get('customerId') as string, 10);
        const customer = customersData.find(c => c.id === customerId);
        if (!customer) {
            showToast('Lütfen geçerli bir müşteri seçin.', 'error');
            return;
        }
        customerName = customer.name;
        customerPhone = customer.phone;
    }

    // Create new rental record
    const newRental: Rental = {
        id: Date.now(),
        vehiclePlate: formData.get('vehiclePlate') as string,
        customerId: customerId,
        startDate: formData.get('startDate') as string,
        endDate: null,
        startKm: parseInt((formData.get('startKm') as string).replace(/,/, ''), 10),
        endKm: null,
        price: parseFloat(formData.get('price') as string),
        priceType: formData.get('priceType') as 'daily' | 'monthly',
        totalCost: null,
        contractFile: null, contractFileUrl: null,
        invoiceFile: null, invoiceFileUrl: null,
        status: 'active',
    };
    rentalsData.unshift(newRental);

    // Update vehicle status
    const vehicleIndex = vehiclesData.findIndex(v => v.plate === newRental.vehiclePlate);
    if (vehicleIndex > -1) {
        vehiclesData[vehicleIndex].status = 'Kirada';
        vehiclesData[vehicleIndex].rentedBy = { name: customerName, phone: customerPhone };
        vehiclesData[vehicleIndex].activeRentalId = newRental.id;
        logActivity('fa-file-signature', `<strong>${customerName}</strong>, <em>${newRental.vehiclePlate}</em> plakalı aracı kiraladı.`);
    }

    // Close modal and re-render
    setState({ isRentalModalOpen: false });
    showToast('Kiralama başarıyla başlatıldı.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleRentalFormSubmit içinde:", error);
    }
}

function handleCheckInFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
    const rentalId = parseInt(formData.get('rentalId') as string, 10);
    const returnDate = formData.get('returnDate') as string;
    const returnKm = parseInt(formData.get('returnKm') as string, 10);

    // Find and update rental
    const rentalIndex = rentalsData.findIndex(r => r.id === rentalId);
    if (rentalIndex === -1) {
        showToast('Hata: Kiralama kaydı bulunamadı.', 'error');
        return;
    }
    const rental = rentalsData[rentalIndex];
    rental.endDate = returnDate;
    rental.endKm = returnKm;
    rental.status = 'completed';

    // Calculate total cost
    const startDate = new Date(rental.startDate);
    const endDate = new Date(returnDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysRented = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Min 1 day
    
    if (rental.priceType === 'daily') {
        rental.totalCost = daysRented * rental.price;
    } else { // monthly
        const monthsRented = daysRented / 30;
        rental.totalCost = monthsRented * rental.price;
    }

    // Find and update vehicle
    const vehicleIndex = vehiclesData.findIndex(v => v.plate === rental.vehiclePlate);
    if (vehicleIndex > -1) {
        vehiclesData[vehicleIndex].status = 'Müsait';
        vehiclesData[vehicleIndex].km = returnKm.toLocaleString('tr-TR');
        delete vehiclesData[vehicleIndex].rentedBy;
        delete vehiclesData[vehicleIndex].activeRentalId;
        const customer = customersData.find(c => c.id === rental.customerId);
        if (customer) {
            logActivity('fa-right-to-bracket', `<em>${rental.vehiclePlate}</em> plakalı araç <strong>${customer.name}</strong>'dan teslim alındı.`);
        }
    }

    // Close modal and re-render
    setState({ isCheckInModalOpen: false });
    showToast('Araç başarıyla teslim alındı.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleCheckInFormSubmit içinde:", error);
    }
}

function handleMaintenanceFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
    const newMaintenance: Maintenance = {
        id: Date.now(),
        vehiclePlate: formData.get('vehiclePlate') as string,
        maintenanceDate: formData.get('maintenanceDate') as string,
        maintenanceKm: parseInt(formData.get('maintenanceKm') as string, 10),
        type: formData.get('type') as string,
        cost: parseFloat(formData.get('cost') as string),
        description: formData.get('description') as string,
        nextMaintenanceKm: parseInt(formData.get('nextMaintenanceKm') as string, 10),
        nextMaintenanceDate: formData.get('nextMaintenanceDate') as string,
    };

    maintenanceData.unshift(newMaintenance);
    logActivity('fa-oil-can', `<em>${newMaintenance.vehiclePlate}</em> plakalı araca bakım kaydı girildi.`);
    setState({ isMaintenanceModalOpen: false });
    showToast('Bakım kaydı başarıyla oluşturuldu.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleMaintenanceFormSubmit içinde:", error);
    }
}

function handleMaintenanceEditFormSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const maintenanceId = parseInt(formData.get('maintenanceId') as string, 10);

    try {
    const maintIndex = maintenanceData.findIndex(m => m.id === maintenanceId);
    if (maintIndex === -1) return;

    const originalMaintenance = maintenanceData[maintIndex];

    const updatedMaintenance: Maintenance = {
        ...originalMaintenance,
        vehiclePlate: formData.get('vehiclePlate') as string,
        maintenanceDate: formData.get('maintenanceDate') as string,
        maintenanceKm: parseInt(formData.get('maintenanceKm') as string, 10),
        type: formData.get('type') as string,
        cost: parseFloat(formData.get('cost') as string),
        description: formData.get('description') as string,
        nextMaintenanceKm: parseInt(formData.get('nextMaintenanceKm') as string, 10),
        nextMaintenanceDate: formData.get('nextMaintenanceDate') as string,
    };

    maintenanceData[maintIndex] = updatedMaintenance;
    setState({ isMaintenanceEditModalOpen: false, editingMaintenanceId: null });
    showToast('Bakım kaydı güncellendi.', 'success');
    } catch(error) {
        console.error("!!! HATA: handleMaintenanceEditFormSubmit içinde:", error);
    }
}

function formatTimeAgo(date: Date | string | undefined): string {
    // Güvenli date parse
    if (!date) return "Bilinmiyor";
    
    let parsedDate: Date;
    try {
        parsedDate = date instanceof Date ? date : new Date(date);
        // Invalid date kontrolü
        if (isNaN(parsedDate.getTime())) {
            return "Bilinmiyor";
        }
    } catch (e) {
        console.warn('formatTimeAgo: Date parse hatası:', date);
        return "Bilinmiyor";
    }
    
    const seconds = Math.floor((new Date().getTime() - parsedDate.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yıl önce";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " ay önce";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " gün önce";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " saat önce";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " dakika önce";
    return "az önce";
}


function generateRentalSummaryPDF(rental: Rental) {
    try {
        // jsPDF kontrolü
        if (!(window as any).jspdf) {
            showToast("PDF kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin.", "error");
            console.error("jsPDF bulunamadı. window.jspdf:", (window as any).jspdf);
            return;
        }

        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

        // Default font ayarla (built-in Helvetica)
        doc.setFont('helvetica', 'normal');

        const customer = customersData.find(c => c.id === rental.customerId);
        const vehicle = vehiclesData.find(v => v.plate === rental.vehiclePlate);

        const formatDate = (dateInput: Date | string | null): string => {
            if (!dateInput) return 'Belirtilmemiş';
            return new Date(dateInput).toLocaleDateString('tr-TR');
        };
        const formatKm = (km: number | null) => km ? km.toLocaleString('tr-TR') : '0';
        const formatPrice = (price: number) => '₺' + price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const startDate = rental.startDate ? new Date(rental.startDate) : null;
        const endDate = rental.endDate ? new Date(rental.endDate) : null;

        let totalDays = 0;
        if (startDate && endDate) {
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        const usedKm = (rental.endKm && rental.startKm) ? (rental.endKm - rental.startKm) : 0;
        
        // Fiyat hesaplamaları
        const dailyRate = rental.price || 0;
        const kmLimit = 250; // günlük km limiti
        const totalKmLimit = kmLimit * totalDays;
        const kmExcess = Math.max(0, usedKm - totalKmLimit);
        const kmExcessCost = kmExcess * 3; // 3 TL/km
        const extraServices = 150; // Sabit ek hizmet ücreti
        const subtotal = (dailyRate * totalDays);
        const totalCost = subtotal + kmExcessCost + extraServices;

        // Renkler - Modern gradient paleti
        const primaryBlue = [41, 98, 255]; // #2962FF - Parlak mavi
        const darkBlue = [13, 71, 161]; // #0D47A1 - Koyu mavi
        const accentOrange = [255, 111, 0]; // #FF6F00 - Turuncu
        const successGreen = [0, 200, 83]; // #00C853 - Yeşil
        const textDark = [33, 33, 33];
        const textGray = [97, 97, 97];
        const lightGray = [245, 245, 245];
        const white = [255, 255, 255];

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let y = 0;

        // ========== HEADER SECTION - Gradient Background ==========
        // Gradient effect (yukarıdan aşağıya mavi tonları)
        for (let i = 0; i < 50; i++) {
            const ratio = i / 50;
            const r = primaryBlue[0] + (darkBlue[0] - primaryBlue[0]) * ratio;
            const g = primaryBlue[1] + (darkBlue[1] - primaryBlue[1]) * ratio;
            const b = primaryBlue[2] + (darkBlue[2] - primaryBlue[2]) * ratio;
            doc.setFillColor(r, g, b);
            doc.rect(0, i * 1.4, pageWidth, 1.5, 'F');
        }

        y = 25;

        // Logo placeholder (sol üst - beyaz kutu)
        if (state.settings.pdfSettings.showLogo && state.settings.companyInfo.logo) {
            try {
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(margin, 12, 45, 20, 3, 3, 'F');
                const imgFormat = state.settings.companyInfo.logo.match(/^data:image\/(png|jpe?g);base64,/) ? 
                    (state.settings.companyInfo.logo.includes('png') ? 'PNG' : 'JPEG') : 'PNG';
                doc.addImage(state.settings.companyInfo.logo, imgFormat, margin + 2, 14, 41, 16);
            } catch (e) { console.error("Logo eklenemedi:", e); }
        }

        // Sözleşme numarası (sağ üst - turuncu badge)
        doc.setFillColor(accentOrange[0], accentOrange[1], accentOrange[2]);
        doc.roundedRect(pageWidth - margin - 45, 12, 45, 10, 5, 5, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`SÖZLEŞME #${rental.id}`, pageWidth - margin - 22.5, 18.5, { align: 'center' });

        // Ana başlık
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('KİRALAMA ÖZETİ', pageWidth / 2, y, { align: 'center' });
        
        y += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(state.settings.companyInfo.name.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        
        y += 3;
        doc.setFontSize(10);
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, y, { align: 'center' });

        y += 15;

        // ========== BODY - Beyaz background ==========
        doc.setFillColor(250, 250, 250);
        doc.rect(0, y, pageWidth, pageHeight - y, 'F');

        y += 12;

        // ========== Helper Functions ==========
        const drawCard = (title: string, iconText: string, iconBg: number[], contentHeight: number, drawContent: () => void) => {
            const cardStartY = y;
            
            // Card shadow effect
            doc.setFillColor(200, 200, 200);
            doc.roundedRect(margin + 1, cardStartY + 1, contentWidth, contentHeight, 4, 4, 'F');
            
            // Card background
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, cardStartY, contentWidth, contentHeight, 4, 4, 'F');
            
            // Card border
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, cardStartY, contentWidth, contentHeight, 4, 4, 'S');
            
            // Üst renkli çizgi
            doc.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
            doc.rect(margin, cardStartY, contentWidth, 3, 'F');
            
            // Icon badge (sol üst)
            doc.setFillColor(iconBg[0], iconBg[1], iconBg[2]);
            doc.roundedRect(margin + 5, cardStartY + 8, 12, 8, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(iconText, margin + 11, cardStartY + 13.5, { align: 'center' });
            
            // Card title
            doc.setFontSize(13);
            doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 20, cardStartY + 13);
            
            y = cardStartY + 20;
            drawContent();
            
            y = cardStartY + contentHeight + 8;
        };

        const drawInfoRow = (label: string, value: string, xOffset: number = 0, isHighlight: boolean = false) => {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.text(label, margin + 8 + xOffset, y);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            if (isHighlight) {
                doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            } else {
                doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            }
            doc.text(value, margin + 8 + xOffset, y + 5);
            
            y += 12;
        };

        // ========== ARAÇ BİLGİLERİ CARD ==========
        drawCard('ARAÇ BİLGİLERİ', '🚗', primaryBlue, 60, () => {
            const col2X = contentWidth / 2;
            
            // Sol kolon
            let tempY = y;
            y = tempY;
            drawInfoRow('MARKA', vehicle?.brand?.split(' ')[0] || 'N/A', 0, false);
            y = tempY + 12;
            drawInfoRow('MODEL', vehicle?.brand?.split(' ').slice(1).join(' ') || 'N/A', 0, false);
            y = tempY + 24;
            drawInfoRow('YIL', vehicle?.year?.toString() || '2023', 0, false);
            
            // Sağ kolon
            y = tempY;
            drawInfoRow('PLAKA', vehicle?.plate || 'N/A', col2X, true);
            y = tempY + 12;
            drawInfoRow('RENK', vehicle?.color || 'Belirtilmemiş', col2X, false);
            y = tempY + 24;
            drawInfoRow('YAKIT', vehicle?.fuelType || 'Benzin', col2X, false);
            
            y = tempY + 36;
        });

        // ========== MÜŞTERİ BİLGİLERİ CARD ==========
        drawCard('MÜŞTERİ BİLGİLERİ', '👤', successGreen, 60, () => {
            const col2X = contentWidth / 2;
            
            let tempY = y;
            y = tempY;
            drawInfoRow('AD SOYAD', customer?.name || 'N/A', 0, true);
            y = tempY + 12;
            drawInfoRow('TELEFON', customer?.phone || 'N/A', 0, false);
            y = tempY + 24;
            drawInfoRow('E-POSTA', customer?.email || 'Belirtilmemiş', 0, false);
            
            y = tempY;
            drawInfoRow('TC KİMLİK NO', customer?.tc || 'N/A', col2X, false);
            y = tempY + 12;
            drawInfoRow('EHLİYET NO', customer?.licenseNumber || 'N/A', col2X, false);
            y = tempY + 24;
            drawInfoRow('ADRES', customer?.address || 'Belirtilmemiş', col2X, false);
            
            y = tempY + 36;
        });

        // ========== KİRALAMA BİLGİLERİ CARD ==========
        drawCard('KİRALAMA DETAYLARI', '📋', accentOrange, 95, () => {
            const col2X = contentWidth / 2;
            
            // Durum badge
            const statusText = rental.status === 'active' ? 'AKTİF' : 'TAMAMLANDI';
            const statusColor = rental.status === 'active' ? successGreen : textGray;
            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.roundedRect(pageWidth - margin - 35, y - 5, 30, 7, 3, 3, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(statusText, pageWidth - margin - 20, y - 0.5, { align: 'center' });
            
            let tempY = y;
            y = tempY;
            drawInfoRow('BAŞLANGIÇ TARİHİ', formatDate(rental.startDate), 0, false);
            y = tempY + 12;
            drawInfoRow('BİTİŞ TARİHİ', formatDate(rental.endDate), 0, false);
            y = tempY + 24;
            drawInfoRow('TOPLAM GÜN', totalDays.toString() + ' gün', 0, true);
            
            y = tempY;
            drawInfoRow('ALIŞ YERİ', rental.pickupLocation || 'İstanbul', col2X, false);
            y = tempY + 12;
            drawInfoRow('İADE YERİ', rental.returnLocation || 'İstanbul', col2X, false);
            y = tempY + 24;
            drawInfoRow('GÜNLİK ÜCRET', formatPrice(dailyRate), col2X, false);
            
            y = tempY + 40;
            
            // KM Bilgileri - Görsel kutular
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            doc.text('KİLOMETRE DETAYLARI', margin + 8, y);
            
            y += 8;
            
            const kmBoxWidth = (contentWidth - 30) / 3;
            const kmBoxHeight = 18;
            
            // Teslim KM
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(margin + 8, y, kmBoxWidth, kmBoxHeight, 3, 3, 'F');
            doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.setLineWidth(1);
            doc.roundedRect(margin + 8, y, kmBoxWidth, kmBoxHeight, 3, 3, 'S');
            
            doc.setFontSize(8);
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.setFont('helvetica', 'normal');
            doc.text('Teslim KM', margin + 8 + kmBoxWidth/2, y + 6, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.text(formatKm(rental.startKm), margin + 8 + kmBoxWidth/2, y + 14, { align: 'center' });
            
            // Ok işareti
            doc.setFontSize(16);
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.text('→', margin + 8 + kmBoxWidth + 8, y + 11, { align: 'center' });
            
            // İade KM
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.roundedRect(margin + 8 + kmBoxWidth + 16, y, kmBoxWidth, kmBoxHeight, 3, 3, 'F');
            doc.setDrawColor(accentOrange[0], accentOrange[1], accentOrange[2]);
            doc.roundedRect(margin + 8 + kmBoxWidth + 16, y, kmBoxWidth, kmBoxHeight, 3, 3, 'S');
            
            doc.setFontSize(8);
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.setFont('helvetica', 'normal');
            doc.text('İade KM', margin + 8 + kmBoxWidth + 16 + kmBoxWidth/2, y + 6, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentOrange[0], accentOrange[1], accentOrange[2]);
            doc.text(formatKm(rental.endKm), margin + 8 + kmBoxWidth + 16 + kmBoxWidth/2, y + 14, { align: 'center' });
            
            // Eşittir işareti
            doc.setFontSize(16);
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.text('=', margin + 8 + (kmBoxWidth + 16) * 2 + 8, y + 11, { align: 'center' });
            
            // Kullanılan KM
            doc.setFillColor(successGreen[0], successGreen[1], successGreen[2]);
            doc.roundedRect(margin + 8 + (kmBoxWidth + 16) * 2 + 16, y, kmBoxWidth, kmBoxHeight, 3, 3, 'F');
            
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');
            doc.text('Kullanılan KM', margin + 8 + (kmBoxWidth + 16) * 2 + 16 + kmBoxWidth/2, y + 6, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(usedKm.toLocaleString('tr-TR'), margin + 8 + (kmBoxWidth + 16) * 2 + 16 + kmBoxWidth/2, y + 14, { align: 'center' });
            
            y += kmBoxHeight + 5;
        });

        // ========== FİYATLANDIRMA CARD ==========
        drawCard('FİYATLANDIRMA', '💰', darkBlue, 70, () => {
            // Tablo başlıkları
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            
            const labelX = margin + 8;
            const valueX = pageWidth - margin - 8;
            
            // Satırlar
            const rows = [
                { label: 'Günlük Kira Ücreti', value: formatPrice(dailyRate), bold: false },
                { label: `Kiralama Süresi (${totalDays} gün)`, value: formatPrice(subtotal), bold: false },
                { label: `KM Limit (${totalKmLimit} km dahil)`, value: '₺0.00', bold: false },
                { label: `KM Aşımı (${kmExcess} km × ₺3)`, value: formatPrice(kmExcessCost), bold: false },
                { label: 'Ek Hizmetler', value: formatPrice(extraServices), bold: false }
            ];
            
            rows.forEach((row, index) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
                doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(row.label, labelX, y);
                
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(textDark[0], textDark[1], textDark[2]);
                doc.text(row.value, valueX, y, { align: 'right' });
                
                y += 8;
                
                if (index < rows.length - 1) {
                    doc.line(labelX, y - 3, valueX, y - 3);
                }
            });
            
            y += 2;
            
            // Toplam - Vurgulu
            doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.rect(margin + 8, y - 3, contentWidth - 16, 12, 'F');
            
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('TOPLAM TUTAR', labelX + 3, y + 4);
            
            doc.setFontSize(15);
            doc.text(formatPrice(totalCost), valueX - 3, y + 4, { align: 'right' });
            
            y += 12;
        });

        // ========== FOOTER ==========
        if (state.settings.pdfSettings.showFooter) {
            y = pageHeight - 25;
            
            // Footer arka plan
            doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
            doc.rect(0, y, pageWidth, 25, 'F');
            
            y += 8;
            
            // Teşekkür mesajı
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!', pageWidth / 2, y, { align: 'center' });
            
            y += 6;
            
            // Şirket bilgileri
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(255, 255, 255);
            doc.text(`${state.settings.companyInfo.name} | ${state.settings.companyInfo.address}`, pageWidth / 2, y, { align: 'center' });
            
            y += 5;
            doc.text(`Tel: ${state.settings.companyInfo.phone} | Web: www.rehberotomotiv.com`, pageWidth / 2, y, { align: 'center' });
        }

        // Sözleşme numarası (sağ üst)
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(200 - margin - 50, y, 50, 8, 4, 4, 'F');
        doc.setDrawColor(224, 224, 224);
        doc.roundedRect(200 - margin - 50, y, 50, 8, 4, 4, 'S');
        doc.setFontSize(9);
        doc.setTextColor(26, 35, 126);
        doc.setFont('helvetica', 'bold');
        doc.text(`#${rental.id}`, 200 - margin - 25, y + 5.5, { align: 'center' });
        
        y += 15;

        // Logo (sol üstte)
        if (state.settings.pdfSettings.showLogo && state.settings.companyInfo.logo) {
            try {
                const imgFormat = state.settings.companyInfo.logo.match(/^data:image\/(png|jpe?g);base64,/) ? 
                    (state.settings.companyInfo.logo.includes('png') ? 'PNG' : 'JPEG') : 'PNG';
                doc.addImage(state.settings.companyInfo.logo, imgFormat, margin, y, 50, 30);
            } catch (e) { console.error("Logo eklenemedi:", e); }
        }
        
        y += 35;

        // ESKİ KOD SİLİNDİ - YENİ TASARIM YUKARI
            const startY = y;
            
            // Card arka plan
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, y, contentWidth, 0, 4, 4, 'F'); // Yükseklik sonra ayarlanacak
            doc.setDrawColor(224, 224, 224);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, y, contentWidth, 0, 4, 4, 'S');
            
            // Üst mavi çizgi
            doc.setDrawColor(26, 35, 126);
            doc.setLineWidth(1);
            doc.line(margin, y, margin + contentWidth, y);
            
            y += 8;
            
            // Card başlığı
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 35, 126);
            doc.text(`${icon} ${title}`, margin + 5, y);
            
            y += 8;
            
            // İçerik
            content();
            
            const cardHeight = y - startY + 3;
            // Card'ı tamamla (yükseklik düzeltmesi)
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, startY, contentWidth, cardHeight, 4, 4, 'F');
            doc.setDrawColor(224, 224, 224);
            doc.roundedRect(margin, startY, contentWidth, cardHeight, 4, 4, 'S');
            doc.setDrawColor(26, 35, 126);
            doc.setLineWidth(1);
            doc.line(margin, startY, margin + contentWidth, startY);
            
            y += 5;
        };

        // ARAÇ BİLGİLERİ CARD
        drawCard('ARAÇ BİLGİLERİ', '🚗', () => {
            const col1X = margin + 8;
            const col2X = margin + contentWidth/2 + 4;
            const labelSize = 9;
            const valueSize = 11;
            
            // Sol kolon
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('MARKA', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(vehicle?.brand?.split(' ')[0] || 'N/A', col1X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('YIL', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text('2023', col1X, y);
            
            // Sağ kolon (y'yi resetle)
            y -= 17;
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('MODEL', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(vehicle?.brand?.split(' ').slice(1).join(' ') || 'N/A', col2X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('PLAKA', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(vehicle?.plate || 'N/A', col2X, y);
            
            y += 3;
        });

        // KİRALAYAN BİLGİLERİ CARD
        drawCard('KİRALAYAN BİLGİLERİ', '👤', () => {
            const col1X = margin + 8;
            const col2X = margin + contentWidth/2 + 4;
            const labelSize = 9;
            const valueSize = 11;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('AD SOYAD', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(customer?.name || 'N/A', col1X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('TC KİMLİK NO', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(customer?.tc || 'N/A', col1X, y);
            
            y -= 17;
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('TELEFON', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(customer?.phone || 'N/A', col2X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('EHLİYET NO', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(customer?.licenseNumber || 'N/A', col2X, y);
            
            y += 3;
        });

        // KİRALAMA BİLGİLERİ CARD
        drawCard('KİRALAMA BİLGİLERİ', '📋', () => {
            // Durum badge
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(margin + contentWidth - 35, y - 5, 30, 6, 3, 3, 'F');
            doc.setDrawColor(224, 224, 224);
            doc.roundedRect(margin + contentWidth - 35, y - 5, 30, 6, 3, 3, 'S');
            doc.setFontSize(8);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text(rental.status === 'active' ? 'AKTİF' : 'TAMAMLANDI', margin + contentWidth - 20, y - 1, { align: 'center' });
            
            const col1X = margin + 8;
            const col2X = margin + contentWidth/2 + 4;
            const labelSize = 9;
            const valueSize = 11;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('ALIŞ TARİHİ', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(formatDate(rental.startDate), col1X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('ALIŞ YERİ', col1X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text('İstanbul', col1X, y);
            
            y -= 17;
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('İADE TARİHİ', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text(formatDate(rental.endDate), col2X, y);
            y += 7;
            
            doc.setFontSize(labelSize);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text('İADE YERİ', col2X, y);
            y += 5;
            doc.setFontSize(valueSize);
            doc.setTextColor(33, 33, 33);
            doc.setFont('helvetica', 'bold');
            doc.text('İstanbul', col2X, y);
            
            y += 10;
            
            // KM Bölümü başlığı
            doc.setFontSize(11);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text('⚡ KİLOMETRE BİLGİLERİ', margin + 8, y);
            
            y += 7;
            
            // KM Kutuları
            const kmBoxWidth = (contentWidth - 20) / 3 - 4;
            const kmBoxStartX = margin + 8;
            
            // Teslim Edilen KM
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(kmBoxStartX, y, kmBoxWidth, 15, 3, 3, 'F');
            doc.setDrawColor(224, 224, 224);
            doc.roundedRect(kmBoxStartX, y, kmBoxWidth, 15, 3, 3, 'S');
            doc.setFontSize(8);
            doc.setTextColor(97, 97, 97);
            doc.setFont('helvetica', 'normal');
            doc.text('Teslim Edilen KM', kmBoxStartX + kmBoxWidth/2, y + 5, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text(formatKm(rental.startKm), kmBoxStartX + kmBoxWidth/2, y + 12, { align: 'center' });
            
            // Ok işareti
            doc.setFontSize(16);
            doc.setTextColor(117, 117, 117);
            doc.text('→', kmBoxStartX + kmBoxWidth + 8, y + 10, { align: 'center' });
            
            // Alınan KM
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(kmBoxStartX + kmBoxWidth + 12, y, kmBoxWidth, 15, 3, 3, 'F');
            doc.setDrawColor(224, 224, 224);
            doc.roundedRect(kmBoxStartX + kmBoxWidth + 12, y, kmBoxWidth, 15, 3, 3, 'S');
            doc.setFontSize(8);
            doc.setTextColor(97, 97, 97);
            doc.setFont('helvetica', 'normal');
            doc.text('Alınan KM', kmBoxStartX + kmBoxWidth + 12 + kmBoxWidth/2, y + 5, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text(formatKm(rental.endKm), kmBoxStartX + kmBoxWidth + 12 + kmBoxWidth/2, y + 12, { align: 'center' });
            
            // Eşittir işareti
            doc.setFontSize(16);
            doc.setTextColor(117, 117, 117);
            doc.text('=', kmBoxStartX + (kmBoxWidth + 12) * 2 - 4, y + 10, { align: 'center' });
            
            // Kullanılan KM
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(kmBoxStartX + (kmBoxWidth + 12) * 2, y, kmBoxWidth, 15, 3, 3, 'F');
            doc.setDrawColor(224, 224, 224);
            doc.roundedRect(kmBoxStartX + (kmBoxWidth + 12) * 2, y, kmBoxWidth, 15, 3, 3, 'S');
            doc.setFontSize(8);
            doc.setTextColor(97, 97, 97);
            doc.setFont('helvetica', 'normal');
            doc.text('Kullanılan KM', kmBoxStartX + (kmBoxWidth + 12) * 2 + kmBoxWidth/2, y + 5, { align: 'center' });
            doc.setFontSize(14);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text(usedKm.toLocaleString('tr-TR'), kmBoxStartX + (kmBoxWidth + 12) * 2 + kmBoxWidth/2, y + 12, { align: 'center' });
            
            y += 18;
        });

        // FİYATLANDIRMA CARD
        drawCard('FİYATLANDIRMA', '💰', () => {
            const labelX = margin + 8;
            const valueX = margin + contentWidth - 8;
            
            // Tablo satırları
            const rows = [
                { label: 'Günlük Kira Bedeli', value: `₺${dailyRate.toLocaleString('tr-TR')}` },
                { label: 'Kiralama Süresi', value: `${totalDays} gün` },
                { label: 'KM Limit Aşımı', value: `₺${kmExcessCost.toLocaleString('tr-TR')}` },
                { label: 'Ek Hizmetler', value: `₺${extraServices.toLocaleString('tr-TR')}` }
            ];
            
            doc.setFontSize(10);
            rows.forEach((row, index) => {
                doc.setTextColor(97, 97, 97);
                doc.setFont('helvetica', 'normal');
                doc.text(row.label, labelX, y);
                doc.setTextColor(33, 33, 33);
                doc.setFont('helvetica', 'bold');
                doc.text(row.value, valueX, y, { align: 'right' });
                y += 6;
                
                // Ayırıcı çizgi (son satır hariç)
                if (index < rows.length - 1) {
                    doc.setDrawColor(224, 224, 224);
                    doc.setLineWidth(0.2);
                    doc.line(labelX, y - 2, valueX, y - 2);
                }
            });
            
            y += 3;
            
            // Toplam
            doc.setDrawColor(224, 224, 224);
            doc.setLineWidth(0.3);
            doc.line(labelX, y - 2, valueX, y - 2);
            y += 3;
            
            doc.setFontSize(13);
            doc.setTextColor(26, 35, 126);
            doc.setFont('helvetica', 'bold');
            doc.text('TOPLAM TUTAR', labelX, y);
            doc.text(`₺${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, y, { align: 'right' });
            
            y += 3;
        });

        // Footer
        if (state.settings.pdfSettings.showFooter) {
            y = 267 - 15;
            doc.setFontSize(9);
            doc.setTextColor(117, 117, 117);
            doc.setFont('helvetica', 'normal');
            doc.text(`© 2025 ${state.settings.companyInfo.name.toUpperCase()} | Tüm hakları saklıdır.`, 100, y, { align: 'center' });
            y += 4;
            doc.text(`${state.settings.companyInfo.address} | ${state.settings.companyInfo.phone}`, 100, y, { align: 'center' });
        }

        doc.output('dataurlnewwindow');

    } catch (error) {
        console.error("PDF oluşturma sırasında kritik bir hata oluştu:", error);
        showToast("PDF oluşturulamadı. Lütfen konsolu kontrol edin.", "error");
    }
}

/**
 * Ekranda geçici bir bildirim (toast) gösterir.
 * @param message Gösterilecek mesaj.
 * @param type 'success' veya 'error'
 * @param duration Bildirimin ekranda kalma süresi (ms).
 */
function showToast(message: string, type: 'success' | 'error' = 'success', duration: number = 4000) {
    // Toast container'ı oluştur veya mevcut olanı bul
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Animasyonla göster
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Belirtilen süre sonunda kaldır
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500); // CSS animasyonunun bitmesini bekle
    }, duration);
}

// Uygulama ilk yüklendiğinde verileri localStorage'dan yükleme fonksiyonu
function loadDataFromLocalStorage() {
    console.log('💾 loadDataFromLocalStorage() fonksiyonu çağrıldı');
    const savedData = localStorage.getItem('rehberOtomotivData');
    if (savedData) {
        try {
            const appData = JSON.parse(savedData);
            // Sadece appData'da varsa üzerine yaz, yoksa mevcut mockup veriyi koru.
            // JSON.parse, Date objelerini string'e çevirir. Bunları tekrar Date objesine dönüştürmemiz gerekiyor.
            if (appData.vehiclesData) vehiclesData = appData.vehiclesData; // Tarih objesi yok
            if (appData.customersData) customersData = appData.customersData; // Tarih objesi yok
            if (appData.maintenanceData) maintenanceData = appData.maintenanceData; // Tarih objesi yok

            if (appData.rentalsData) {
                rentalsData = appData.rentalsData.map(r => ({...r, startDate: new Date(r.startDate), endDate: r.endDate ? new Date(r.endDate) : null}));
            }
            if (appData.reservationsData) {
                reservationsData = appData.reservationsData.map(r => ({...r, startDate: new Date(r.startDate), endDate: new Date(r.endDate)}));
            }
            
            // Aktiviteler, JSON'dan yüklenirken Date objesine geri çevrilmeli.
            if (appData.activitiesData && Array.isArray(appData.activitiesData)) {
                activitiesData = appData.activitiesData.map(activity => {
                    if (!activity) return null;
                    
                    try {
                        let parsedDate = new Date();
                        
                        // Önce time, sonra date kontrolü
                        if (activity.time) {
                            parsedDate = new Date(activity.time);
                        } else if (activity.date) {
                            parsedDate = new Date(activity.date);
                        }
                        
                        // Geçersiz tarih kontrolü
                        if (isNaN(parsedDate.getTime())) {
                            console.warn('⚠️ Geçersiz aktivite tarihi:', activity);
                            parsedDate = new Date();
                        }
                        
                        return {
                            icon: activity.icon || 'fa-solid fa-circle-info',
                            message: activity.message || 'Bilinmeyen aktivite',
                            time: parsedDate
                        };
                    } catch (e) {
                        console.error('❌ Aktivite parse hatası:', activity, e);
                        return null;
                    }
                }).filter(Boolean); // Bozuk veya null kayıtları temizle
            }
            
            // State'e ait verileri yükle
            if (appData.theme) state.theme = appData.theme;
            if (appData.readNotifications) state.readNotifications = appData.readNotifications;
            // Ayarları birleştirerek yükle, böylece yeni eklenen ayarlar kaybolmaz
            if (appData.settings) {
                // Güvenli settings merge - nested objeleri koruyarak
                state.settings = { 
                    ...state.settings, 
                    ...appData.settings,
                    // Nested objeleri güvenli şekilde merge et
                    companyInfo: { 
                        ...state.settings.companyInfo, 
                        ...(appData.settings.companyInfo || {}) 
                    },
                    pdfSettings: { 
                        ...state.settings.pdfSettings, 
                        ...(appData.settings.pdfSettings || {}) 
                    },
                    firebaseConfig: { 
                        ...state.settings.firebaseConfig, 
                        ...(appData.settings.firebaseConfig || {}) 
                    }
                };
            }
        } catch (e) {
            console.error("!!! HATA: localStorage'dan veri okunurken bir sorun oluştu. Kayıtlı veri bozuk olabilir.", e);
        }
    }

    // İçe aktarma sonrası başarı mesajını göster
    if (localStorage.getItem('showImportSuccessToast') === 'true') {
        showToast('Veriler başarıyla içe aktarıldı!', 'success');
        localStorage.removeItem('showImportSuccessToast'); // Mesajı gösterdikten sonra işareti kaldır
    }
}

// Otomatik Firebase senkronizasyonu
async function autoSyncWithFirebase() {
    if (!state.settings?.firebaseEnabled || !state.settings?.firebaseAutoSync) {
        return;
    }
    
    // 🔒 Password check before auto-sync
    const savedPassword = state.settings?.firebaseMasterPassword || '';
    const correctPassword = '1259';
    if (savedPassword !== correctPassword) {
        console.warn('⚠️ Firebase ana şifresi ayarlanmamış veya yanlış. Otomatik sync iptal edildi.');
        return;
    }
    
    try {
        // Check if Firebase functions exist
        if (typeof loadDataFromFirebase === 'function' && typeof initializeFirebase === 'function') {
            const config = state.settings?.firebaseConfig;
            if (config?.apiKey && config?.databaseURL) {
                console.log('🔄 Otomatik Firebase senkronizasyonu başlatılıyor...');
                
                // Initialize Firebase
                initializeFirebase(config);
                
                // Load data from Firebase
                const data = await loadDataFromFirebase();
                
                // Update local data if Firebase has data
                if (data.vehiclesData) vehiclesData = data.vehiclesData;
                if (data.customersData) customersData = data.customersData;
                if (data.rentalsData) rentalsData = data.rentalsData;
                if (data.reservationsData) reservationsData = data.reservationsData;
                if (data.maintenanceData) maintenanceData = data.maintenanceData;
                if (data.activitiesData) activitiesData = data.activitiesData;
                if (data.settings) {
                    state.settings = { ...state.settings, ...data.settings };
                }
                
                // Save to localStorage
                saveDataToLocalStorage();
                
                console.log('✅ Firebase otomatik senkronizasyonu tamamlandı');
                showToast('Veriler Firebase\'den otomatik güncellendi! 🔄', 'success');
                
                // Re-render app with updated data
                renderApp();
            }
        }
    } catch (error) {
        console.error('❌ Otomatik Firebase senkronizasyon hatası:', error);
    }
}

// Sayfa kapatılırken otomatik Firebase yedekleme
async function autoBackupToFirebase() {
    if (!state.settings?.firebaseEnabled || !state.settings?.firebaseAutoSync) {
        return;
    }
    
    try {
        // Check if Firebase functions exist
        if (typeof sendDataToFirebase === 'function' && typeof initializeFirebase === 'function') {
            const config = state.settings?.firebaseConfig;
            if (config?.apiKey && config?.databaseURL) {
                console.log('💾 Sayfa kapatılıyor, veriler Firebase\'e yedekleniyor...');
                
                // Initialize Firebase
                initializeFirebase(config);
                
                // Prepare data
                const dataToSend = {
                    vehiclesData,
                    customersData,
                    rentalsData,
                    reservationsData,
                    maintenanceData,
                    activitiesData,
                    settings: state.settings,
                };
                
                await sendDataToFirebase(dataToSend);
                console.log('✅ Veriler Firebase\'e otomatik yedeklendi');
            }
        }
    } catch (error) {
        console.error('❌ Otomatik Firebase yedekleme hatası:', error);
    }
}

// PWA Install Prompt Handler
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).pwaInstallPrompt = e;
});

// Auto backup when page is closing
window.addEventListener('beforeunload', (e) => {
    autoBackupToFirebase();
});

// ELECTRON FIX: DOM yüklenene kadar bekle
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        console.log('⏳ DOM loading, DOMContentLoaded bekleniyor...');
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        console.log('✅ DOM zaten yüklü, hemen başlatılıyor...');
        initializeApp();
    }
}

function initializeApp() {
    console.log('🏁 Uygulama başlatılıyor...');
    console.log('📍 document.body:', document.body);
    console.log('📍 document.readyState:', document.readyState);
    
    try {
        loadDataFromLocalStorage(); // Uygulama açılırken verileri yükle
        
        // Ensure body is ready before rendering
        if (!document.body) {
            console.warn('⚠️ document.body henüz hazır değil, body load bekleniyor...');
            window.addEventListener('load', () => {
                console.log('✅ Window load event - body hazır');
                renderApp();
            });
        }
        
        // 🔥 Firebase'i otomatik başlat (eğer aktifse)
        if (state.settings?.firebaseEnabled && state.settings?.firebaseConfig?.apiKey) {
            setTimeout(async () => {
                try {
                    console.log('🔥 Firebase otomatik başlatılıyor...');
                    if (typeof initializeFirebase === 'function') {
                        await initializeFirebase(state.settings.firebaseConfig);
                        console.log('✅ Firebase başarıyla başlatıldı!');
                    }
                } catch (error) {
                    console.warn('⚠️ Firebase başlatma hatası:', error);
                }
            }, 1000); // 1 saniye bekle
        }
        
        renderApp();
        console.log('✅ Uygulama başarıyla başlatıldı!');
        
        // 🔥 OTOMATIK FIREBASE SYNC - Uygulama açılırken Firebase'den veri yükle
        if (state.settings?.firebaseEnabled && state.settings?.firebaseAutoSync) {
            setTimeout(async () => {
                console.log('🔄 Otomatik Firebase sync başlatılıyor...');
                try {
                    // 🔒 Firebase config kontrolü
                    if (!state.settings?.firebaseConfig || !state.settings?.firebaseConfig?.apiKey) {
                        console.warn('⚠️ Firebase konfigürasyonu eksik, auto-sync atlandı');
                        return;
                    }
                    
                    // Firebase'i başlat
                    if (typeof initializeFirebase === 'function') {
                        await initializeFirebase(state.settings?.firebaseConfig);
                    }
                    
                    // Veri çek
                    if (typeof fetchDataFromFirebase === 'function') {
                        const data = await fetchDataFromFirebase();
                        
                        if (data) {
                            // Firebase'den gelen verileri yükle
                            if (data.vehiclesData) {
                                vehiclesData.length = 0;
                                vehiclesData.push(...data.vehiclesData);
                            }
                            if (data.customersData) {
                                customersData.length = 0;
                                customersData.push(...data.customersData);
                            }
                            if (data.rentalsData) {
                                rentalsData.length = 0;
                                rentalsData.push(...data.rentalsData);
                            }
                            if (data.reservationsData) {
                                reservationsData.length = 0;
                                reservationsData.push(...data.reservationsData);
                            }
                            if (data.maintenanceData) {
                                maintenanceData.length = 0;
                                maintenanceData.push(...data.maintenanceData);
                            }
                            if (data.activitiesData && Array.isArray(data.activitiesData)) {
                                activitiesData.length = 0;
                                const convertedActivities = data.activitiesData.map((activity: any) => {
                                    // Date objesini güvenli şekilde parse et
                                    let parsedDate = new Date();
                                    try {
                                        // Önce time, sonra date kontrolü yap
                                        if (activity.time) {
                                            parsedDate = activity.time instanceof Date ? activity.time : new Date(activity.time);
                                        } else if (activity.date) {
                                            parsedDate = activity.date instanceof Date ? activity.date : new Date(activity.date);
                                        }
                                        
                                        // Geçersiz tarih kontrolü
                                        if (isNaN(parsedDate.getTime())) {
                                            parsedDate = new Date();
                                        }
                                    } catch (e) {
                                        console.warn('Date parse hatası:', activity);
                                        parsedDate = new Date();
                                    }
                                    return {
                                        icon: activity.icon || 'fa-solid fa-circle-info',
                                        message: activity.message || 'Bilinmeyen aktivite',
                                        time: parsedDate
                                    };
                                });
                                activitiesData.push(...convertedActivities);
                            }
                            
                            // Son yükleme saatini güncelle
                            const now = new Date();
                            const timeString = now.toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit', 
                                second: '2-digit' 
                            });
                            
                            setState({ 
                                settings: { 
                                    ...state.settings, 
                                    lastSyncDate: data.lastUpdate || new Date().toISOString(),
                                    lastSyncTime: timeString
                                } 
                            });
                            
                            showToast('✅ Firebase verisi yüklendi!', 'success');
                            console.log('✅ Firebase otomatik sync tamamlandı!', {
                                vehicles: vehiclesData.length,
                                customers: customersData.length,
                                time: timeString
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ Otomatik Firebase sync hatası:', error);
                }
            }, 1500); // 1.5 saniye bekle ki Firebase SDK yüklensin
        }
    } catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
    }
}

/**
 * Upload file to Firebase Storage
 * @param {File} file - Dosya objesi
 * @param {string} category - Kategori (Sigortalar, Muayeneler, vb.)
 * @param {Function} progressCallback - Progress callback (0-100)
 * @returns {Promise<string>} - Download URL
 */
async function uploadFileToStorage(file: File, category: string = 'Diğer', progressCallback: Function = null): Promise<string> {
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
async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
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
