/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log('🚀 index.js yükleniyor...');

// ============================================
// 🔥 FIREBASE CONFIG (Loaded via script tag in index.html)
// ============================================
/**
 * Firebase functions are now loaded globally via <script> tag in index.html
 * All functions are available on window object:
 * - initializeFirebase, testFirebaseConnection, sendDataToFirebase
 * - fetchDataFromFirebase, loadDataFromFirebase, setupFirebaseListener
 * - removeFirebaseListener, autoLoadFromFirebase
 * - uploadFileToStorage, deleteFileFromStorage, listAllFilesFromStorage
 */

console.log('✅ Firebase fonksiyonları window üzerinden kullanılabilir');
console.log('✅ initializeFirebase mevcut:', typeof window.initializeFirebase === 'function');

// ============================================
// 📳 HAPTIC FEEDBACK UTILITY
// ============================================
/**
 * Trigger haptic feedback (vibration) on mobile devices
 * @param {string} type - Type of haptic: 'light', 'medium', 'heavy', 'success', 'error', 'warning'
 */
function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return; // Browser doesn't support vibration

    const patterns = {
        light: [10],              // Quick tap
        medium: [20],             // Medium tap
        heavy: [30],              // Heavy tap
        success: [10, 50, 10],    // Double tap (success)
        error: [50, 100, 50],     // Buzz (error)
        warning: [30, 50, 30],    // Alert pattern
        delete: [20, 50, 20, 50, 20] // Triple tap (deletion)
    };

    const pattern = patterns[type] || patterns.light;

    try {
        navigator.vibrate(pattern);
    } catch (e) {
        // Silently fail if vibration doesn't work
        console.debug('Haptic feedback failed:', e);
    }
}

// 🔒 Render guard - prevent concurrent renders
let isRendering = false;

// 🚀 PWA Install - deferred prompt için global değişken
let deferredPrompt = null;

// Simple pseudo-ReactDOM render function
function render(element, container) {
    if (container) {
        container.innerHTML = element;
        // ⚡ Her render'da event listener'ları yeniden bağla (DOM yenileniyor)
        attachEventListeners();
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
    // ✅ YENİ: Dosya yönetimi modal'ları
    isDocumentUploadModalOpen: false,
    isDocumentPreviewModalOpen: false,
    isDocumentSelectorModalOpen: false,
    selectedDocument: null, // Önizleme/düzenleme için seçilen dosya
    documentSelectorCallback: null, // Dosya seçildiğinde çağrılacak callback
    documentSelectorCategory: null, // Seçici modalda gösterilecek kategori filtresi
    selectedDocumentsForForm: {}, // Form input'larına seçilen dosyalar: { inputId: docId }
    editingVehicleIndex: null,
    editingReservationId: null,
    editingMaintenanceId: null,
    editingCustomerIndex: null,
    editingRentalId: null,
    selectedVehicleForAction: null,
    theme: 'light', // For theme switching
    vehicleStatusFilter: null, // For dashboard filtering
    searchTerm: '', // For search functionality
    filterExpiring: false, // For vehicle page expiring filter
    rentalFormCustomerType: 'existing', // For the rental modal
    notificationFilter: 'all', // For notifications page
    readNotifications: [], // Array of timestamps for read notifications
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
        // Firebase Settings
        firebaseConfig: {
            apiKey: '',
            authDomain: '',
            databaseURL: '',
            projectId: '',
            storageBucket: '',
            messagingSenderId: '',
            appId: ''
        },
        firebaseEnabled: false,
        firebaseAutoSync: false,
        // PDF Settings
        companyInfo: {
            name: 'Rehber Rent a Car',
            address: 'Örnek Mah. Test Sk. No:1, İstanbul',
            phone: '0212 123 45 67',
            email: 'info@rehberrent.com',
            iban: 'TR00 0000 0000 0000 0000 0000',
            logo: null, // Will store base64
            pdfBackground: null, // NEW: For PDF background image
        },
        pdfSettings: {
            showLogo: true,
            showFooter: true,
            showBackground: true, // NEW: Toggle for background
        }
    },
    openSettingsAccordions: []
};
// State update function
function setState(newState, skipRender = false) {
    // 🔍 DEBUG: Kim çağırdı?
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';
    console.log('🔧 setState() çağrıldı | Caller:', caller, '| State keys:', Object.keys(newState), '| skipRender:', skipRender);

    state = Object.assign(Object.assign({}, state), newState);
    saveDataToLocalStorage(); // ÖNCE veriyi kaydet. Bu, eklenti çakışmalarını önler.

    // ✅ FIX: skipRender true ise renderApp() çağırma (accordion kapanmasını önle)
    if (!skipRender) {
        renderApp();
    }
}
// Verileri localStorage'a kaydetme fonksiyonu
function saveDataToLocalStorage() {
    try {
        const appData = {
            vehiclesData,
            customersData,
            rentalsData,
            reservationsData,
            maintenanceData,
            activitiesData,
            documentsData, // ✅ YENİ: Dosyalar
            theme: state.theme,
            readNotifications: state.readNotifications,
            settings: state.settings,
        };
        localStorage.setItem('rehberOtomotivData', JSON.stringify(appData));
    }
    catch (error) {
        console.error("!!! HATA: Veri localStorage'a kaydedilirken bir sorun oluştu:", error);
    }
}
// Navigation function
function navigateTo(pageId) {
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
    { id: 'documents', icon: 'fa-solid fa-folder-open', text: 'Dosyalar' }, // ✅ YENİ
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
let activitiesData = [];
function logActivity(icon, message) {
    activitiesData.unshift({ icon, message, time: new Date() }); // Store as Date object
    if (activitiesData.length > 10)
        activitiesData.pop(); // Keep the list size manageable
}

/**
 * ========================================
 * DOCUMENTS DATA - DOSYA YÖNETİMİ
 * ========================================
 */
let documentsData = [
    // Örnek veri yapısı:
    // {
    //     id: 1,
    //     name: "34ABC123_sigorta_2024.pdf",
    //     category: "Sigortalar", // Faturalar, Sigortalar, Muayeneler, Ruhsatlar, Diger
    //     type: "pdf", // pdf, image
    //     storageType: "firebase", // firebase veya local (Base64)
    //     url: "https://storage.googleapis.com/.../file.pdf", // Firebase Storage URL
    //     fileData: null, // Base64 data (sadece local storage için)
    //     size: 1245678, // bytes
    //     uploadDate: "2024-01-15T10:30:00",
    //     linkedVehicles: ["34 ABC 123"], // Hangi araçlara bağlı (opsiyonel)
    //     tags: ["2024", "kasko"], // Arama için (opsiyonel)
    //     description: "2024 Kasko Poliçesi" // Açıklama (opsiyonel)
    // }
];

let vehiclesData = [
    { plate: '34 ABC 123', brand: 'Ford Focus', km: '120,500', status: 'Müsait', insuranceDate: '2025-10-15', inspectionDate: '2025-08-01', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '06 XYZ 789', brand: 'Renault Clio', km: '85,200', status: 'Kirada', insuranceDate: '2024-12-20', inspectionDate: '2025-01-10', insuranceFile: 'sigorta.pdf', inspectionFile: null, licenseFile: 'ruhsat.jpg', rentedBy: { name: 'Mehmet Öztürk', phone: '0544 567 89 01' }, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null, activeRentalId: 1 },
    { plate: '35 DEF 456', brand: 'Fiat Egea', km: '45,000', status: 'Bakımda', insuranceDate: '2025-05-01', inspectionDate: '2024-11-22', insuranceFile: null, inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '16 GHI 789', brand: 'Volkswagen Passat', km: '180,000', status: 'Müsait', insuranceDate: '2025-02-28', inspectionDate: '2025-03-15', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: null, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null },
    { plate: '41 JKL 123', brand: 'Hyundai i20', km: '62,300', status: 'Kirada', insuranceDate: '2024-09-05', inspectionDate: '2025-09-05', insuranceFile: 'sigorta.pdf', inspectionFile: 'muayene.pdf', licenseFile: 'ruhsat.jpg', rentedBy: { name: 'Ayşe Kaya', phone: '0533 987 65 43' }, insuranceFileUrl: null, inspectionFileUrl: null, licenseFileUrl: null, activeRentalId: 2 },
];
let customersData = [
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
let rentalsData = [
    { id: 1, vehiclePlate: '06 XYZ 789', customerId: 3, startDate: '2024-05-10', endDate: null, startKm: 85200, endKm: null, price: 1200, priceType: 'daily', totalCost: null, contractFile: null, contractFileUrl: null, invoiceFile: null, invoiceFileUrl: null, status: 'active' },
    { id: 2, vehiclePlate: '41 JKL 123', customerId: 2, startDate: '2024-05-15', endDate: null, startKm: 62300, endKm: null, price: 25000, priceType: 'monthly', totalCost: null, contractFile: 'sozlesme.pdf', contractFileUrl: null, invoiceFile: null, invoiceFileUrl: null, status: 'active' },
];
let reservationsData = [
    { id: 1, vehiclePlate: '34 ABC 123', customerId: 1, startDate: '2024-06-20', endDate: '2024-06-25', deliveryLocation: 'Havaalanı', notes: 'Bebek koltuğu talep edildi.', status: 'active' },
];
let maintenanceData = [
    { id: 1, vehiclePlate: '35 DEF 456', maintenanceDate: '2024-05-01', maintenanceKm: 45000, type: 'Periyodik Bakım', cost: 2500, description: 'Yağ ve filtreler değişti. Genel kontrol yapıldı.', nextMaintenanceKm: 60000, nextMaintenanceDate: '2025-05-01' },
];
const getStatusClass = (status) => {
    if (status === 'Müsait' || status === 'completed')
        return 'available';
    if (status === 'Kirada' || status === 'active')
        return 'rented';
    if (status === 'Bakımda')
        return 'maintenance';
    return '';
};
const DashboardPage = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysUntil = (dateStr) => {
        if (!dateStr)
            return Infinity;
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
        if (!r.endDate)
            return false;
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
        const settingsKey = card.key;
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
    const upcomingReminders = [];
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
    const getReminderUrgency = (days) => {
        if (days <= 7)
            return 'urgent';
        if (days <= 15)
            return 'warning';
        return 'normal';
    };
    const getReminderText = (days) => {
        if (days < 0)
            return 'Geçti!';
        if (days === 0)
            return 'Bugün Son Gün!';
        if (days === 1)
            return 'Yarın Son Gün!';
        return `Son ${days} gün`;
    };
    const getReminderIcon = (type) => {
        if (type === 'Sigorta')
            return 'fa-shield-halved';
        if (type === 'Muayene')
            return 'fa-clipboard-check';
        if (type === 'Bakım')
            return 'fa-oil-can';
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
const VehiclesPage = () => {
    const daysUntil = (dateStr) => {
        if (!dateStr)
            return Infinity;
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
        .map((v, index) => (Object.assign(Object.assign({}, v), { originalIndex: index }))) // Keep original index
        .filter(v => {
        if (!state.filterExpiring)
            return true;
        const insuranceDays = daysUntil(v.insuranceDate);
        const inspectionDays = daysUntil(v.inspectionDate);
        return (insuranceDays >= 0 && insuranceDays <= reminderDays) || (inspectionDays >= 0 && inspectionDays <= reminderDays);
    })
        .filter(v => !state.vehicleStatusFilter || // If no filter, show all
        v.status === state.vehicleStatusFilter)
        .filter(v => v.plate.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(state.searchTerm.toLowerCase()))
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
const CustomersPage = () => {
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
        .map((c, index) => (Object.assign(Object.assign({}, c), { originalIndex: index })))
        .filter(c => c.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        c.tc.includes(state.searchTerm) ||
        c.phone.includes(state.searchTerm)).map((customer) => {
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
                                ${customer.idFile && customer.idFileUrl ?
            `<a href="${customer.idFileUrl}" target="_blank" class="btn-view" title="${customer.idFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` :
            `<button class="btn-upload btn-edit-customer"><i class="fa-solid fa-upload"></i> Yükle</button>`}
                            </div>
                            <div class="document-item">
                                <div class="document-info"><i class="fa-solid fa-id-card-clip"></i><span>Ehliyet</span></div>
                                ${customer.licenseFile && customer.licenseFileUrl ?
            `<a href="${customer.licenseFileUrl}" target="_blank" class="btn-view" title="${customer.licenseFile}"><i class="fa-solid fa-eye"></i> Görüntüle</a>` :
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
                                    `;
        }).join('')}
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
        `;
    }).join('')}
    </div>
    `;
};
const ReservationsPage = () => {
    const getCustomerName = (customerId) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen Müşteri';
    };
    const getVehicleBrand = (plate) => {
        const vehicle = vehiclesData.find(v => v.plate === plate);
        return vehicle ? vehicle.brand : 'Bilinmeyen Araç';
    };
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('tr-TR');
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
const MaintenancePage = () => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('tr-TR');
    const formatKm = (km) => km.toLocaleString('tr-TR') + ' KM';
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
        .filter(m => !state.searchTerm ||
        m.vehiclePlate.toLowerCase().includes(state.searchTerm.toLowerCase())).map(maint => `
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
const SettingsPage = () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _s2, _t, _u, _v, _w, _x;
    const createSettingCard = (title, content) => `
      <div class="setting-content-card">
          <h4>${title}</h4>
          ${content}
      </div>
  `;
    const createCheckbox = (id, label, checked = true) => `
      <div class="setting-checkbox">
          <input type="checkbox" id="${id}" data-setting-key="${id}" ${checked ? 'checked' : ''}>
          <label for="${id}">${label}</label>
      </div>
  `;
    const createColorTag = (label, colorVar) => `
      <div class="setting-color-tag">
          <span class="color-swatch" style="background-color: var(${colorVar})"></span>
          ${label}
      </div>
  `;
    const sections = [
		{
			id: 'dashboard',
			icon: 'fa-chart-pie',
            title: 'Gösterge Paneli',
            content: `
              ${createSettingCard('Metrik Görünürlüğü', `
                  ${createCheckbox('db_metric_total', 'Toplam Araç Kartı', state.settings.db_metric_total)}
                  ${createCheckbox('db_metric_rented', 'Aktif Kiralama Kartı', state.settings.db_metric_rented)}
                  ${createCheckbox('db_metric_maintenance', 'Bakımdaki Araçlar Kartı', state.settings.db_metric_maintenance)}
                  ${createCheckbox('db_metric_income', 'Aylık Gelir Kartı', state.settings.db_metric_income)}
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
			id: 'vehicles-reminders',
			icon: 'fa-car',
            title: 'Araç ve Hatırlatmalar',
            content: `
              ${createSettingCard('Hatırlatma Süresi', `
                  <p class="setting-description">Sigorta ve muayene gibi uyarıların kaç gün önceden gösterileceğini belirleyin.</p>
                  <input type="number" class="setting-input" data-setting-key="reminder_days" value="${state.settings.reminder_days}">
              `)}
              ${createSettingCard('Araç Kartı Butonları', `
                  <p class="setting-description">Araçlar sayfasındaki kartlarda görünecek işlem butonlarını seçin.</p>
                  ${createCheckbox('vehicle_btn_rent', 'Kirala Butonu', state.settings.vehicle_btn_rent)}
                  ${createCheckbox('vehicle_btn_checkin', 'Teslim Al Butonu', state.settings.vehicle_btn_checkin)}
                  ${createCheckbox('vehicle_btn_edit', 'Düzenle Butonu', state.settings.vehicle_btn_edit)}
              `)}
          `
        },
		{
			id: 'notifications',
			icon: 'fa-bell',
            title: 'Bildirimler',
            content: `
              ${createSettingCard('Bildirim Türleri', `
                  <p class="setting-description">Hangi durumlarda bildirim almak istediğinizi seçin.</p>
                  ${createCheckbox('notif_type_insurance', 'Sigorta Bitiş Uyarısı', state.settings.notif_type_insurance)}
                  ${createCheckbox('notif_type_inspection', 'Muayene Bitiş Uyarısı', state.settings.notif_type_inspection)}
                  ${createCheckbox('notif_type_activity', 'Yeni Sistem Aktiviteleri', state.settings.notif_type_activity)}
              `)}
          `
        },
		{
			id: 'pdf-report',
			icon: 'fa-solid fa-file-invoice',
            title: 'PDF & Rapor Ayarları',
            content: `
              ${createSettingCard('Şirket Bilgileri', `
                  <p class="setting-description">Raporlarda görünecek şirket bilgilerini buradan düzenleyebilirsiniz.</p>
                  <div class="form-group" style="margin-bottom: 12px;"><label>Şirket Ünvanı</label><input type="text" class="setting-input" data-company-key="name" value="${state.settings.companyInfo.name}"></div>
                  <div class="form-group" style="margin-bottom: 12px;"><label>Adres</label><input type="text" class="setting-input" data-company-key="address" value="${state.settings.companyInfo.address}"></div>
                  <div class="form-row" style="margin-bottom: 12px;">
                      <div class="form-group"><label>Telefon</label><input type="text" class="setting-input" data-company-key="phone" value="${state.settings.companyInfo.phone}"></div>
                      <div class="form-group"><label>E-posta</label><input type="email" class="setting-input" data-company-key="email" value="${state.settings.companyInfo.email}"></div>
                  </div>
                  <div class="form-group"><label>IBAN / Hesap Bilgileri</label><input type="text" class="setting-input" data-company-key="iban" value="${state.settings.companyInfo.iban}"></div>
              `)}
              ${createSettingCard('Logo ve Görünüm', `
                  <div class="file-upload-group" style="padding:0; border:0; background: transparent;">
                      <div class="file-input-wrapper">
                          <span><i class="fa-solid fa-image"></i> Logo Yükle (PNG/JPG)</span>
                          <input type="file" id="companyLogoFile" accept=".png,.jpg,.jpeg">
                      </div>
                      ${state.settings.companyInfo.logo ? `
                        <div class="logo-preview-container">
                            <img src="${state.settings.companyInfo.logo}" alt="Logo Önizleme" class="logo-preview-img"/>
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
                      ${state.settings.companyInfo.pdfBackground ? `
                        <div class="logo-preview-container">
                            <img src="${state.settings.companyInfo.pdfBackground}" alt="Arka Plan Önizleme" class="logo-preview-img"/>
                            <button id="remove-pdf-background-btn" class="btn-remove-logo" title="Arka Planı Kaldır"><i class="fa-solid fa-trash"></i></button>
                        </div>
                      ` : ''}
                  </div>
                  ${createCheckbox('pdf_show_logo', 'Logoyu Raporlarda Göster', state.settings.pdfSettings.showLogo)}
                  ${createCheckbox('pdf_show_background', 'Arka Planı Raporlarda Göster', state.settings.pdfSettings.showBackground)}
                  ${createCheckbox('pdf_show_footer', 'Alt Bilgiyi (Adres, Tel vb.) Göster', state.settings.pdfSettings.showFooter)}
              `)}
          `
        },
		{
			id: 'appearance',
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
			id: 'firebase',
			icon: 'fa-brands fa-google',
            title: 'Firebase Senkronizasyon',
            content: `
              ${createSettingCard('Firebase Bağlantı Ayarları', `
                  <p class="setting-description">Firebase Realtime Database ile verilerinizi senkronize edin. Farklı cihazlardan erişim sağlayın.</p>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>API Key <span style="color: #ef4444;">*</span></label>
                      <input type="text" class="setting-input" id="firebase-apiKey" value="${((_b = (_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig) === null || _b === void 0 ? void 0 : _b.apiKey) || ''}" placeholder="AIzaSyD...">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Auth Domain</label>
                      <input type="text" class="setting-input" id="firebase-authDomain" value="${((_d = (_c = state.settings) === null || _c === void 0 ? void 0 : _c.firebaseConfig) === null || _d === void 0 ? void 0 : _d.authDomain) || ''}" placeholder="project-id.firebaseapp.com">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Database URL <span style="color: #ef4444;">*</span></label>
                      <input type="text" class="setting-input" id="firebase-databaseURL" value="${((_f = (_e = state.settings) === null || _e === void 0 ? void 0 : _e.firebaseConfig) === null || _f === void 0 ? void 0 : _f.databaseURL) || ''}" placeholder="https://project-id.firebaseio.com">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Project ID</label>
                      <input type="text" class="setting-input" id="firebase-projectId" value="${((_h = (_g = state.settings) === null || _g === void 0 ? void 0 : _g.firebaseConfig) === null || _h === void 0 ? void 0 : _h.projectId) || ''}" placeholder="project-id">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                      <label>Storage Bucket</label>
                      <input type="text" class="setting-input" id="firebase-storageBucket" value="${((_k = (_j = state.settings) === null || _j === void 0 ? void 0 : _j.firebaseConfig) === null || _k === void 0 ? void 0 : _k.storageBucket) || ''}" placeholder="project-id.appspot.com">
                  </div>
                  <div class="form-row" style="margin-bottom: 12px;">
                      <div class="form-group">
                          <label>Messaging Sender ID</label>
                          <input type="text" class="setting-input" id="firebase-messagingSenderId" value="${((_m = (_l = state.settings) === null || _l === void 0 ? void 0 : _l.firebaseConfig) === null || _m === void 0 ? void 0 : _m.messagingSenderId) || ''}" placeholder="123456789">
                      </div>
                      <div class="form-group">
                          <label>App ID</label>
                          <input type="text" class="setting-input" id="firebase-appId" value="${((_p = (_o = state.settings) === null || _o === void 0 ? void 0 : _o.firebaseConfig) === null || _p === void 0 ? void 0 : _p.appId) || ''}" placeholder="1:123:web:abc">
                      </div>
                  </div>
                  ${createCheckbox('firebase_enabled', 'Firebase Senkronizasyonu Aktif', ((_q = state.settings) === null || _q === void 0 ? void 0 : _q.firebaseEnabled) || false)}
                  ${createCheckbox('firebase_auto_sync', 'Otomatik Senkronizasyon (Uygulama Açılışında)', ((_r = state.settings) === null || _r === void 0 ? void 0 : _r.firebaseAutoSync) || false)}
                  
                  <div class="form-group" style="margin-top: 16px; padding: 12px; background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px;">
                      <label style="display: flex; align-items: center; gap: 8px; color: #92400e; font-weight: 600;">
                          <i class="fa-solid fa-lock"></i> Ana Şifre (Güvenlik)
                      </label>
                      <input 
                          type="password" 
                          class="setting-input" 
                          id="firebase-master-password" 
                          value="${((_s2 = state.settings) === null || _s2 === void 0 ? void 0 : _s2.firebaseMasterPassword) || ''}"
                          placeholder="Şifrenizi buraya girin"
                          style="margin-top: 8px;"
                      >
                      <small style="display: block; margin-top: 8px; color: #92400e; font-size: 12px;">
                          <i class="fa-solid fa-info-circle"></i> Bu şifre olmadan Firebase'den veri çekilemez. Yabancı kişilerin verilerinize erişmesini engeller.
                      </small>
                  </div>
                  
                  <div class="backup-restore-buttons" style="margin-top: 16px;">
                      <button class="btn btn-secondary" id="btn-load-default-firebase">
                          <i class="fa-solid fa-rotate"></i> Varsayılan Ayarları Yükle
                      </button>
                      <button class="btn btn-primary" id="btn-test-firebase" ${!((_t = (_s = state.settings) === null || _s === void 0 ? void 0 : _s.firebaseConfig) === null || _t === void 0 ? void 0 : _t.apiKey) || !((_v = (_u = state.settings) === null || _u === void 0 ? void 0 : _u.firebaseConfig) === null || _v === void 0 ? void 0 : _v.databaseURL) ? 'disabled' : ''}>
                          <i class="fa-solid fa-plug"></i> Bağlantıyı Test Et
                      </button>
                  </div>
              `)}
              ${createSettingCard('Veri Senkronizasyonu', `
                  <p class="setting-description">Verilerinizi Firebase ile senkronize edin. Tüm araçlar, müşteriler, kiralamalar ve ayarlar yedeklenecektir.</p>
                  <div class="backup-restore-buttons">
                      <button class="btn btn-success" id="btn-send-to-firebase" ${!((_w = state.settings) === null || _w === void 0 ? void 0 : _w.firebaseEnabled) ? 'disabled' : ''}>
                          <i class="fa-solid fa-cloud-arrow-up"></i> Firebase'e Gönder
                      </button>
                      <button class="btn btn-info" id="btn-fetch-from-firebase" ${!((_x = state.settings) === null || _x === void 0 ? void 0 : _x.firebaseEnabled) ? 'disabled' : ''}>
                          <i class="fa-solid fa-cloud-arrow-down"></i> Firebase'den Al
                      </button>
                      <button class="btn btn-warning" id="btn-recover-storage-files" ${!((_x = state.settings) === null || _x === void 0 ? void 0 : _x.firebaseEnabled) ? 'disabled' : ''} style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none; color: white;">
                          <i class="fa-solid fa-file-circle-plus"></i> Storage'dan Dosyaları Yükle
                      </button>
                  </div>
                  <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 6px; font-size: 13px; color: #92400e;">
                      <i class="fa-solid fa-info-circle"></i> <strong>Bilgi:</strong> Firebase ayarlarını kaydettiğinizde, sayfa kapatılırken verileriniz otomatik olarak senkronize edilecektir.
                  </div>
              `)}
          `
        },
		{
			id: 'pwa',
			icon: 'fa-solid fa-mobile-screen',
            title: 'PWA (Mobil Uygulama)',
            content: `
              <div id="pwa-install-container">
                  <div class="pwa-install-card" id="pwa-install-card" style="display: none;">
                      <div class="pwa-install-icon">📲</div>
                      <div class="pwa-install-content">
                          <h4>Ana Ekrana Ekle</h4>
                          <p>Bu uygulamayı bilgisayarınıza veya telefonunuzun ana ekranına ekleyerek hızlı erişim sağlayın.</p>
                          <ul class="pwa-install-benefits">
                              <li>⚡ Daha hızlı açılır</li>
                              <li>🔒 Çevrimdışı çalışır</li>
                              <li>📱 Ana ekrandan tek tıkla aç</li>
                          </ul>
                          <button id="pwa-install-button" class="btn-pwa-install">
                              <span id="pwa-install-text">📲 Şimdi Yükle</span>
                              <span id="pwa-install-loading" style="display:none;">⏳ Yükleniyor...</span>
                          </button>
                          <button id="pwa-install-dismiss" class="btn-pwa-dismiss">
                              Daha Sonra Hatırlat
                          </button>
                      </div>
                  </div>
                  <div id="pwa-already-installed" style="display: none; padding: 20px; text-align: center; background: #f0fdf4; border-radius: 12px; border: 2px solid #22c55e;">
                      <i class="fa-solid fa-check-circle" style="font-size: 48px; color: #22c55e; margin-bottom: 12px;"></i>
                      <h4 style="color: #166534; margin: 0 0 8px 0;">Uygulama Zaten Kurulu!</h4>
                      <p style="color: #166534; margin: 0; font-size: 14px;">Ana ekranınızdan kullanabilirsiniz.</p>
                  </div>
                  <div id="pwa-dev-mode" style="padding: 20px; text-align: center; background: #e0f2fe; border-radius: 12px; border: 2px solid #0ea5e9;">
                      <i class="fa-solid fa-mobile-screen" style="font-size: 48px; color: #0369a1; margin-bottom: 12px;"></i>
                      <h4 style="color: #0c4a6e; margin: 0 0 8px 0;">📱 Ana Ekrana Ekle</h4>
                      <p style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">
                          Bu uygulamayı cihazınızın <strong>ana ekranına</strong> ekleyebilirsiniz!
                      </p>
                      <p style="color: #0c4a6e; margin: 0; font-size: 13px; opacity: 0.9; line-height: 1.5;">
                          <strong>Nasıl:</strong> Tarayıcınızın menüsünden
                          <span style="background: #0ea5e9; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">⋮</span>
                          → <strong>"Ana Ekrana Ekle"</strong> seçeneğini tıklayın.
                      </p>
                  </div>
              </div>
          `
        },
		{
			id: 'backup-restore',
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
    const openAccordions = Array.isArray(state.openSettingsAccordions) ? state.openSettingsAccordions : [];
    const accordionsHTML = sections.map(section => {
        const isActive = openAccordions.includes(section.id);
        const contentStyle = isActive ? 'style="max-height: 9999px;"' : '';
        return `
      <div class="settings-accordion${isActive ? ' active' : ''}" data-accordion-id="${section.id}">
          <button class="settings-accordion-header" data-accordion-id="${section.id}">
              <div class="accordion-title">
                  <i class="fa-solid ${section.icon}"></i>
                  <span>${section.title}</span>
              </div>
              <i class="fa-solid fa-chevron-right accordion-arrow"></i>
          </button>
          <div class="settings-accordion-content" ${contentStyle}>
              <div class="accordion-content-inner">
                  ${section.content}
              </div>
          </div>
      </div>
  `;
    }).join('');
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
const NotificationsPage = () => {
    const allNotifications = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysUntil = (dateStr) => {
        if (!dateStr)
            return Infinity;
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const getReminderText = (days) => {
        if (days < 0)
            return 'Geçti!';
        if (days === 0)
            return 'Bugün Son Gün!';
        if (days === 1)
            return 'Yarın Son Gün!';
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
    const renderNotificationCard = (notification) => {
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
const RentalsPage = () => {
    const getCustomerName = (customerId) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen Müşteri';
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return '...';
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
        return Object.assign(Object.assign({}, rental), { customerName });
    })
        .filter(rental => rental.vehiclePlate.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        rental.customerName.toLowerCase().includes(state.searchTerm.toLowerCase()))
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
        `<button data-action="upload-doc" class="btn-icon" title="Sözleşme Yükle"><i class="fa-solid fa-upload"></i></button>`}
                        ${rental.invoiceFile ?
        `<button data-action="view-doc" data-doc-url="${rental.invoiceFileUrl}" class="btn-icon" title="Faturayı Görüntüle"><i class="fa-solid fa-file-invoice-dollar"></i></button>` :
        `<button data-action="upload-doc" class="btn-icon" title="Fatura Yükle"><i class="fa-solid fa-upload"></i></button>`}
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

/**
 * ========================================
 * DOSYALAR SAYFASI (DOCUMENTS PAGE)
 * ========================================
 */
const DocumentsPage = () => {
    const categories = ['Faturalar', 'Sigortalar', 'Muayeneler', 'Ruhsatlar', 'Diger'];
    
    // Kategori bazında dosya sayısı
    const getCategoryCount = (category) => {
        return documentsData.filter(doc => doc.category === category).length;
    };
    
    // Toplam dosya sayısı ve boyutu
    const totalDocs = documentsData.length;
    const totalSize = documentsData.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    
    // Dosya tipi ikonu
    const getFileIcon = (type) => {
        if (type === 'pdf') return 'fa-solid fa-file-pdf';
        if (type === 'image') return 'fa-solid fa-file-image';
        return 'fa-solid fa-file';
    };
    
    // Tarih formatla
    const formatDate = (date) => {
        if (!date) return 'Bilinmiyor';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Kategori klasörü render
    const renderCategoryFolder = (category) => {
        const docs = documentsData.filter(doc => doc.category === category);
        const count = docs.length;
        
        return `
            <div class="document-category">
                <div class="document-category-header" data-category="${category}">
                    <div class="document-category-title">
                        <i class="fa-solid fa-folder"></i>
                        <span>${category}</span>
                        <span class="document-category-count">(${count})</span>
                    </div>
                    <i class="fa-solid fa-chevron-down category-chevron"></i>
                </div>
                <div class="document-category-content" id="category-${category}">
                    ${count === 0 ? `
                        <p class="no-data-item">Bu kategoride henüz dosya yok.</p>
                    ` : `
                        <div class="documents-grid">
                            ${docs.map(doc => `
                                <div class="document-card" data-document-id="${doc.id}">
                                    <div class="document-card-checkbox" style="display: none;">
                                        <input type="checkbox" class="doc-select-checkbox" data-doc-id="${doc.id}">
                                    </div>
                                    <div class="document-card-icon">
                                        <i class="${getFileIcon(doc.type)}"></i>
                                    </div>
                                    <div class="document-card-info">
                                        <h4 class="document-card-name" title="${doc.name}">${doc.name}</h4>
                                        <p class="document-card-meta">
                                            <span>${formatSize(doc.size)}</span>
                                            <span>•</span>
                                            <span>${formatDate(doc.uploadDate)}</span>
                                        </p>
                                        ${doc.linkedVehicles && doc.linkedVehicles.length > 0 ? `
                                            <p class="document-card-linked">
                                                <i class="fa-solid fa-car"></i>
                                                ${doc.linkedVehicles.join(', ')}
                                            </p>
                                        ` : ''}
                                    </div>
                                    <div class="document-card-actions">
                                        <button class="btn-icon btn-preview-doc" data-doc-id="${doc.id}" title="Önizle">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                        <button class="btn-icon btn-icon-danger btn-delete-doc" data-doc-id="${doc.id}" title="Sil">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    };
    
    return `
        <div class="page-header">
            <div>
                <h1><i class="fa-solid fa-folder-open"></i> Dosyalarım</h1>
                <p>${totalDocs} dosya • ${formatSize(totalSize)}</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                ${totalDocs > 0 ? `
                    <button class="btn btn-danger" id="btn-bulk-delete-documents" style="display: none;">
                        <i class="fa-solid fa-trash"></i> Seçilenleri Sil (<span id="selected-docs-count">0</span>)
                    </button>
                    <button class="btn btn-secondary" id="btn-toggle-select-mode">
                        <i class="fa-solid fa-check-square"></i> Seçim Modu
                    </button>
                ` : ''}
                <button class="btn btn-primary" id="btn-add-document-header">
                    <i class="fa-solid fa-plus"></i> Yeni Dosya Ekle
                </button>
            </div>
        </div>
        
        <div class="documents-container">
            ${categories.map(cat => renderCategoryFolder(cat)).join('')}
        </div>
        
        ${totalDocs === 0 ? `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <h3>Henüz dosya eklemediniz</h3>
                <p>Faturalar, sigortalar, muayeneler ve diğer dökümanlarınızı buradan yönetebilirsiniz.</p>
                <button class="btn btn-primary" id="btn-add-document-empty">
                    <i class="fa-solid fa-plus"></i> İlk Dosyanızı Ekleyin
                </button>
            </div>
        ` : ''}
    `;
};

const ReportsPage = () => {
    const getCustomerName = (customerId) => {
        const customer = customersData.find(c => c.id === customerId);
        return customer ? customer.name : 'Bilinmeyen';
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return '...';
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
const PlaceholderPage = (pageName, icon) => {
    return `
    <div class="placeholder-page">
        <i class="fa-solid ${icon}"></i>
        <h1>${pageName}</h1>
        <p>Bu sayfa yapım aşamasındadır. Çok yakında...</p>
    </div>
    `;
};

/**
 * ========================================
 * DOSYA YÖNETİMİ MODAL'LARI
 * ========================================
 */

// Dosya Yükleme Modal'ı
const DocumentUploadModal = () => {
    if (!state.isDocumentUploadModalOpen) return '';
    
    return `
        <div class="modal-overlay" id="document-upload-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fa-solid fa-cloud-arrow-up"></i> Yeni Dosya Yükle</h2>
                    <button class="close-modal-btn" id="btn-close-document-upload">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <form id="document-upload-form" class="modal-form">
                    <div class="form-group">
                        <label for="doc-category">Kategori <span class="required">*</span></label>
                        <select id="doc-category" name="category" class="custom-select" required>
                            <option value="">-- Kategori Seçin --</option>
                            <option value="Faturalar">📄 Faturalar</option>
                            <option value="Sigortalar">🛡️ Sigortalar</option>
                            <option value="Muayeneler">🔧 Muayeneler</option>
                            <option value="Ruhsatlar">📋 Ruhsatlar</option>
                            <option value="Diger">📁 Diğer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Yükleme Tipi <span class="required">*</span></label>
                        <div class="upload-type-selector">
                            <button type="button" class="upload-type-btn active" id="btn-upload-single">
                                <i class="fa-solid fa-file"></i> Tek Dosya
                            </button>
                            <button type="button" class="upload-type-btn" id="btn-upload-folder">
                                <i class="fa-solid fa-folder"></i> Klasör
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group" id="single-file-upload">
                        <label for="doc-file">Dosya Seç <span class="required">*</span></label>
                        <input 
                            type="file" 
                            id="doc-file" 
                            name="file" 
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        >
                        <small class="form-help">Maksimum 10MB - PDF, JPG, PNG, DOC</small>
                    </div>
                    
                    <div class="form-group" id="folder-upload" style="display: none;">
                        <label for="doc-folder">Klasör Seç <span class="required">*</span></label>
                        <input 
                            type="file" 
                            id="doc-folder" 
                            name="folder" 
                            webkitdirectory
                            directory
                            multiple
                        >
                        <small class="form-help">Klasördeki tüm dosyalar yüklenecek (alt klasörler dahil)</small>
                    </div>
                    
                    <div class="form-group" id="doc-file-preview" style="display: none;">
                        <div class="file-preview-card">
                            <i class="fa-solid fa-file" id="doc-file-icon"></i>
                            <div class="file-preview-info">
                                <p id="doc-file-name">-</p>
                                <p id="doc-file-size">-</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="doc-tags">Etiketler (opsiyonel)</label>
                        <input 
                            type="text" 
                            id="doc-tags" 
                            name="tags" 
                            placeholder="Virgülle ayırarak yazın: 2024, yıllık, vb."
                        >
                    </div>
                    
                    <!-- Yükleme Progress Bar -->
                    <div class="upload-progress" id="upload-progress" style="display: none;">
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" id="upload-progress-fill"></div>
                        </div>
                        <p id="upload-progress-text">Yukleniyor... 0%</p>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="btn-cancel-document-upload">
                            İptal
                        </button>
                        <button type="submit" class="btn btn-primary" id="btn-upload-document">
                            <i class="fa-solid fa-upload"></i> Yükle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Dosya Önizleme Modal'ı
const DocumentPreviewModal = () => {
    if (!state.isDocumentPreviewModalOpen || !state.selectedDocument) return '';
    
    const doc = documentsData.find(d => d.id === state.selectedDocument);
    if (!doc) return '';
    
    const isPDF = doc.type === 'pdf';
    const isImage = doc.type === 'image';
    
    return `
        <div class="modal-overlay" id="document-preview-modal-overlay">
            <div class="modal-content document-preview-modal">
                <div class="modal-header">
                    <h2><i class="${isPDF ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}"></i> ${doc.name}</h2>
                    <button class="close-modal-btn" id="btn-close-document-preview">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="document-meta-info">
                    ${doc.category} • ${formatSize(doc.size)} • ${formatDate(doc.uploadDate)}
                </div>
                
                <div class="document-preview-body">
                    ${isPDF ? `
                        <iframe
                            src="${doc.url || doc.fileData}"
                            class="document-iframe"
                            frameborder="0"
                        ></iframe>
                    ` : isImage ? `
                        <img
                            src="${doc.url || doc.fileData}"
                            alt="${doc.name}"
                            class="document-image"
                        >
                    ` : `
                        <div class="document-no-preview">
                            <i class="fa-solid fa-file"></i>
                            <p>Bu dosya türü önizlenemiyor.</p>
                            <button class="btn btn-primary btn-download-doc" data-doc-id="${doc.id}">
                                <i class="fa-solid fa-download"></i> İndir
                            </button>
                        </div>
                    `}
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-download-doc" data-doc-id="${doc.id}">
                        <i class="fa-solid fa-download"></i> İndir
                    </button>
                    <button class="btn btn-danger btn-delete-doc" data-doc-id="${doc.id}">
                        <i class="fa-solid fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        </div>
    `;
    
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    
    function formatDate(date) {
        if (!date) return 'Bilinmiyor';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Dosya Seçici Modal (Araç/Kiralama Formlarından Çağrılır)
const DocumentSelectorModal = () => {
    if (!state.isDocumentSelectorModalOpen) return '';
    
    // 🗂️ KLASÖR YAPISI - Kategorilere göre grupla
    const categories = [
        { name: 'Sigortalar', icon: 'fa-shield-halved', key: 'Sigortalar' },
        { name: 'Muayeneler', icon: 'fa-clipboard-check', key: 'Muayeneler' },
        { name: 'Ruhsatlar', icon: 'fa-id-card', key: 'Ruhsatlar' },
        { name: 'Faturalar', icon: 'fa-file-invoice', key: 'Faturalar' },
        { name: 'Diğer', icon: 'fa-folder', key: 'Diger' }
    ];
    
    // Kategorilere göre dosyaları grupla
    const groupedDocs = {};
    categories.forEach(cat => {
        groupedDocs[cat.key] = documentsData.filter(doc => doc.category === cat.key);
    });
    
    const totalDocs = documentsData.length;
    
    // 📂 Açık/kapalı klasör durumlarını state'te sakla
    if (!state.openFolders) {
        state.openFolders = {};
        categories.forEach(cat => {
            state.openFolders[cat.key] = true; // Varsayılan: tümü açık
        });
    }
    
    return `
        <div class="modal-overlay" id="document-selector-modal-overlay">
            <div class="modal-content document-selector-modal">
                <div class="modal-header">
                    <h2><i class="fa-solid fa-folder-open"></i> Dosya Seç (${totalDocs} dosya)</h2>
                    <button class="close-modal-btn" id="btn-close-document-selector">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="modal-form">
                    ${totalDocs === 0 ? `
                        <div class="empty-state">
                            <i class="fa-solid fa-folder-open"></i>
                            <p>Henüz dosya bulunamadı.</p>
                            <button class="btn btn-primary" id="btn-add-doc-from-selector">
                                <i class="fa-solid fa-plus"></i> Yeni Dosya Ekle
                            </button>
                        </div>
                    ` : `
                        <div class="document-selector-folders">
                            ${categories.map(cat => {
                                const docs = groupedDocs[cat.key] || [];
                                if (docs.length === 0) return ''; // Boş klasörleri gösterme
                                
                                const isOpen = state.openFolders[cat.key];
                                
                                return `
                                    <div class="doc-folder ${isOpen ? 'folder-open' : 'folder-closed'}">
                                        <div class="doc-folder-header" data-folder="${cat.key}">
                                            <i class="fa-solid ${isOpen ? 'fa-folder-open' : 'fa-folder'}"></i>
                                            <span>${cat.name}</span>
                                            <span class="doc-folder-count">(${docs.length})</span>
                                            <i class="fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} folder-toggle-icon"></i>
                                        </div>
                                        <div class="doc-folder-content" style="display: ${isOpen ? 'flex' : 'none'};">
                                            ${docs.map(doc => `
                                                <label class="document-selector-item">
                                                    <input 
                                                        type="radio" 
                                                        name="selected-document" 
                                                        value="${doc.id}"
                                                    >
                                                    <div class="document-selector-card">
                                                        <i class="${doc.type === 'pdf' ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image'}"></i>
                                                        <div class="document-selector-info">
                                                            <h4>${doc.name}</h4>
                                                            <p>${formatSize(doc.size)}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                    
                    <div class="form-actions">
                        <button class="btn btn-secondary" id="btn-cancel-document-selector">
                            <i class="fa-solid fa-xmark"></i> İptal
                        </button>
                        <button 
                            class="btn btn-primary" 
                            id="btn-upload-selected-document"
                            ${totalDocs === 0 ? 'disabled' : ''}
                        >
                            <i class="fa-solid fa-upload"></i> Yükle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
};

const VehicleModal = () => {
    const isEditing = state.editingVehicleIndex !== null;
    const vehicle = isEditing ? vehiclesData[state.editingVehicleIndex] : null;
    const modelParts = (vehicle === null || vehicle === void 0 ? void 0 : vehicle.brand.split(' ')) || ['', ''];
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
                        <input type="text" id="plate" name="plate" placeholder="34 ABC 123" value="${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.plate) || ''}" required ${isEditing ? 'readonly' : ''} oninput="this.value = this.value.toUpperCase()">
                    </div>
                    <div class="form-group">
                        <label for="km">Kilometre</label>
                        <input type="number" id="km" name="km" placeholder="Örn: 85000" value="${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.km.replace(/,/, '')) || ''}" required>
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
                    <select id="status" name="status" value="${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.status) || 'Müsait'}">
                        <option value="Müsait" ${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.status) === 'Müsait' ? 'selected' : ''}>Müsait</option>
                        <option value="Kirada" ${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.status) === 'Kirada' ? 'selected' : ''}>Kirada</option>
                        <option value="Bakımda" ${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.status) === 'Bakımda' ? 'selected' : ''}>Bakımda</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="insuranceDate">Sigorta Bitiş Tarihi</label>
                        <input type="date" id="insuranceDate" name="insuranceDate" value="${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.insuranceDate) || ''}">
                    </div>
                    <div class="form-group">
                        <label for="inspectionDate">Muayene Bitiş Tarihi</label>
                        <input type="date" id="inspectionDate" name="inspectionDate" value="${(vehicle === null || vehicle === void 0 ? void 0 : vehicle.inspectionDate) || ''}">
                    </div>
                </div>
                <div class="file-upload-group">
                    <label>Belge Yükleme</label>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-shield-halved"></i> Sigorta</span>
                              <input type="file" id="insuranceFile" name="insuranceFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="insuranceFile" data-category="Sigortalar">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['insuranceFile'] ? `
                             <div class="selected-document-indicator" id="insuranceFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['insuranceFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="insuranceFile"></i>
                             </div>
                             <input type="hidden" name="insuranceFileDocId" value="${state.selectedDocumentsForForm['insuranceFile'].id}">
                         ` : ''}
                    </div>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-clipboard-check"></i> Muayene</span>
                              <input type="file" id="inspectionFile" name="inspectionFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="inspectionFile" data-category="Muayeneler">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['inspectionFile'] ? `
                             <div class="selected-document-indicator" id="inspectionFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['inspectionFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="inspectionFile"></i>
                             </div>
                             <input type="hidden" name="inspectionFileDocId" value="${state.selectedDocumentsForForm['inspectionFile'].id}">
                         ` : ''}
                    </div>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-id-card"></i> Ruhsat</span>
                              <input type="file" id="licenseFile" name="licenseFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="licenseFile" data-category="Ruhsatlar">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['licenseFile'] ? `
                             <div class="selected-document-indicator" id="licenseFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['licenseFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="licenseFile"></i>
                             </div>
                             <input type="hidden" name="licenseFileDocId" value="${state.selectedDocumentsForForm['licenseFile'].id}">
                         ` : ''}
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="vehicle-modal">İptal</button>
                <button type="submit" form="vehicle-form" class="btn btn-primary">${isEditing ? 'Değişiklikleri Kaydet' : 'Aracı Kaydet'}</button>
            </div>
        </div>
    </div>
`;
};
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
                        <input type="text" id="customer-name" name="name" value="${(customer === null || customer === void 0 ? void 0 : customer.name) || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-tc">TC Kimlik No</label>
                        <input type="text" id="customer-tc" name="tc" value="${(customer === null || customer === void 0 ? void 0 : customer.tc) || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-phone">Telefon</label>
                        <input type="tel" id="customer-phone" name="phone" value="${(customer === null || customer === void 0 ? void 0 : customer.phone) || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="customer-email">Email</label>
                        <input type="email" id="customer-email" name="email" value="${(customer === null || customer === void 0 ? void 0 : customer.email) || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-license-number">Ehliyet No</label>
                        <input type="text" id="customer-license-number" name="licenseNumber" value="${(customer === null || customer === void 0 ? void 0 : customer.licenseNumber) || ''}">
                    </div>
                    <div class="form-group">
                        <label for="customer-license-date">Ehliyet Tarihi</label>
                        <input type="date" id="customer-license-date" name="licenseDate" value="${(customer === null || customer === void 0 ? void 0 : customer.licenseDate) || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="customer-address">Adres</label>
                    <input type="text" id="customer-address" name="address" value="${(customer === null || customer === void 0 ? void 0 : customer.address) || ''}">
                </div>
                <div class="file-upload-group">
                    <label>Belge Yükleme</label>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-id-card"></i> Kimlik</span>
                              <input type="file" id="idFile" name="idFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="idFile" data-category="Diger">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['idFile'] ? `
                             <div class="selected-document-indicator" id="idFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['idFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="idFile"></i>
                             </div>
                             <input type="hidden" name="idFileDocId" value="${state.selectedDocumentsForForm['idFile'].id}">
                         ` : ''}
                    </div>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-id-card-clip"></i> Ehliyet</span>
                              <input type="file" id="driverLicenseFile" name="driverLicenseFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="driverLicenseFile" data-category="Diger">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['driverLicenseFile'] ? `
                             <div class="selected-document-indicator" id="driverLicenseFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['driverLicenseFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="driverLicenseFile"></i>
                             </div>
                             <input type="hidden" name="driverLicenseFileDocId" value="${state.selectedDocumentsForForm['driverLicenseFile'].id}">
                         ` : ''}
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="customer-modal">İptal</button>
                <button type="submit" form="customer-form" class="btn btn-primary">${isEditing ? 'Değişiklikleri Kaydet' : 'Müşteriyi Kaydet'}</button>
            </div>
        </div>
    </div>
`;
};
const RentalModal = () => {
    const vehicle = state.selectedVehicleForAction;
    if (!vehicle)
        return '';
    const today = vehicle.preselectedStartDate || new Date().toISOString().split('T')[0];
    const preselectedCustomerId = vehicle.preselectedCustomerId || null;
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
`;
};
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
    if (state.editingReservationId === null)
        return '';
    const reservation = reservationsData.find(r => r.id === state.editingReservationId);
    if (!reservation)
        return '';
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
    if (state.editingRentalId === null)
        return '';
    const rental = rentalsData.find(r => r.id === state.editingRentalId);
    if (!rental)
        return '';
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
                    <p><i class="fa-solid fa-user"></i> ${(customer === null || customer === void 0 ? void 0 : customer.name) || 'Bilinmiyor'}</p>
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
                    <label>Belge Yönetimi</label>

                    <!-- 📄 MEVCUT YÜKLENMIŞ DOSYALAR -->
                    ${rental.contractFile || rental.invoiceFile ? `
                        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0369a1;">
                                <i class="fa-solid fa-paperclip"></i> Yüklenmiş Dosyalar
                            </h4>
                            ${rental.contractFile ? `
                                <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
                                    <i class="fa-solid fa-file-contract" style="color: #0ea5e9;"></i>
                                    <span style="flex: 1; font-size: 14px;">${rental.contractFile}</span>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="window.open('${rental.contractFileUrl}', '_blank')" style="padding: 4px 12px;">
                                        <i class="fa-solid fa-eye"></i> Görüntüle
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" data-action="remove-contract" style="padding: 4px 12px; background: #ef4444; border-color: #dc2626;">
                                        <i class="fa-solid fa-trash"></i> Sil
                                    </button>
                                </div>
                            ` : ''}
                            ${rental.invoiceFile ? `
                                <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0;">
                                    <i class="fa-solid fa-file-invoice-dollar" style="color: #0ea5e9;"></i>
                                    <span style="flex: 1; font-size: 14px;">${rental.invoiceFile}</span>
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="window.open('${rental.invoiceFileUrl}', '_blank')" style="padding: 4px 12px;">
                                        <i class="fa-solid fa-eye"></i> Görüntüle
                                    </button>
                                    <button type="button" class="btn btn-secondary btn-sm" data-action="remove-invoice" style="padding: 4px 12px; background: #ef4444; border-color: #dc2626;">
                                        <i class="fa-solid fa-trash"></i> Sil
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- 📤 YENİ DOSYA YÜKLE -->
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-file-contract"></i> ${rental.contractFile ? 'Sözleşmeyi Değiştir' : 'Sözleşme Yükle'}</span>
                              <input type="file" id="contractFile" name="contractFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="contractFile" data-category="Faturalar">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['contractFile'] ? `
                             <div class="selected-document-indicator" id="contractFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['contractFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="contractFile"></i>
                             </div>
                             <input type="hidden" name="contractFileDocId" value="${state.selectedDocumentsForForm['contractFile'].id}">
                         ` : ''}
                    </div>
                    <div class="file-input-with-selector">
                         <div class="file-input-wrapper">
                              <span><i class="fa-solid fa-file-invoice-dollar"></i> ${rental.invoiceFile ? 'Faturayı Değiştir' : 'Fatura Yükle'}</span>
                              <input type="file" id="invoiceFile" name="invoiceFile" accept=".pdf,.jpg,.jpeg,.png">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm btn-select-from-docs" data-target="invoiceFile" data-category="Faturalar">
                              <i class="fa-solid fa-folder-open"></i> Dosyalarımdan Seç
                         </button>
                         ${state.selectedDocumentsForForm && state.selectedDocumentsForForm['invoiceFile'] ? `
                             <div class="selected-document-indicator" id="invoiceFile-indicator">
                                 <i class="fa-solid fa-check-circle"></i>
                                 <span>${state.selectedDocumentsForForm['invoiceFile'].name}</span>
                                 <i class="fa-solid fa-xmark remove-selection" data-target="invoiceFile"></i>
                             </div>
                             <input type="hidden" name="invoiceFileDocId" value="${state.selectedDocumentsForForm['invoiceFile'].id}">
                         ` : ''}
                    </div>
                </div>
            </form>
            <div class="modal-footer">
                <button class="btn btn-secondary" data-modal-id="rental-edit-modal">İptal</button>
                <button type="submit" form="rental-edit-form" class="btn btn-primary">Değişiklikleri Kaydet</button>
            </div>
        </div>
    </div>
`;
};
const MaintenanceEditModal = () => {
    if (state.editingMaintenanceId === null)
        return '';
    const maint = maintenanceData.find(m => m.id === state.editingMaintenanceId);
    if (!maint)
        return '';
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
    const vehicle = state.selectedVehicleForAction;
    if (!vehicle || !vehicle.rentedBy)
        return '';
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
`;
};
const App = () => {
    let pageContent = '';
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
        case 'documents':
            pageContent = DocumentsPage(); // ✅ YENİ
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
    ${DocumentUploadModal()}
    ${DocumentPreviewModal()}
    ${DocumentSelectorModal()}
    </div>
  `;
};
function restoreSettingsAccordionState() {
    if (!Array.isArray(state.openSettingsAccordions)) {
        state.openSettingsAccordions = [];
        return;
    }
    state.openSettingsAccordions.forEach((accordionId) => {
        const accordion = document.querySelector(`.settings-accordion[data-accordion-id="${accordionId}"]`);
        if (!accordion)
            return;
        accordion.classList.add('active');
        const content = accordion.querySelector('.settings-accordion-content');
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
}
function renderApp() {
    // 🔒 Prevent concurrent renders
    if (isRendering) {
        console.log('⚠️ renderApp() zaten çalışıyor, atlandı');
        return;
    }
    
    isRendering = true;
    
    // 🔍 CALLER DEBUG
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';
    console.log('🎨 renderApp() çağrıldı | Caller:', caller);
    try {
        // KRITIK FIX: activitiesData'yı temizle
        if (activitiesData && Array.isArray(activitiesData)) {
            activitiesData = activitiesData.filter(activity => {
                if (!activity || !activity.icon || !activity.message)
                    return false;
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
                    }
                    catch (e) {
                        console.warn('⚠️ Aktivite parse hatası, silindi:', activity);
                        return false;
                    }
                }
                else {
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
        restoreSettingsAccordionState();
    }
    catch (error) {
        console.error('!!! HATA: renderApp fonksiyonunda bir sorun oluştu:', error);
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `<div style="padding: 20px; text-align: center; color: red;"><h1>Uygulama Çizilirken Kritik Bir Hata Oluştu</h1><p>Lütfen konsolu (F12) kontrol edin.</p><pre>${error.message}</pre></div>`;
        }
    }
    finally {
        // 🔓 Release render lock
        isRendering = false;
    }
}
function attachEventListeners() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
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
                triggerHaptic('light'); // 📳 Haptic feedback
                sidebar.classList.toggle('mobile-open');
                sidebarOverlay.classList.toggle('active');
                // Update icon
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    if (sidebar.classList.contains('mobile-open')) {
                        icon.className = 'fa-solid fa-times';
                    }
                    else {
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
        (_a = document.getElementById('theme-toggle')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const newTheme = isChecked ? 'dark' : 'light';
            if (document.body) {
                document.body.className = newTheme; // Apply theme to body
            }
            setState({ theme: newTheme });
        });
        // Settings Page Accordion - Mobile-friendly fix
        document.querySelectorAll('.settings-accordion-header').forEach(header => {
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const accordion = header.closest('.settings-accordion') || header.parentElement;
                if (!accordion)
                    return;
            const content = accordion.querySelector('.settings-accordion-content');
            if (!content)
                return;
            const accordionId = header.dataset.accordionId || accordion.getAttribute('data-accordion-id');
            if (!accordionId)
                return;
            const isActive = accordion.classList.contains('active');
            if (isActive) {
                accordion.classList.remove('active');
                content.style.maxHeight = '0';
                state.openSettingsAccordions = Array.isArray(state.openSettingsAccordions)
                    ? state.openSettingsAccordions.filter(id => id !== accordionId)
                    : [];
            }
            else {
                document.querySelectorAll('.settings-accordion.active').forEach(otherAccordion => {
                    if (otherAccordion === accordion)
                        return;
                    otherAccordion.classList.remove('active');
                    const otherContent = otherAccordion.querySelector('.settings-accordion-content');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0';
                    }
                });
                accordion.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                state.openSettingsAccordions = [accordionId];
            }
            };
            // ✅ FIX: Sadece click event kullan (modern tarayıcılar mobilde de hızlı)
            // touchend + click = çift tetikleme = accordion açılıp hemen kapanma sorunu!
            header.addEventListener('click', clickHandler);
        });
        // Settings Page - Company Info & PDF settings
        document.querySelectorAll('[data-company-key]').forEach(input => {
            input.addEventListener('input', (e) => {
                e.stopPropagation();
                const key = e.target.dataset.companyKey;
                const value = e.target.value;
                const newCompanyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), { [key]: value });
                // ✅ FIX: skipRender=true ekle (her tuşta accordion kapanmasın!)
                setState({ settings: Object.assign(Object.assign({}, state.settings), { companyInfo: newCompanyInfo }) }, true);
            });
        });
        (_b = document.getElementById('companyLogoFile')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result;
                    const newCompanyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), { logo: base64String });
                    setState({ settings: Object.assign(Object.assign({}, state.settings), { companyInfo: newCompanyInfo }) });
                };
                reader.readAsDataURL(file);
            }
        });
        (_c = document.getElementById('remove-logo-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            const newCompanyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), { logo: null });
            setState({ settings: Object.assign(Object.assign({}, state.settings), { companyInfo: newCompanyInfo }) });
        });
        (_d = document.getElementById('companyPdfBackgroundFile')) === null || _d === void 0 ? void 0 : _d.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result;
                    const newCompanyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), { pdfBackground: base64String });
                    setState({ settings: Object.assign(Object.assign({}, state.settings), { companyInfo: newCompanyInfo }) });
                };
                reader.readAsDataURL(file);
            }
        });
        (_e = document.getElementById('remove-pdf-background-btn')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            const newCompanyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), { pdfBackground: null });
            setState({ settings: Object.assign(Object.assign({}, state.settings), { companyInfo: newCompanyInfo }) });
        });
        // Settings Page Controls - FIX: Stop propagation to prevent accordion from closing
        document.querySelectorAll('[data-setting-key]').forEach(el => {
            el.addEventListener('change', (e) => {
                e.stopPropagation(); // Prevent accordion from closing
                const key = e.target.dataset.settingKey;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                setState({ settings: Object.assign(Object.assign({}, state.settings), { [key]: value }) });
                saveDataToLocalStorage(); // Ayar değiştiğinde kaydet
            });
        });
        // PDF Checkboxes - FIX: Stop propagation to prevent accordion from closing
        (_f = document.getElementById('pdf_show_logo')) === null || _f === void 0 ? void 0 : _f.addEventListener('change', (e) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            const newPdfSettings = Object.assign(Object.assign({}, state.settings.pdfSettings), { showLogo: isChecked });
            setState({ settings: Object.assign(Object.assign({}, state.settings), { pdfSettings: newPdfSettings }) });
        });
        (_g = document.getElementById('pdf_show_footer')) === null || _g === void 0 ? void 0 : _g.addEventListener('change', (e) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            const newPdfSettings = Object.assign(Object.assign({}, state.settings.pdfSettings), { showFooter: isChecked });
            setState({ settings: Object.assign(Object.assign({}, state.settings), { pdfSettings: newPdfSettings }) });
        });
        (_h = document.getElementById('pdf_show_background')) === null || _h === void 0 ? void 0 : _h.addEventListener('change', (e) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            const newPdfSettings = Object.assign(Object.assign({}, state.settings.pdfSettings), { showBackground: isChecked });
            setState({ settings: Object.assign(Object.assign({}, state.settings), { pdfSettings: newPdfSettings }) });
        });
        // Settings Page - Save Button
        (_j = document.querySelector('.btn-gradient-save')) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Veriler her değişiklikte zaten kaydediliyor, bu buton sadece geri bildirim ve UI temizliği için.
            saveDataToLocalStorage(); // En son halini garantiye alarak kaydet.
            // 🔥 Firebase'e otomatik kaydet
            if ((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseEnabled) {
                try {
                    const dataToSend = {
                        vehiclesData,
                        customersData,
                        rentalsData,
                        reservationsData,
                        maintenanceData,
                        activitiesData,
                        documentsData, // ✅ Dosyaları da gönder
                        settings: state.settings,
                    };
                    // Firebase'e gönder
                    if (typeof sendDataToFirebase === 'function') {
                        yield sendDataToFirebase(dataToSend);
                        showToast('✅ Ayarlar kaydedildi ve Firebase\'e yüklendi!', 'success');
                    }
                    else {
                        showToast('✅ Ayarlar kaydedildi!', 'success');
                    }
                }
                catch (error) {
                    console.error('Firebase kaydetme hatası:', error);
                    showToast('✅ Ayarlar yerel olarak kaydedildi!', 'success');
                }
            }
            else {
                showToast('✅ Ayarlar başarıyla kaydedildi!', 'success');
            }
            // Tüm açık akordiyonları kapat
            document.querySelectorAll('.settings-accordion.active').forEach(accordion => {
                accordion.classList.remove('active');
                const content = accordion.querySelector('.settings-accordion-content');
                if (content) {
                    content.style.maxHeight = '0';
                }
            });
            state.openSettingsAccordions = [];
        }));
        // Settings Page - Backup and Restore
        (_k = document.getElementById('btn-export-data')) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => {
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
        const importFileInput = document.getElementById('import-file-input');
        (_l = document.getElementById('btn-import-data')) === null || _l === void 0 ? void 0 : _l.addEventListener('click', () => {
            importFileInput.click();
        });
        // ==================== FIREBASE HANDLERS ====================
        // Firebase configuration inputs - FIX: Stop propagation to prevent accordion from closing
        document.querySelectorAll('#firebase-apiKey, #firebase-authDomain, #firebase-databaseURL, #firebase-projectId, #firebase-storageBucket, #firebase-messagingSenderId, #firebase-appId').forEach(input => {
            input.addEventListener('input', (e) => {
                e.stopPropagation();
                const inputId = e.target.id;
                const key = inputId.replace('firebase-', '');
                const value = e.target.value;
                const newFirebaseConfig = Object.assign(Object.assign({}, state.settings.firebaseConfig), { [key]: value });
                // ✅ FIX: skipRender=true ekle (her tuşta accordion kapanmasın!)
                setState({ settings: Object.assign(Object.assign({}, state.settings), { firebaseConfig: newFirebaseConfig }) }, true);
            });
            // Also prevent click and focus events from bubbling
            input.addEventListener('click', (e) => e.stopPropagation());
            input.addEventListener('focus', (e) => e.stopPropagation());
        });
        // Firebase Master Password
        const masterPasswordInput = document.getElementById('firebase-master-password');
        if (masterPasswordInput) {
            masterPasswordInput.addEventListener('input', (e) => {
                e.stopPropagation();
                const password = e.target.value;
                // ✅ FIX: skipRender=true ekle (her tuşta accordion kapanmasın!)
                setState({ settings: Object.assign(Object.assign({}, state.settings), { firebaseMasterPassword: password }) }, true);
            });
            masterPasswordInput.addEventListener('click', (e) => e.stopPropagation());
            masterPasswordInput.addEventListener('focus', (e) => e.stopPropagation());
        }
        
        // Firebase enabled/auto-sync checkboxes
        (_m = document.getElementById('firebase_enabled')) === null || _m === void 0 ? void 0 : _m.addEventListener('change', (e) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            setState({ settings: Object.assign(Object.assign({}, state.settings), { firebaseEnabled: isChecked }) });
        });
        (_o = document.getElementById('firebase_auto_sync')) === null || _o === void 0 ? void 0 : _o.addEventListener('change', (e) => {
            e.stopPropagation();
            const isChecked = e.target.checked;
            setState({ settings: Object.assign(Object.assign({}, state.settings), { firebaseAutoSync: isChecked }) });
        });
        // Load default Firebase config
        (_p = document.getElementById('btn-load-default-firebase')) === null || _p === void 0 ? void 0 : _p.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Default Firebase config from firebase-config.js
            const defaultConfig = {
                apiKey: "AIzaSyDKeJDoNyGiPfdT6aOleZvzN85I8C3bVu8",
                authDomain: "rehber-filo.firebaseapp.com",
                databaseURL: "https://rehber-filo-default-rtdb.europe-west1.firebasedatabase.app",
                projectId: "rehber-filo",
                storageBucket: "rehber-filo.firebasestorage.app",
                messagingSenderId: "1022169726073",
                appId: "1:1022169726073:web:584648469dd7854248a8a8"
            };
            
            // Update state with default config
            setState({
                settings: Object.assign(Object.assign({}, state.settings), {
                    firebaseConfig: defaultConfig,
                    firebaseEnabled: true
                })
            });
            
            showToast('Varsayılan Firebase ayarları yüklendi! ✅', 'success');
            logActivity('fa-solid fa-cloud', 'Firebase varsayılan ayarları yüklendi');
        });
        // Test Firebase connection
        (_q = document.getElementById('btn-test-firebase')) === null || _q === void 0 ? void 0 : _q.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            e.stopPropagation();
            const btn = e.target;
            const originalText = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Test Ediliyor...';
                // Check if testFirebaseConnection function exists
                if (typeof testFirebaseConnection === 'function') {
                    const config = (_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig;
                    if (!(config === null || config === void 0 ? void 0 : config.apiKey) || !(config === null || config === void 0 ? void 0 : config.databaseURL)) {
                        throw new Error('API Key ve Database URL gerekli!');
                    }
                    // Initialize Firebase if not already
                    if (typeof initializeFirebase === 'function') {
                        initializeFirebase(config);
                    }
                    const isConnected = yield testFirebaseConnection();
                    if (isConnected) {
                        showToast('Firebase bağlantısı başarılı! ✅', 'success');
                    }
                    else {
                        throw new Error('Bağlantı kurulamadı');
                    }
                }
                else {
                    throw new Error('Firebase fonksiyonları yüklenmedi');
                }
            }
            catch (error) {
                console.error('Firebase test error:', error);
                showToast(`Firebase bağlantı hatası: ${error.message}`, 'error');
            }
            finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }));
        // Send data to Firebase
        (_r = document.getElementById('btn-send-to-firebase')) === null || _r === void 0 ? void 0 : _r.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            e.stopPropagation();
            const btn = e.target;
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
                    documentsData, // ✅ Dosyaları da ekle
                    settings: state.settings,
                };
                // Check if Firebase functions exist
                if (typeof sendDataToFirebase === 'function') {
                    // Initialize Firebase if not already
                    const config = (_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig;
                    if (typeof initializeFirebase === 'function') {
                        initializeFirebase(config);
                    }
                    yield sendDataToFirebase(dataToSend);
                    const vehicleCount = (vehiclesData === null || vehiclesData === void 0 ? void 0 : vehiclesData.length) || 0;
                    const customerCount = (customersData === null || customersData === void 0 ? void 0 : customersData.length) || 0;
                    const rentalCount = (rentalsData === null || rentalsData === void 0 ? void 0 : rentalsData.length) || 0;
                    const docCount = (documentsData === null || documentsData === void 0 ? void 0 : documentsData.length) || 0;
                    showToast(`Veriler başarıyla gönderildi! 📤\n${vehicleCount} araç, ${customerCount} müşteri, ${rentalCount} kiralama, ${docCount} dosya`, 'success');
                }
                else {
                    throw new Error('Firebase fonksiyonları yüklenmedi');
                }
            }
            catch (error) {
                showToast(`Firebase gönderme hatası: ${error.message}`, 'error');
                console.error('Firebase send error:', error);
            }
            finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }));
        // Fetch data from Firebase
        (_s = document.getElementById('btn-fetch-from-firebase')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a, _a2;
            e.stopPropagation();
            const btn = e.target;
            const originalText = btn.innerHTML;
            
            // 🔐 ŞİFRE KONTROLÜ
            const savedPassword = ((_a2 = state.settings) === null || _a2 === void 0 ? void 0 : _a2.firebaseMasterPassword) || '';
            const correctPassword = '1259';
            
            if (savedPassword !== correctPassword) {
                const enteredPassword = prompt('🔐 Firebase verilerini almak için ana şifreyi girin:');
                if (!enteredPassword) {
                    showToast('İşlem iptal edildi', 'info');
                    return;
                }
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
                    const config = (_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig;
                    if (typeof initializeFirebase === 'function') {
                        yield initializeFirebase(config);
                    }
                    const data = yield fetchDataFromFirebase();
                    // Update local data
                    if (data.vehiclesData)
                        vehiclesData = data.vehiclesData;
                    if (data.customersData)
                        customersData = data.customersData;
                    if (data.rentalsData)
                        rentalsData = data.rentalsData;
                    if (data.reservationsData)
                        reservationsData = data.reservationsData;
                    if (data.maintenanceData)
                        maintenanceData = data.maintenanceData;
                    if (data.activitiesData)
                        activitiesData = data.activitiesData;
                    if (data.documentsData)
                        documentsData = data.documentsData; // ✅ Dosyaları da yükle
                    if (data.settings) {
                        state.settings = Object.assign(Object.assign({}, state.settings), data.settings);
                    }
                    // Save to localStorage
                    saveDataToLocalStorage();
                    const vehicleCount = (vehiclesData === null || vehiclesData === void 0 ? void 0 : vehiclesData.length) || 0;
                    const customerCount = (customersData === null || customersData === void 0 ? void 0 : customersData.length) || 0;
                    const rentalCount = (rentalsData === null || rentalsData === void 0 ? void 0 : rentalsData.length) || 0;
                    const docCount = (documentsData === null || documentsData === void 0 ? void 0 : documentsData.length) || 0;
                    showToast(`Veriler başarıyla alındı! 📥\n${vehicleCount} araç, ${customerCount} müşteri, ${rentalCount} kiralama, ${docCount} dosya`, 'success');
                    // Re-render the app
                    renderApp();
                }
                else {
                    throw new Error('Firebase fonksiyonları yüklenmedi');
                }
            }
            catch (error) {
                showToast(`Firebase veri çekme hatası: ${error.message}`, 'error');
                console.error('Firebase fetch error:', error);
            }
            finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }));

        // 🔥 Storage'dan Dosyaları Yükle butonu
        (_s = document.getElementById('btn-recover-storage-files')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            e.stopPropagation();
            const btn = e.target;
            const originalText = btn.innerHTML;

            if (!confirm('🔄 Firebase Storage\'dan tüm dosyalar taranacak ve metadata oluşturulacak.\n\nDevam etmek istiyor musunuz?')) {
                return;
            }

            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Taranıyor...';

                // Firebase'i başlat
                if (typeof initializeFirebase === 'function') {
                    yield initializeFirebase((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig);
                }

                // Storage'dan dosyaları listele
                if (typeof listAllFilesFromStorage === 'function') {
                    const files = yield listAllFilesFromStorage();

                    if (files && files.length > 0) {
                        // documentsData'yı temizle ve yeni dosyaları ekle
                        documentsData.length = 0;
                        documentsData.push(...files);

                        // localStorage'a kaydet
                        saveDataToLocalStorage();

                        // Firebase Realtime Database'e kaydet
                        if (typeof sendDataToFirebase === 'function') {
                            yield sendDataToFirebase({
                                vehiclesData,
                                customersData,
                                rentalsData,
                                reservationsData,
                                maintenanceData,
                                activitiesData,
                                documentsData,
                                settings: state.settings
                            });
                        }

                        // Render et
                        renderApp();

                        showToast(`✅ ${files.length} dosya başarıyla yüklendi ve kaydedildi!`, 'success');
                    } else {
                        showToast('⚠️ Storage\'da dosya bulunamadı!', 'warning');
                    }
                } else {
                    throw new Error('listAllFilesFromStorage fonksiyonu yüklenmedi');
                }
            } catch (error) {
                showToast(`❌ Hata: ${error.message}`, 'error');
                console.error('Storage recovery error:', error);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }));

        // PWA Install button
        (_s = document.getElementById('btn-install-pwa')) === null || _s === void 0 ? void 0 : _s.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            e.stopPropagation();
            const deferredPrompt = window.pwaInstallPrompt;
            if (!deferredPrompt) {
                showToast('Bu uygulama zaten kurulu veya tarayıcınız PWA kurulumunu desteklemiyor. 📱', 'success');
                return;
            }
            try {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond
                const { outcome } = yield deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    showToast('Uygulama kuruluyor... 🎉', 'success');
                    window.pwaInstallPrompt = null;
                }
                else {
                    showToast('Kurulum iptal edildi.', 'success');
                }
            }
            catch (error) {
                console.error('PWA install error:', error);
                showToast('Kurulum sırasında bir hata oluştu.', 'error');
            }
        }));
        importFileInput === null || importFileInput === void 0 ? void 0 : importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        let dataToLoad = {};
                        if (importedData.vehiclesData) {
                            // Eğer bizim kendi yedek dosyamız ise, olduğu gibi al.
                            console.log("Standart yedek dosyası tespit edildi.");
                            dataToLoad = importedData;
                        }
                        else if (importedData.vehicles || importedData.rentals || importedData.maintenance) {
                            console.log("Harici format tespit edildi, veriler dönüştürülüyor...");
                            // 1. Müşterileri Kiralamalardan Çıkar
                            let tempCustomersData = JSON.parse(JSON.stringify(customersData)); // Deep copy to avoid issues
                            let nextCustomerId = Math.max(0, ...tempCustomersData.map(c => c.id)) + 1;
                            if (importedData.rentals && Array.isArray(importedData.rentals)) {
                                importedData.rentals.forEach(rental => {
                                    var _a;
                                    const customerName = (_a = rental.customer) === null || _a === void 0 ? void 0 : _a.trim();
                                    if (customerName && !tempCustomersData.some(c => c.name.toLowerCase() === customerName.toLowerCase())) {
                                        const newCustomer = {
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
                            }
                            else {
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
                                    const customer = tempCustomersData.find(c => { var _a; return c.name.toLowerCase() === ((_a = r.customer) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
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
                                        const activeRental = dataToLoad.rentalsData.find(rental => rental.vehiclePlate === vehicle.plate && rental.status === 'active');
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
                        }
                        else {
                            throw new Error("Dosya beklenen formatta değil. 'vehicles', 'rentals', 'maintenance' veya 'vehiclesData' anahtarı bulunamadı.");
                        }
                        if (confirm('Veriler içe aktarılacak. Bu işlem, dosyadaki verileri mevcut verilerinizin üzerine yazacaktır. Onaylıyor musunuz?')) {
                            // Mevcut verileri al
                            const currentData = JSON.parse(localStorage.getItem('rehberOtomotivData') || '{}');
                            // İçe aktarılan veriyi mevcut verinin üzerine "birleştir".
                            // Bu sayede sadece içe aktarılan dosyada olan alanlar güncellenir.
                            const mergedData = Object.assign(Object.assign({}, currentData), dataToLoad);
                            localStorage.setItem('rehberOtomotivData', JSON.stringify(mergedData));
                            localStorage.setItem('showImportSuccessToast', 'true'); // Başarı mesajı için işaret bırak
                            // Kaydetme fonksiyonunu burada çağırmıyoruz, çünkü zaten localStorage'a yazdık.
                            window.location.reload(); // Sayfayı yeniden yükleyerek en temiz şekilde verileri almasını sağla
                        }
                    }
                    catch (err) {
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
                const filter = btn.dataset.filter;
                setState({ notificationFilter: filter });
            });
        });
        // Notification card click (for reminders)
        document.querySelectorAll('.notification-card[data-vehicle-index]').forEach(card => {
            const vehicleIndexStr = card.dataset.vehicleIndex;
            const notificationId = parseInt(card.dataset.notificationId, 10);
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
            const pageId = el.dataset.pageId;
            // Special handling for quick access buttons that open modals instead of navigating
            if (pageId === 'vehicles' && el.classList.contains('btn-add-vehicle'))
                return;
            if (pageId === 'customers' && el.classList.contains('btn-add-customer'))
                return;
            if (pageId === 'rentals' && el.classList.contains('btn-start-rental'))
                return;
            if (pageId === 'maintenance' && el.classList.contains('btn-add-maintenance'))
                return;
            if (pageId) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateTo(pageId);
                });
            }
        });
        // Quick access buttons on dashboard
        (_t = document.querySelector('.btn-add-vehicle')) === null || _t === void 0 ? void 0 : _t.addEventListener('click', () => openModal('vehicle'));
        (_u = document.querySelector('.btn-add-customer')) === null || _u === void 0 ? void 0 : _u.addEventListener('click', () => openModal('customer'));
        // For now, other quick access buttons navigate to their pages, which is handled above.
        // Rent button on dashboard available vehicles list
        document.querySelectorAll('.btn-rent-small').forEach(btn => {
            const plate = btn.dataset.vehiclePlate;
            const vehicleIndex = vehiclesData.findIndex(v => v.plate === plate);
            if (vehicleIndex > -1) {
                btn.addEventListener('click', () => openModal('rental', vehicleIndex));
            }
        });
        const openModal = (modalType, entityIndex) => {
            const newState = {
                editingVehicleIndex: null,
                editingCustomerIndex: null,
                editingRentalId: null,
                editingReservationId: null,
                editingMaintenanceId: null,
            };
            if (modalType === 'vehicle') {
                newState.isVehicleModalOpen = true;
                if (typeof entityIndex === 'number')
                    newState.editingVehicleIndex = entityIndex;
            }
            if (modalType === 'rental') {
                newState.isRentalModalOpen = true;
                newState.rentalFormCustomerType = 'existing'; // Reset to default
                if (typeof entityIndex === 'number')
                    newState.selectedVehicleForAction = vehiclesData[entityIndex];
            }
            if (modalType === 'check-in') {
                newState.isCheckInModalOpen = true;
                if (typeof entityIndex === 'number')
                    newState.selectedVehicleForAction = vehiclesData[entityIndex];
            }
            if (modalType === 'customer') {
                newState.isCustomerModalOpen = true;
                if (typeof entityIndex === 'number')
                    newState.editingCustomerIndex = entityIndex;
            }
            if (modalType === 'rental-edit') {
                newState.isRentalEditModalOpen = true;
                if (entityIndex !== undefined)
                    newState.editingRentalId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
            }
            if (modalType === 'reservation') {
                newState.isReservationModalOpen = true;
            }
            if (modalType === 'maintenance') {
                newState.isMaintenanceModalOpen = true;
            }
            if (modalType === 'maintenance-edit') {
                newState.isMaintenanceEditModalOpen = true;
                if (entityIndex !== undefined)
                    newState.editingMaintenanceId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
            }
            if (modalType === 'reservation-edit') {
                newState.isReservationEditModalOpen = true;
                if (entityIndex !== undefined)
                    newState.editingReservationId = parseInt(String(entityIndex), 10); // String'i sayıya çevir.
            }
            setState(newState);
        };
        // ❌ LOCAL closeModal REMOVED - GLOBAL closeModal() kullanılacak
        // Open vehicle modal
        (_v = document.getElementById('add-vehicle-btn')) === null || _v === void 0 ? void 0 : _v.addEventListener('click', () => openModal('vehicle'));
        (_w = document.getElementById('add-customer-btn')) === null || _w === void 0 ? void 0 : _w.addEventListener('click', () => openModal('customer'));
        // Open reservation/maintenance modals
        (_x = document.getElementById('add-reservation-btn')) === null || _x === void 0 ? void 0 : _x.addEventListener('click', () => openModal('reservation'));
        (_y = document.getElementById('add-maintenance-btn')) === null || _y === void 0 ? void 0 : _y.addEventListener('click', () => openModal('maintenance'));
        // Open rental/check-in modals
        document.querySelectorAll('.btn-rent').forEach(btn => {
            const card = btn.closest('.vehicle-card');
            const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
            btn.addEventListener('click', () => openModal('rental', vehicleIndex));
        });
        document.querySelectorAll('.btn-check-in').forEach(btn => {
            const card = btn.closest('.vehicle-card');
            const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
            btn.addEventListener('click', () => openModal('check-in', vehicleIndex));
        });
        // Edit/Delete vehicle buttons
        document.querySelectorAll('.btn-edit-vehicle').forEach(btn => {
            const card = btn.closest('.vehicle-card');
            const vehicleIndex = parseInt(card.dataset.vehicleIndex, 10);
            btn.addEventListener('click', () => openModal('vehicle', vehicleIndex));
        });
        document.querySelectorAll('.btn-delete-vehicle').forEach(btn => {
            const card = btn.closest('.vehicle-card');
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
            const accordion = btn.closest('.customer-accordion');
            const customerIndex = parseInt(accordion.dataset.customerIndex, 10);
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent accordion from opening/closing
                openModal('customer', customerIndex);
            });
        });
        document.querySelectorAll('.btn-delete-customer').forEach(btn => {
            const accordion = btn.closest('.customer-accordion');
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
            const card = btn.closest('.vehicle-card');
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
                    const target = e.target;
                    const button = target.closest('[data-action]');
                    if (!button)
                        return;
                    const action = button.dataset.action;
                    const card = button.closest('.rental-card');
                    const rentalId = card === null || card === void 0 ? void 0 : card.dataset.rentalId;
                    const docUrl = button.dataset.docUrl;
                    if (!action || !rentalId)
                        return;
                    if (action === 'delete-rental') {
                        if (confirm(`Bu kiralama kaydını silmek istediğinizden emin misiniz?`)) {
                            const rentalIndex = rentalsData.findIndex(r => r.id === parseInt(rentalId, 10));
                            if (rentalIndex > -1) {
                                rentalsData.splice(rentalIndex, 1);
                                setState({});
                                showToast('Kiralama kaydı silindi.', 'success');
                            }
                        }
                    }
                    else if (action === 'edit-rental' || action === 'upload-doc') {
                        openModal('rental-edit', rentalId);
                    }
                    else if (action === 'view-doc') {
                        console.log('📄 view-doc tıklandı, docUrl:', docUrl);
                        if (docUrl && docUrl !== 'null' && docUrl !== 'undefined') {
                            window.open(docUrl, '_blank');
                        } else {
                            showToast('Dosya bulunamadı', 'error');
                            console.error('❌ Dosya URL boş veya geçersiz:', docUrl);
                        }
                    }
                });
            }
        }
        // --- REPORTS PAGE LISTENERS ---
        if (state.activePage === 'reports') {
            const reportSelect = document.getElementById('report-rental-select');
            const generateBtn = document.getElementById('generate-report-btn');
            if (reportSelect && generateBtn) {
                reportSelect.addEventListener('change', () => {
                    generateBtn.disabled = !reportSelect.value;
                });
                if (!generateBtn.dataset.listenerAttached) {
                    generateBtn.addEventListener('click', () => {
                        if (reportSelect.value) {
                            const selectedRentalId = parseInt(reportSelect.value, 10);
                            const rental = rentalsData.find(r => r.id === selectedRentalId);
                            if (rental)
                                generateRentalSummaryPDF(rental);
                        }
                    });
                    generateBtn.dataset.listenerAttached = 'true';
                }
            }
        }
        // Dashboard -> Vehicle Page filtering
        document.querySelectorAll('.distribution-item-reimagined').forEach(item => {
            const statusFilter = item.dataset.statusFilter;
            if (statusFilter) {
                item.addEventListener('click', () => {
                    setState({ activePage: 'vehicles', vehicleStatusFilter: statusFilter, searchTerm: '' });
                });
            }
        });
        // Edit/Delete reservation buttons
        document.querySelectorAll('.btn-edit-reservation').forEach(btn => {
            const card = btn.closest('.reservation-card');
            const reservationId = card.dataset.reservationId;
            btn.addEventListener('click', () => openModal('reservation-edit', reservationId));
        });
        document.querySelectorAll('.btn-delete-reservation').forEach(btn => {
            const card = btn.closest('.reservation-card');
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
            const card = btn.closest('.maintenance-card');
            const maintenanceId = card.dataset.maintenanceId;
            btn.addEventListener('click', () => openModal('maintenance-edit', maintenanceId));
        });
        document.querySelectorAll('.btn-delete-maintenance').forEach(btn => {
            const card = btn.closest('.maintenance-card');
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
        (_z = document.getElementById('vehicle-form')) === null || _z === void 0 ? void 0 : _z.addEventListener('submit', handleVehicleFormSubmit);
        (_0 = document.getElementById('customer-form')) === null || _0 === void 0 ? void 0 : _0.addEventListener('submit', handleCustomerFormSubmit);
        (_1 = document.getElementById('rental-form')) === null || _1 === void 0 ? void 0 : _1.addEventListener('submit', handleRentalFormSubmit);
        (_2 = document.getElementById('check-in-form')) === null || _2 === void 0 ? void 0 : _2.addEventListener('submit', handleCheckInFormSubmit);
        (_3 = document.getElementById('rental-edit-form')) === null || _3 === void 0 ? void 0 : _3.addEventListener('submit', handleRentalEditFormSubmit);
        (_4 = document.getElementById('reservation-form')) === null || _4 === void 0 ? void 0 : _4.addEventListener('submit', handleReservationFormSubmit);
        (_5 = document.getElementById('reservation-edit-form')) === null || _5 === void 0 ? void 0 : _5.addEventListener('submit', handleReservationEditFormSubmit);
        (_6 = document.getElementById('maintenance-form')) === null || _6 === void 0 ? void 0 : _6.addEventListener('submit', handleMaintenanceFormSubmit);
        (_7 = document.getElementById('maintenance-edit-form')) === null || _7 === void 0 ? void 0 : _7.addEventListener('submit', handleMaintenanceEditFormSubmit);
        // Close modal listeners for buttons with data-modal-id
        document.querySelectorAll('.close-modal-btn, .modal-footer .btn-secondary').forEach(btn => {
            const modalIdWithSuffix = btn.dataset.modalId;
            if (modalIdWithSuffix) {
                const modalId = modalIdWithSuffix.replace('-modal', '');
                btn.addEventListener('click', () => closeModal(modalId));
            }
        });
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    const modalId = overlay.id.replace('-modal-overlay', '');
                    closeModal(modalId);
                }
            });
        });
        // Customer Accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const accordionItem = header.parentElement;
                const content = accordionItem.querySelector('.accordion-content');
                const arrow = header.querySelector('.accordion-arrow');
                accordionItem.classList.toggle('active');
                if (accordionItem.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 40 + "px"; // Add padding
                    if (arrow)
                        arrow.style.transform = 'rotate(180deg)';
                }
                else {
                    content.style.maxHeight = null;
                    if (arrow)
                        arrow.style.transform = 'rotate(0deg)';
                }
            });
        });
        // Search functionality
        const handleSearch = (e) => {
            const searchTerm = e.target.value;
            setState({ searchTerm });
        };
        (_8 = document.getElementById('vehicle-search')) === null || _8 === void 0 ? void 0 : _8.addEventListener('input', handleSearch);
        (_9 = document.getElementById('customer-search')) === null || _9 === void 0 ? void 0 : _9.addEventListener('input', handleSearch);
        (_10 = document.getElementById('rental-search')) === null || _10 === void 0 ? void 0 : _10.addEventListener('input', handleSearch);
        (_11 = document.getElementById('reservation-search')) === null || _11 === void 0 ? void 0 : _11.addEventListener('input', handleSearch);
        (_12 = document.getElementById('maintenance-search')) === null || _12 === void 0 ? void 0 : _12.addEventListener('input', handleSearch);
        // Clear Maintenance Filter Button
        (_13 = document.getElementById('clear-maintenance-filter')) === null || _13 === void 0 ? void 0 : _13.addEventListener('click', () => {
            setState({ searchTerm: '' });
        });
        // Vehicle Page Expiring Filter Button
        (_14 = document.getElementById('filter-expiring-btn')) === null || _14 === void 0 ? void 0 : _14.addEventListener('click', () => {
            setState({ filterExpiring: !state.filterExpiring });
        });
        // Rental Modal Customer Type Toggle
        document.querySelectorAll('input[name="customerType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const value = e.target.value;
                // Toggle required attributes to fix form submission
                const customerSelect = document.getElementById('customer-id-select');
                const newCustomerName = document.getElementById('new-customer-name');
                const newCustomerTc = document.getElementById('new-customer-tc');
                const newCustomerPhone = document.getElementById('new-customer-phone');
                if (value === 'new') {
                    customerSelect.required = false;
                    newCustomerName.required = true;
                    newCustomerTc.required = true;
                    newCustomerPhone.required = true;
                }
                else {
                    customerSelect.required = true;
                    newCustomerName.required = false;
                    newCustomerTc.required = false;
                    newCustomerPhone.required = false;
                }
                setState({ rentalFormCustomerType: value });
            });
        });
        // Reservation Modal Customer Type Toggle
        document.querySelectorAll('input[name="customerType"][id^="res-"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const value = e.target.value;
                const existingSection = document.getElementById('res-existing-customer-section');
                const newSection = document.getElementById('res-new-customer-section');
                const customerSelect = document.getElementById('res-customer-id-select');
                const newName = document.getElementById('res-new-customer-name');
                const newPhone = document.getElementById('res-new-customer-phone');
                existingSection.style.display = value === 'existing' ? 'flex' : 'none';
                newSection.style.display = value === 'new' ? 'block' : 'none';
                customerSelect.required = value === 'existing';
                newName.required = value === 'new';
                newPhone.required = value === 'new';
            });
        });
        // Auto-calculate next maintenance date/km
        const maintenanceKmInput = document.getElementById('maintenance-km');
        const maintenanceDateInput = document.getElementById('maintenance-date');
        const nextKmInput = document.getElementById('next-maintenance-km');
        const nextDateInput = document.getElementById('next-maintenance-date');
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
        maintenanceKmInput === null || maintenanceKmInput === void 0 ? void 0 : maintenanceKmInput.addEventListener('input', updateNextMaintenance);
        maintenanceDateInput === null || maintenanceDateInput === void 0 ? void 0 : maintenanceDateInput.addEventListener('input', updateNextMaintenance);
        
        // ========== DOSYA YÖNETİMİ EVENT LISTENERS ==========
        
        // Seçim Modu Toggle
        const btnToggleSelectMode = document.getElementById('btn-toggle-select-mode');
        if (btnToggleSelectMode) {
            btnToggleSelectMode.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const checkboxes = document.querySelectorAll('.document-card-checkbox');
                const isSelectMode = checkboxes[0]?.style.display === 'none';
                
                // Checkbox'ları göster/gizle
                checkboxes.forEach(cb => {
                    cb.style.display = isSelectMode ? 'flex' : 'none';
                });
                
                // Buton metnini değiştir
                const icon = btnToggleSelectMode.querySelector('i');
                if (isSelectMode) {
                    btnToggleSelectMode.innerHTML = '<i class="fa-solid fa-xmark"></i> Seçimi İptal Et';
                    btnToggleSelectMode.classList.remove('btn-secondary');
                    btnToggleSelectMode.classList.add('btn-danger');
                } else {
                    btnToggleSelectMode.innerHTML = '<i class="fa-solid fa-check-square"></i> Seçim Modu';
                    btnToggleSelectMode.classList.remove('btn-danger');
                    btnToggleSelectMode.classList.add('btn-secondary');
                    
                    // Tüm seçimleri temizle
                    document.querySelectorAll('.doc-select-checkbox').forEach(cb => cb.checked = false);
                    document.getElementById('btn-bulk-delete-documents').style.display = 'none';
                    document.getElementById('selected-docs-count').textContent = '0';
                }
            });
        }
        
        // Checkbox değişikliklerini dinle
        document.querySelectorAll('.doc-select-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const selectedCount = document.querySelectorAll('.doc-select-checkbox:checked').length;
                const bulkDeleteBtn = document.getElementById('btn-bulk-delete-documents');
                const countSpan = document.getElementById('selected-docs-count');
                
                if (selectedCount > 0) {
                    bulkDeleteBtn.style.display = 'flex';
                    countSpan.textContent = selectedCount;
                } else {
                    bulkDeleteBtn.style.display = 'none';
                    countSpan.textContent = '0';
                }
            });
        });
        
        // Toplu Silme
        const btnBulkDelete = document.getElementById('btn-bulk-delete-documents');
        if (btnBulkDelete) {
            btnBulkDelete.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedCheckboxes = document.querySelectorAll('.doc-select-checkbox:checked');
                const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.docId); // ✅ String ID destekli
                
                if (selectedIds.length === 0) {
                    showToast('Lütfen silinecek dosyaları seçin', 'error');
                    return;
                }
                
                const confirmDelete = confirm(`${selectedIds.length} dosyayı silmek istediğinizden emin misiniz?`);
                if (!confirmDelete) return;
                
                // Seçili dosyaları sil (Firebase Storage dahil)
                for (const docId of selectedIds) {
                    const index = documentsData.findIndex(d => d.id === docId);
                    if (index > -1) {
                        const doc = documentsData[index];
                        
                        // Firebase Storage'dan sil
                        if (doc.storageType === 'firebaseStorage' && doc.url) {
                            try {
                                if (typeof deleteFileFromStorage === 'function') {
                                    await deleteFileFromStorage(doc.url);
                                }
                            } catch (err) {
                                console.error('Firebase Storage silme hatası:', err);
                            }
                        }
                        
                        documentsData.splice(index, 1);
                    }
                }
                
                saveDataToLocalStorage();
                showToast(`${selectedIds.length} dosya başarıyla silindi!`, 'success');
                logActivity('fa-solid fa-trash', `${selectedIds.length} dosya toplu silindi`);
                renderApp();
            });
        }
        
        // "Yeni Dosya Ekle" butonları
        const btnAddDocHeader = document.getElementById('btn-add-document-header');
        if (btnAddDocHeader) {
            btnAddDocHeader.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDocumentUploadModal();
            });
        }
        
        const btnAddDocEmpty = document.getElementById('btn-add-document-empty');
        if (btnAddDocEmpty) {
            btnAddDocEmpty.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDocumentUploadModal();
            });
        }
        
        // Document Upload Modal
        const documentUploadForm = document.getElementById('document-upload-form');
        if (documentUploadForm) {
            documentUploadForm.addEventListener('submit', handleDocumentUpload);
        }
        
        // Upload Type Switch Buttons
        const btnUploadSingle = document.getElementById('btn-upload-single');
        const btnUploadFolder = document.getElementById('btn-upload-folder');
        if (btnUploadSingle) {
            btnUploadSingle.addEventListener('click', (e) => {
                e.preventDefault();
                switchUploadType('single');
            });
        }
        if (btnUploadFolder) {
            btnUploadFolder.addEventListener('click', (e) => {
                e.preventDefault();
                switchUploadType('folder');
            });
        }
        
        // File Input Change
        const docFileInput = document.getElementById('doc-file');
        if (docFileInput) {
            docFileInput.addEventListener('change', handleDocumentFileSelect);
        }
        
        // Folder Input Change
        const docFolderInput = document.getElementById('doc-folder');
        if (docFolderInput) {
            docFolderInput.addEventListener('change', handleFolderSelect);
        }
        
        const btnCloseDocUpload = document.getElementById('btn-close-document-upload');
        if (btnCloseDocUpload) {
            btnCloseDocUpload.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }
        
        const btnCancelDocUpload = document.getElementById('btn-cancel-document-upload');
        if (btnCancelDocUpload) {
            btnCancelDocUpload.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }
        
        const docUploadOverlay = document.getElementById('document-upload-modal-overlay');
        if (docUploadOverlay) {
            docUploadOverlay.addEventListener('click', (e) => {
                if (e.target === docUploadOverlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                }
            });
        }
        
        // Document Preview Modal
        const btnCloseDocPreview = document.getElementById('btn-close-document-preview');
        if (btnCloseDocPreview) {
            btnCloseDocPreview.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }
        
        const docPreviewOverlay = document.getElementById('document-preview-modal-overlay');
        if (docPreviewOverlay) {
            docPreviewOverlay.addEventListener('click', (e) => {
                if (e.target === docPreviewOverlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                }
            });
        }
        
        document.querySelectorAll('.btn-download-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const docId = btn.dataset.docId; // ✅ String ID destekli (DOC-xxx formatı)
                downloadDocument(docId);
            });
        });
        
        document.querySelectorAll('.btn-delete-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const docId = btn.dataset.docId; // ✅ String ID destekli (DOC-xxx formatı)
                deleteDocument(docId);
            });
        });
        
        // Dosya önizleme butonları (göz ikonu)
        document.querySelectorAll('.btn-preview-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const docId = btn.dataset.docId; // ✅ String ID destekli (DOC-xxx formatı)
                window.previewDocument(docId);
            });
        });
        
        // Category accordion headers
        document.querySelectorAll('.document-category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const category = header.dataset.category;
                if (category) {
                    window.toggleDocumentCategory(category);
                }
            });
        });
        
        // Document Selector Modal
        const btnCloseDocSelector = document.getElementById('btn-close-document-selector');
        if (btnCloseDocSelector) {
            btnCloseDocSelector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }
        
        const btnCancelDocSelector = document.getElementById('btn-cancel-document-selector');
        if (btnCancelDocSelector) {
            btnCancelDocSelector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }
        
        // 🔥 YENİ BUTON: "YÜKLE" - Seçilen dosyayı hemen yükle
        const btnUploadSelectedDocument = document.getElementById('btn-upload-selected-document');
        if (btnUploadSelectedDocument) {
            btnUploadSelectedDocument.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectDocumentFromModal(); // Aynı fonksiyon - sadece buton ismi değişti
            });
        }
        
        const btnAddDocFromSelector = document.getElementById('btn-add-doc-from-selector');
        if (btnAddDocFromSelector) {
            btnAddDocFromSelector.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                setTimeout(() => openDocumentUploadModal(), 100);
            });
        }
        
        // 📂 KLASÖR AÇMA/KAPAMA - Folder toggle listeners
        const folderHeaders = document.querySelectorAll('.doc-folder-header');
        folderHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const folderKey = header.dataset.folder;
                console.log('📂 Klasör toggle:', folderKey);
                
                // State'te klasör durumunu değiştir
                if (!state.openFolders) state.openFolders = {};
                state.openFolders[folderKey] = !state.openFolders[folderKey];
                
                // Render et
                saveDataToLocalStorage();
                renderApp();
            });
        });
        
        const docSelectorOverlay = document.getElementById('document-selector-modal-overlay');
        if (docSelectorOverlay) {
            docSelectorOverlay.addEventListener('click', (e) => {
                if (e.target === docSelectorOverlay) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                }
            });
        }
        
        // ============================================
        // "DOSYALARIMDAN SEÇ" BUTONLARI
        // ============================================
        
        // X (remove) butonlarına event listener ekle
        document.querySelectorAll('.remove-selection').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetInputId = btn.dataset.target;
                console.log('🗑️ Dosya seçimi kaldırılıyor:', targetInputId);
                
                // STATE'den sil
                if (state.selectedDocumentsForForm && state.selectedDocumentsForForm[targetInputId]) {
                    delete state.selectedDocumentsForForm[targetInputId];
                    saveDataToLocalStorage();
                    renderApp(); // Indicator'ı kaldırmak için render
                    showToast('Dosya seçimi kaldırıldı', 'info');
                }
            });
        });
        
        const btnSelectFromDocs = document.querySelectorAll('.btn-select-from-docs');
        btnSelectFromDocs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetInputId = btn.dataset.target;
                const category = btn.dataset.category;
                
                // DocumentSelectorModal'ı aç ve callback ile dosya seç
                openDocumentSelectorModal(category, (selectedDoc) => {
                    console.log('✅ Dosya seçildi ve yükleniyor:', selectedDoc.name, 'ID:', selectedDoc.id);

                    // 🔥 URL OLUŞTURMA: selectedDoc zaten url içeriyor
                    let fileUrl = selectedDoc.url;

                    // 🔥 EĞER URL YOKSA VEYA LOCAL PATH İSE: fileData'dan blob URL oluştur
                    if (!fileUrl || fileUrl.startsWith('C:') || fileUrl.startsWith('/') || fileUrl.startsWith('file://')) {
                        console.warn('⚠️ Geçersiz URL tespit edildi:', fileUrl);

                        // fileData (base64) varsa blob URL oluştur
                        if (selectedDoc.fileData) {
                            try {
                                // Base64'ten blob oluştur
                                const base64Data = selectedDoc.fileData.split(',')[1] || selectedDoc.fileData;
                                const mimeType = selectedDoc.fileData.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
                                const byteCharacters = atob(base64Data);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: mimeType });
                                fileUrl = URL.createObjectURL(blob);
                                console.log('✅ Base64\'ten blob URL oluşturuldu:', fileUrl);
                            } catch (error) {
                                console.error('❌ Blob URL oluşturulamadı:', error);
                                showToast('Dosya yüklenirken hata oluştu', 'error');
                                return;
                            }
                        } else {
                            console.error('❌ Ne URL ne de fileData mevcut!');
                            showToast('Bu dosya için geçerli bir URL bulunamadı. Lütfen dosyayı yeniden yükleyin.', 'error');
                            return;
                        }
                    }

                    console.log('✅ Final fileUrl:', fileUrl);

                    // 🔥 HEMEN KAYDET - Düzenleme modundaysa doğrudan kaydet
                    if (state.isVehicleModalOpen && state.editingVehicleIndex !== null) {
                        const vehicle = vehiclesData[state.editingVehicleIndex];
                        console.log('🚗 ARAÇ DÜZENLEME MODU:', vehicle.plate, 'Index:', state.editingVehicleIndex);

                        if (targetInputId === 'insuranceFile') {
                            vehicle.insuranceFile = selectedDoc.name;
                            vehicle.insuranceFileUrl = fileUrl;
                            console.log('✅ Sigorta dosyası yüklendi:', vehicle.insuranceFile, vehicle.insuranceFileUrl);
                        } else if (targetInputId === 'inspectionFile') {
                            vehicle.inspectionFile = selectedDoc.name;
                            vehicle.inspectionFileUrl = fileUrl;
                            console.log('✅ Muayene dosyası yüklendi:', vehicle.inspectionFile, vehicle.inspectionFileUrl);
                        } else if (targetInputId === 'licenseFile') {
                            vehicle.licenseFile = selectedDoc.name;
                            vehicle.licenseFileUrl = fileUrl;
                            console.log('✅ Ruhsat dosyası yüklendi:', vehicle.licenseFile, vehicle.licenseFileUrl);
                        }

                        saveDataToLocalStorage();
                        renderApp();
                        showToast('Dosya başarıyla yüklendi!', 'success');
                        return;
                    }

                    // 🔥 HEMEN KAYDET - Müşteri düzenleme modundaysa doğrudan kaydet
                    if (state.isCustomerModalOpen && state.editingCustomerIndex !== null) {
                        const customer = customersData[state.editingCustomerIndex];
                        console.log('👤 MÜŞTERİ DÜZENLEME MODU:', customer.name, 'Index:', state.editingCustomerIndex);

                        if (targetInputId === 'idFile') {
                            customer.idFile = selectedDoc.name;
                            customer.idFileUrl = fileUrl;
                            console.log('✅ Kimlik dosyası yüklendi:', customer.idFile, customer.idFileUrl);
                        } else if (targetInputId === 'licenseFile') {
                            customer.licenseFile = selectedDoc.name;
                            customer.licenseFileUrl = fileUrl;
                            console.log('✅ Ehliyet dosyası yüklendi:', customer.licenseFile, customer.licenseFileUrl);
                        }

                        saveDataToLocalStorage();
                        renderApp();
                        showToast('Dosya başarıyla yüklendi!', 'success');
                        return;
                    }

                    // 🔥 HEMEN KAYDET - Kiralama düzenleme modundaysa doğrudan kaydet
                    if (state.isRentalEditModalOpen && state.editingRentalId !== null) {
                        const rentalIndex = rentalsData.findIndex(r => r.id === state.editingRentalId);
                        if (rentalIndex > -1) {
                            const rental = rentalsData[rentalIndex];
                            console.log('� KİRALAMA DÜZENLEME MODU:', 'ID:', state.editingRentalId);

                            if (targetInputId === 'contractFile') {
                                rental.contractFile = selectedDoc.name;
                                rental.contractFileUrl = fileUrl;
                                console.log('✅ Kontrat dosyası yüklendi:', rental.contractFile, rental.contractFileUrl);
                            } else if (targetInputId === 'invoiceFile') {
                                rental.invoiceFile = selectedDoc.name;
                                rental.invoiceFileUrl = fileUrl;
                                console.log('✅ Fatura dosyası yüklendi:', rental.invoiceFile, rental.invoiceFileUrl);
                            }

                            saveDataToLocalStorage();
                            renderApp();
                            showToast('Dosya başarıyla yüklendi!', 'success');
                            return;
                        }
                    }

                    // 🎯 YENİ EKLEME MODU - State'e kaydet, form submit sonrası yükle
                    if (!state.selectedDocumentsForForm) {
                        state.selectedDocumentsForForm = {};
                    }
                    state.selectedDocumentsForForm[targetInputId] = {
                        id: selectedDoc.id,
                        name: selectedDoc.name,
                        url: fileUrl  // 🔥 Oluşturulan URL'yi kaydet
                    };

                    console.log('💾 STATE güncellendi (yeni ekleme için):', targetInputId, '→', selectedDoc.name, fileUrl);
                    saveDataToLocalStorage();
                    renderApp();
                    showToast('Dosya seçildi, formu kaydedin!', 'info');
                });
            });
        });

        // 🚀 PWA INSTALL BUTTON EVENT LISTENERS
        const pwaInstallButton = document.getElementById('pwa-install-button');
        if (pwaInstallButton) {
            pwaInstallButton.addEventListener('click', handlePWAInstallClick);
        }

        const pwaDismissButton = document.getElementById('pwa-install-dismiss');
        if (pwaDismissButton) {
            pwaDismissButton.addEventListener('click', handlePWADismissClick);
        }

        // ============================================
        // 📳 UNIVERSAL HAPTIC FEEDBACK FOR ALL BUTTONS
        // ============================================
        // Add haptic feedback to ALL buttons, links, and clickable elements
        document.querySelectorAll('button, .btn, .action-btn, .nav-link, [role="button"]').forEach(element => {
            // Check if already has haptic listener (prevent duplicates)
            if (!element.dataset.hapticAdded) {
                element.addEventListener('click', (e) => {
                    // Different haptic patterns based on button type
                    if (element.classList.contains('btn-delete') ||
                        element.classList.contains('btn-icon-danger') ||
                        element.textContent.includes('Sil')) {
                        triggerHaptic('delete');
                    } else if (element.classList.contains('btn-primary') ||
                               element.classList.contains('btn-save') ||
                               element.textContent.includes('Kaydet')) {
                        triggerHaptic('medium');
                    } else {
                        triggerHaptic('light');
                    }
                }, { passive: true }); // Passive for better scroll performance

                element.dataset.hapticAdded = 'true'; // Mark as having haptic
            }
        });

        // console.log('Event listeners attached successfully.');
    }
    catch (error) {
        console.error('!!! HATA: attachEventListeners fonksiyonunda bir sorun oluştu:', error);
    }
}
function handleVehicleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        const insuranceFile = formData.get('insuranceFile'); // Belge dosyalarını al
        const inspectionFile = formData.get('inspectionFile');
        const licenseFile = formData.get('licenseFile');
        
        // 🔥 DOSYALARIMDAN SEÇ - selectedDocumentsForForm kontrolü
        const selectedDocs = state.selectedDocumentsForForm || {};
        
        const vehicleDataUpdate = {
            plate: formData.get('plate'),
            brand: `${formData.get('brand')} ${formData.get('model')}`,
            km: (formData.get('km') || '').replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            status: formData.get('status'), // Formdan gelen verileri al
            insuranceDate: formData.get('insuranceDate'),
            inspectionDate: formData.get('inspectionDate'),
        };
        console.log('🔍 FORM SUBMIT - selectedDocs:', selectedDocs);
        console.log('🔍 documentsData:', documentsData);
        
        if (state.editingVehicleIndex !== null) {
            // Editing existing vehicle
            const originalVehicle = vehiclesData[state.editingVehicleIndex];
            
            // 🔥 SİGORTA DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['insuranceFile']) {
                console.log('📂 Sigorta dosyası seçilmiş, ID:', selectedDocs['insuranceFile'].id);
                const doc = documentsData.find(d => d.id === selectedDocs['insuranceFile'].id);
                console.log('📄 Bulunan doküman:', doc);
                if (doc) {
                    vehicleDataUpdate.insuranceFile = doc.name;
                    vehicleDataUpdate.insuranceFileUrl = selectedDocs['insuranceFile'].url; // 🔥 Oluşturulan URL'yi kullan
                    console.log('✅ Sigorta dosyası atandı:', doc.name, 'URL:', selectedDocs['insuranceFile'].url);
                } else {
                    console.error('❌ Doküman bulunamadı! ID:', selectedDocs['insuranceFile'].id);
                }
            } else if (insuranceFile && insuranceFile.size > 0) {
                if (originalVehicle.insuranceFileUrl)
                    URL.revokeObjectURL(originalVehicle.insuranceFileUrl);
                vehicleDataUpdate.insuranceFile = insuranceFile.name;
                vehicleDataUpdate.insuranceFileUrl = URL.createObjectURL(insuranceFile);
            }
            
            // 🔥 MUAYENE DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['inspectionFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['inspectionFile'].id);
                if (doc) {
                    vehicleDataUpdate.inspectionFile = doc.name;
                    vehicleDataUpdate.inspectionFileUrl = selectedDocs['inspectionFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (inspectionFile && inspectionFile.size > 0) {
                if (originalVehicle.inspectionFileUrl)
                    URL.revokeObjectURL(originalVehicle.inspectionFileUrl);
                vehicleDataUpdate.inspectionFile = inspectionFile.name;
                vehicleDataUpdate.inspectionFileUrl = URL.createObjectURL(inspectionFile);
            }
            
            // 🔥 RUHSAT DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['licenseFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['licenseFile'].id);
                if (doc) {
                    vehicleDataUpdate.licenseFile = doc.name;
                    vehicleDataUpdate.licenseFileUrl = selectedDocs['licenseFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (licenseFile && licenseFile.size > 0) {
                if (originalVehicle.licenseFileUrl)
                    URL.revokeObjectURL(originalVehicle.licenseFileUrl);
                vehicleDataUpdate.licenseFile = licenseFile.name;
                vehicleDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
            }
            
            vehiclesData[state.editingVehicleIndex] = Object.assign(Object.assign({}, originalVehicle), vehicleDataUpdate);
        }
        else {
            // Adding new vehicle
            console.log('➕ YENİ ARAÇ EKLEME - selectedDocs:', selectedDocs);
            
            // 🔥 SİGORTA DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['insuranceFile']) {
                console.log('📂 Sigorta dosyası seçilmiş (YENİ), ID:', selectedDocs['insuranceFile'].id);
                const doc = documentsData.find(d => d.id === selectedDocs['insuranceFile'].id);
                console.log('📄 Bulunan doküman (YENİ):', doc);
                if (doc) {
                    vehicleDataUpdate.insuranceFile = doc.name;
                    vehicleDataUpdate.insuranceFileUrl = selectedDocs['insuranceFile'].url; // 🔥 Oluşturulan URL'yi kullan
                    console.log('✅ Sigorta dosyası atandı (YENİ):', doc.name, 'URL:', selectedDocs['insuranceFile'].url);
                } else {
                    console.error('❌ Doküman bulunamadı (YENİ)! ID:', selectedDocs['insuranceFile'].id);
                }
            } else if (insuranceFile && insuranceFile.size > 0) {
                vehicleDataUpdate.insuranceFile = insuranceFile.name;
                vehicleDataUpdate.insuranceFileUrl = URL.createObjectURL(insuranceFile);
            }
            
            // 🔥 MUAYENE DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['inspectionFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['inspectionFile'].id);
                if (doc) {
                    vehicleDataUpdate.inspectionFile = doc.name;
                    vehicleDataUpdate.inspectionFileUrl = selectedDocs['inspectionFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (inspectionFile && inspectionFile.size > 0) {
                vehicleDataUpdate.inspectionFile = inspectionFile.name;
                vehicleDataUpdate.inspectionFileUrl = URL.createObjectURL(inspectionFile);
            }
            
            // 🔥 RUHSAT DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['licenseFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['licenseFile'].id);
                if (doc) {
                    vehicleDataUpdate.licenseFile = doc.name;
                    vehicleDataUpdate.licenseFileUrl = selectedDocs['licenseFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (licenseFile && licenseFile.size > 0) {
                vehicleDataUpdate.licenseFile = licenseFile.name;
                vehicleDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
            }
            
            logActivity('fa-car-side', `<strong>${vehicleDataUpdate.plate}</strong> plakalı yeni araç filoya eklendi.`);
            vehiclesData.unshift(vehicleDataUpdate); // Add to the beginning of the array
        }
        
        // 🔥 SEÇİLEN DOSYALARI TEMİZLE
        state.selectedDocumentsForForm = {};
        
        setState({
            isVehicleModalOpen: false,
            editingVehicleIndex: null,
        });
        showToast(state.editingVehicleIndex !== null ? 'Araç başarıyla güncellendi.' : 'Yeni araç başarıyla eklendi.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleVehicleFormSubmit içinde:", error);
    }
}
function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        const idFile = formData.get('idFile');
        const licenseFile = formData.get('licenseFile');
        
        // 🔥 DOSYALARIMDAN SEÇ - selectedDocumentsForForm kontrolü
        const selectedDocs = state.selectedDocumentsForForm || {};
        
        const customerDataUpdate = {
            name: formData.get('name'),
            tc: formData.get('tc'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            licenseNumber: formData.get('licenseNumber'),
            licenseDate: formData.get('licenseDate'),
            address: formData.get('address'),
        };
        if (state.editingCustomerIndex !== null) {
            // Editing existing customer
            const originalCustomer = customersData[state.editingCustomerIndex];
            
            // 🔥 KİMLİK DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['idFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['idFile'].id);
                if (doc) {
                    customerDataUpdate.idFile = doc.name;
                    customerDataUpdate.idFileUrl = selectedDocs['idFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (idFile && idFile.size > 0) {
                if (originalCustomer.idFileUrl)
                    URL.revokeObjectURL(originalCustomer.idFileUrl);
                customerDataUpdate.idFile = idFile.name;
                customerDataUpdate.idFileUrl = URL.createObjectURL(idFile);
            }
            
            // 🔥 EHLİYET DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['licenseFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['licenseFile'].id);
                if (doc) {
                    customerDataUpdate.licenseFile = doc.name;
                    customerDataUpdate.licenseFileUrl = selectedDocs['licenseFile'].url; // 🔥 Oluşturulan URL'yi kullan
                }
            } else if (licenseFile && licenseFile.size > 0) {
                if (originalCustomer.licenseFileUrl)
                    URL.revokeObjectURL(originalCustomer.licenseFileUrl);
                customerDataUpdate.licenseFile = licenseFile.name;
                customerDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
            }
            
            customersData[state.editingCustomerIndex] = Object.assign(Object.assign({}, originalCustomer), customerDataUpdate);
        }
        else {
            // Adding new customer
            
            // 🔥 KİMLİK DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['idFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['idFile'].id);
                if (doc) {
                    customerDataUpdate.idFile = doc.name;
                    customerDataUpdate.idFileUrl = doc.url;
                }
            } else if (idFile && idFile.size > 0) {
                customerDataUpdate.idFile = idFile.name;
                customerDataUpdate.idFileUrl = URL.createObjectURL(idFile);
            }
            
            // 🔥 EHLİYET DOSYASI - Dosyalarımdan Seç kontrolü
            if (selectedDocs['licenseFile']) {
                const doc = documentsData.find(d => d.id === selectedDocs['licenseFile'].id);
                if (doc) {
                    customerDataUpdate.licenseFile = doc.name;
                    customerDataUpdate.licenseFileUrl = doc.url;
                }
            } else if (licenseFile && licenseFile.size > 0) {
                customerDataUpdate.licenseFile = licenseFile.name;
                customerDataUpdate.licenseFileUrl = URL.createObjectURL(licenseFile);
            }
            
            const newCustomer = Object.assign({ id: Date.now(), rentals: [] }, customerDataUpdate);
            logActivity('fa-user-plus', `<strong>${newCustomer.name}</strong> adında yeni müşteri kaydedildi.`);
            customersData.unshift(newCustomer);
        }
        
        // 🔥 SEÇİLEN DOSYALARI TEMİZLE
        state.selectedDocumentsForForm = {};
        
        setState({
            isCustomerModalOpen: false,
            editingCustomerIndex: null,
        });
        showToast(state.editingCustomerIndex !== null ? 'Müşteri bilgileri güncellendi.' : 'Yeni müşteri başarıyla eklendi.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleCustomerFormSubmit içinde:", error);
    }
}
function handleRentalEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const rentalId = parseInt(formData.get('rentalId'), 10);
    try {
        const rentalIndex = rentalsData.findIndex(r => r.id === rentalId);
        if (rentalIndex === -1)
            return;
        const originalRental = rentalsData[rentalIndex];
        const contractFile = formData.get('contractFile');
        const invoiceFile = formData.get('invoiceFile');
        
        // 🔥 DOSYALARIMDAN SEÇ - selectedDocumentsForForm kontrolü
        const selectedDocs = state.selectedDocumentsForForm || {};
        
        const rentalDataUpdate = {
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null,
            startKm: parseInt(formData.get('startKm'), 10),
            endKm: formData.get('endKm') ? parseInt(formData.get('endKm'), 10) : null,
        };
        
        // 🔥 KONTRAT DOSYASI - Dosyalarımdan Seç kontrolü
        if (selectedDocs['contractFile']) {
            const doc = documentsData.find(d => d.id === selectedDocs['contractFile'].id);
            if (doc) {
                rentalDataUpdate.contractFile = doc.name;
                rentalDataUpdate.contractFileUrl = selectedDocs['contractFile'].url; // 🔥 Oluşturulan URL'yi kullan
            }
        } else if (contractFile && contractFile.size > 0) {
            if (originalRental.contractFileUrl)
                URL.revokeObjectURL(originalRental.contractFileUrl);
            rentalDataUpdate.contractFile = contractFile.name;
            rentalDataUpdate.contractFileUrl = URL.createObjectURL(contractFile);
        }
        
        // 🔥 FATURA DOSYASI - Dosyalarımdan Seç kontrolü
        if (selectedDocs['invoiceFile']) {
            const doc = documentsData.find(d => d.id === selectedDocs['invoiceFile'].id);
            if (doc) {
                rentalDataUpdate.invoiceFile = doc.name;
                rentalDataUpdate.invoiceFileUrl = selectedDocs['invoiceFile'].url; // 🔥 Oluşturulan URL'yi kullan
            }
        } else if (invoiceFile && invoiceFile.size > 0) {
            if (originalRental.invoiceFileUrl)
                URL.revokeObjectURL(originalRental.invoiceFileUrl);
            rentalDataUpdate.invoiceFile = invoiceFile.name;
            rentalDataUpdate.invoiceFileUrl = URL.createObjectURL(invoiceFile);
        }
        
        rentalsData[rentalIndex] = Object.assign(Object.assign({}, originalRental), rentalDataUpdate);
        
        // 🔥 SEÇİLEN DOSYALARI TEMİZLE
        state.selectedDocumentsForForm = {};
        
        setState({ isRentalEditModalOpen: false, editingRentalId: null });
        showToast('Kiralama kaydı güncellendi.', 'success');
    } catch (error) {
        console.error("!!! HATA: handleRentalEditFormSubmit içinde:", error);
    }
}
function handleReservationEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const reservationId = parseInt(formData.get('reservationId'), 10);
    try {
        const resIndex = reservationsData.findIndex(r => r.id === reservationId);
        if (resIndex === -1)
            return;
        const originalReservation = reservationsData[resIndex];
        const updatedReservation = Object.assign(Object.assign({}, originalReservation), { vehiclePlate: formData.get('vehiclePlate'), customerId: parseInt(formData.get('customerId'), 10), startDate: formData.get('startDate'), endDate: formData.get('endDate'), deliveryLocation: formData.get('deliveryLocation'), notes: formData.get('notes') || null });
        reservationsData[resIndex] = updatedReservation;
        setState({ isReservationEditModalOpen: false, editingReservationId: null });
        showToast('Rezervasyon güncellendi.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleReservationEditFormSubmit içinde:", error);
    }
}
function handleReservationFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        let customerId;
        const customerType = formData.get('customerType');
        if (customerType === 'new') {
            const newCustomer = {
                id: Date.now(),
                name: formData.get('newCustomerName'),
                phone: formData.get('newCustomerPhone'),
                tc: '', email: '', address: '', licenseNumber: '', licenseDate: '',
                idFile: null, idFileUrl: null, licenseFile: null, licenseFileUrl: null,
                rentals: [],
            };
            customersData.unshift(newCustomer);
            customerId = newCustomer.id;
        }
        else {
            customerId = parseInt(formData.get('customerId'), 10);
            if (!customersData.some(c => c.id === customerId)) {
                showToast('Lütfen geçerli bir müşteri seçin.', 'error');
                return;
            }
        }
        const vehiclePlate = formData.get('vehiclePlate');
        if (!vehiclesData.some(v => v.plate === vehiclePlate)) {
            showToast('Lütfen geçerli bir araç seçin.', 'error');
            return;
        }
        const newReservation = {
            id: Date.now(),
            vehiclePlate: vehiclePlate,
            customerId: customerId,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            deliveryLocation: formData.get('deliveryLocation'),
            notes: formData.get('notes') || null,
            status: 'active',
        };
        reservationsData.unshift(newReservation);
        setState({ isReservationModalOpen: false });
        showToast('Yeni rezervasyon başarıyla oluşturuldu.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleReservationFormSubmit içinde:", error);
    }
}
function handleRentalFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        let customerId;
        let customerName;
        let customerPhone;
        const customerType = formData.get('customerType');
        if (customerType === 'new') {
            // Create and add new customer
            const newCustomer = {
                id: Date.now(), // Simple unique ID
                name: formData.get('newCustomerName'),
                tc: formData.get('newCustomerTc'),
                phone: formData.get('newCustomerPhone'),
                email: formData.get('newCustomerEmail'),
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
        }
        else {
            // Get existing customer
            customerId = parseInt(formData.get('customerId'), 10);
            const customer = customersData.find(c => c.id === customerId);
            if (!customer) {
                showToast('Lütfen geçerli bir müşteri seçin.', 'error');
                return;
            }
            customerName = customer.name;
            customerPhone = customer.phone;
        }
        // Create new rental record
        const newRental = {
            id: Date.now(),
            vehiclePlate: formData.get('vehiclePlate'),
            customerId: customerId,
            startDate: formData.get('startDate'),
            endDate: null,
            startKm: parseInt(formData.get('startKm').replace(/,/, ''), 10),
            endKm: null,
            price: parseFloat(formData.get('price')),
            priceType: formData.get('priceType'),
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
    }
    catch (error) {
        console.error("!!! HATA: handleRentalFormSubmit içinde:", error);
    }
}
function handleCheckInFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        const rentalId = parseInt(formData.get('rentalId'), 10);
        const returnDate = formData.get('returnDate');
        const returnKm = parseInt(formData.get('returnKm'), 10);
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
        }
        else { // monthly
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
    }
    catch (error) {
        console.error("!!! HATA: handleCheckInFormSubmit içinde:", error);
    }
}
function handleMaintenanceFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
        const newMaintenance = {
            id: Date.now(),
            vehiclePlate: formData.get('vehiclePlate'),
            maintenanceDate: formData.get('maintenanceDate'),
            maintenanceKm: parseInt(formData.get('maintenanceKm'), 10),
            type: formData.get('type'),
            cost: parseFloat(formData.get('cost')),
            description: formData.get('description'),
            nextMaintenanceKm: parseInt(formData.get('nextMaintenanceKm'), 10),
            nextMaintenanceDate: formData.get('nextMaintenanceDate'),
        };
        maintenanceData.unshift(newMaintenance);
        logActivity('fa-oil-can', `<em>${newMaintenance.vehiclePlate}</em> plakalı araca bakım kaydı girildi.`);
        setState({ isMaintenanceModalOpen: false });
        showToast('Bakım kaydı başarıyla oluşturuldu.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleMaintenanceFormSubmit içinde:", error);
    }
}
function handleMaintenanceEditFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const maintenanceId = parseInt(formData.get('maintenanceId'), 10);
    try {
        const maintIndex = maintenanceData.findIndex(m => m.id === maintenanceId);
        if (maintIndex === -1)
            return;
        const originalMaintenance = maintenanceData[maintIndex];
        const updatedMaintenance = Object.assign(Object.assign({}, originalMaintenance), { vehiclePlate: formData.get('vehiclePlate'), maintenanceDate: formData.get('maintenanceDate'), maintenanceKm: parseInt(formData.get('maintenanceKm'), 10), type: formData.get('type'), cost: parseFloat(formData.get('cost')), description: formData.get('description'), nextMaintenanceKm: parseInt(formData.get('nextMaintenanceKm'), 10), nextMaintenanceDate: formData.get('nextMaintenanceDate') });
        maintenanceData[maintIndex] = updatedMaintenance;
        setState({ isMaintenanceEditModalOpen: false, editingMaintenanceId: null });
        showToast('Bakım kaydı güncellendi.', 'success');
    }
    catch (error) {
        console.error("!!! HATA: handleMaintenanceEditFormSubmit içinde:", error);
    }
}
function formatTimeAgo(date) {
    // Güvenli date parse
    if (!date)
        return "Bilinmiyor";
    let parsedDate;
    try {
        parsedDate = date instanceof Date ? date : new Date(date);
        // Invalid date kontrolü
        if (isNaN(parsedDate.getTime())) {
            return "Bilinmiyor";
        }
    }
    catch (e) {
        console.warn('formatTimeAgo: Date parse hatası:', date);
        return "Bilinmiyor";
    }
    const seconds = Math.floor((new Date().getTime() - parsedDate.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1)
        return Math.floor(interval) + " yıl önce";
    interval = seconds / 2592000;
    if (interval > 1)
        return Math.floor(interval) + " ay önce";
    interval = seconds / 86400;
    if (interval > 1)
        return Math.floor(interval) + " gün önce";
    interval = seconds / 3600;
    if (interval > 1)
        return Math.floor(interval) + " saat önce";
    interval = seconds / 60;
    if (interval > 1)
        return Math.floor(interval) + " dakika önce";
    return "az önce";
}
function generateRentalSummaryPDF(rental) {
    try {
        // jsPDF kontrolü
        if (!window.jspdf) {
            showToast("PDF kütüphanesi yüklenemedi. Lütfen sayfayı yenileyin.", "error");
            console.error("jsPDF bulunamadı. window.jspdf:", window.jspdf);
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        // Default font ayarla (built-in Helvetica)
        doc.setFont('helvetica', 'normal');
        const customer = customersData.find(c => c.id === rental.customerId);
        const vehicle = vehiclesData.find(v => v.plate === rental.vehiclePlate);
        const formatDate = (dateInput) => {
            if (!dateInput)
                return 'Belirtilmemiş';
            return new Date(dateInput).toLocaleDateString('tr-TR');
        };
        const formatKm = (km) => km ? km.toLocaleString('tr-TR') : '0';
        const formatPrice = (price) => '₺' + price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            }
            catch (e) {
                console.error("Logo eklenemedi:", e);
            }
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
        const drawCard = (title, iconText, iconBg, contentHeight, drawContent) => {
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
        const drawInfoRow = (label, value, xOffset = 0, isHighlight = false) => {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(textGray[0], textGray[1], textGray[2]);
            doc.text(label, margin + 8 + xOffset, y);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            if (isHighlight) {
                doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            }
            else {
                doc.setTextColor(textDark[0], textDark[1], textDark[2]);
            }
            doc.text(value, margin + 8 + xOffset, y + 5);
            y += 12;
        };
        // ========== ARAÇ BİLGİLERİ CARD ==========
        drawCard('ARAÇ BİLGİLERİ', '🚗', primaryBlue, 60, () => {
            var _a, _b, _c;
            const col2X = contentWidth / 2;
            // Sol kolon
            let tempY = y;
            y = tempY;
            drawInfoRow('MARKA', ((_a = vehicle === null || vehicle === void 0 ? void 0 : vehicle.brand) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || 'N/A', 0, false);
            y = tempY + 12;
            drawInfoRow('MODEL', ((_b = vehicle === null || vehicle === void 0 ? void 0 : vehicle.brand) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || 'N/A', 0, false);
            y = tempY + 24;
            drawInfoRow('YIL', ((_c = vehicle === null || vehicle === void 0 ? void 0 : vehicle.year) === null || _c === void 0 ? void 0 : _c.toString()) || '2023', 0, false);
            // Sağ kolon
            y = tempY;
            drawInfoRow('PLAKA', (vehicle === null || vehicle === void 0 ? void 0 : vehicle.plate) || 'N/A', col2X, true);
            y = tempY + 12;
            drawInfoRow('RENK', (vehicle === null || vehicle === void 0 ? void 0 : vehicle.color) || 'Belirtilmemiş', col2X, false);
            y = tempY + 24;
            drawInfoRow('YAKIT', (vehicle === null || vehicle === void 0 ? void 0 : vehicle.fuelType) || 'Benzin', col2X, false);
            y = tempY + 36;
        });
        // ========== MÜŞTERİ BİLGİLERİ CARD ==========
        drawCard('MÜŞTERİ BİLGİLERİ', '👤', successGreen, 60, () => {
            const col2X = contentWidth / 2;
            let tempY = y;
            y = tempY;
            drawInfoRow('AD SOYAD', (customer === null || customer === void 0 ? void 0 : customer.name) || 'N/A', 0, true);
            y = tempY + 12;
            drawInfoRow('TELEFON', (customer === null || customer === void 0 ? void 0 : customer.phone) || 'N/A', 0, false);
            y = tempY + 24;
            drawInfoRow('E-POSTA', (customer === null || customer === void 0 ? void 0 : customer.email) || 'Belirtilmemiş', 0, false);
            y = tempY;
            drawInfoRow('TC KİMLİK NO', (customer === null || customer === void 0 ? void 0 : customer.tc) || 'N/A', col2X, false);
            y = tempY + 12;
            drawInfoRow('EHLİYET NO', (customer === null || customer === void 0 ? void 0 : customer.licenseNumber) || 'N/A', col2X, false);
            y = tempY + 24;
            drawInfoRow('ADRES', (customer === null || customer === void 0 ? void 0 : customer.address) || 'Belirtilmemiş', col2X, false);
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
            doc.text('Teslim KM', margin + 8 + kmBoxWidth / 2, y + 6, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
            doc.text(formatKm(rental.startKm), margin + 8 + kmBoxWidth / 2, y + 14, { align: 'center' });
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
            doc.text('İade KM', margin + 8 + kmBoxWidth + 16 + kmBoxWidth / 2, y + 6, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentOrange[0], accentOrange[1], accentOrange[2]);
            doc.text(formatKm(rental.endKm), margin + 8 + kmBoxWidth + 16 + kmBoxWidth / 2, y + 14, { align: 'center' });
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
            doc.text('Kullanılan KM', margin + 8 + (kmBoxWidth + 16) * 2 + 16 + kmBoxWidth / 2, y + 6, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(usedKm.toLocaleString('tr-TR'), margin + 8 + (kmBoxWidth + 16) * 2 + 16 + kmBoxWidth / 2, y + 14, { align: 'center' });
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

    // ARAÇ BİLGİLERİ CARD
    drawCard('ARAÇ BİLGİLERİ', '🚗', primaryBlue, 60, () => {
        var _a, _b;
        const col1X = margin + 8;
        const col2X = margin + contentWidth / 2 + 4;
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
        doc.text(((_a = vehicle === null || vehicle === void 0 ? void 0 : vehicle.brand) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || 'N/A', col1X, y);
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
        doc.text(((_b = vehicle === null || vehicle === void 0 ? void 0 : vehicle.brand) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || 'N/A', col2X, y);
        y += 7;
        doc.setFontSize(labelSize);
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'normal');
        doc.text('PLAKA', col2X, y);
        y += 5;
        doc.setFontSize(valueSize);
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'bold');
        doc.text((vehicle === null || vehicle === void 0 ? void 0 : vehicle.plate) || 'N/A', col2X, y);
        y += 3;
    });
    // KİRALAYAN BİLGİLERİ CARD
    drawCard('KİRALAYAN BİLGİLERİ', '👤', successGreen, 60, () => {
        const col1X = margin + 8;
        const col2X = margin + contentWidth / 2 + 4;
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
        doc.text((customer === null || customer === void 0 ? void 0 : customer.name) || 'N/A', col1X, y);
        y += 7;
        doc.setFontSize(labelSize);
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'normal');
        doc.text('TC KİMLİK NO', col1X, y);
        y += 5;
        doc.setFontSize(valueSize);
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'bold');
        doc.text((customer === null || customer === void 0 ? void 0 : customer.tc) || 'N/A', col1X, y);
        y -= 17;
        doc.setFontSize(labelSize);
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'normal');
        doc.text('TELEFON', col2X, y);
        y += 5;
        doc.setFontSize(valueSize);
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'bold');
        doc.text((customer === null || customer === void 0 ? void 0 : customer.phone) || 'N/A', col2X, y);
        y += 7;
        doc.setFontSize(labelSize);
        doc.setTextColor(117, 117, 117);
        doc.setFont('helvetica', 'normal');
        doc.text('EHLİYET NO', col2X, y);
        y += 5;
        doc.setFontSize(valueSize);
        doc.setTextColor(33, 33, 33);
        doc.setFont('helvetica', 'bold');
        doc.text((customer === null || customer === void 0 ? void 0 : customer.licenseNumber) || 'N/A', col2X, y);
        y += 3;
    });
    // KİRALAMA BİLGİLERİ CARD
    drawCard('KİRALAMA BİLGİLERİ', '📋', accentOrange, 95, () => {
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
        const col2X = margin + contentWidth / 2 + 4;
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
        doc.text('Teslim Edilen KM', kmBoxStartX + kmBoxWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(26, 35, 126);
        doc.setFont('helvetica', 'bold');
        doc.text(formatKm(rental.startKm), kmBoxStartX + kmBoxWidth / 2, y + 12, { align: 'center' });
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
        doc.text('Alınan KM', kmBoxStartX + kmBoxWidth + 12 + kmBoxWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(26, 35, 126);
        doc.setFont('helvetica', 'bold');
        doc.text(formatKm(rental.endKm), kmBoxStartX + kmBoxWidth + 12 + kmBoxWidth / 2, y + 12, { align: 'center' });
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
        doc.text('Kullanılan KM', kmBoxStartX + (kmBoxWidth + 12) * 2 + kmBoxWidth / 2, y + 5, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(26, 35, 126);
        doc.setFont('helvetica', 'bold');
        doc.text(usedKm.toLocaleString('tr-TR'), kmBoxStartX + (kmBoxWidth + 12) * 2 + kmBoxWidth / 2, y + 12, { align: 'center' });
        y += 18;
    });
    // FİYATLANDIRMA CARD
    drawCard('FİYATLANDIRMA', '💰', darkBlue, 70, () => {
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

    // PDF'i indir
    const filename = `Kiralama_Ozeti_${rental.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    showToast('PDF başarıyla oluşturuldu!', 'success');
    console.log('✅ PDF oluşturuldu:', filename);

} catch (error) {
    console.error("❌ PDF oluşturma sırasında kritik bir hata oluştu:", error);
    showToast("PDF oluşturulamadı. Lütfen konsolu kontrol edin.", "error");
}
}
/**
 * Ekranda geçici bir bildirim (toast) gösterir.
 * @param message Gösterilecek mesaj.
 * @param type 'success' veya 'error'
 * @param duration Bildirimin ekranda kalma süresi (ms).
 */
function showToast(message, type = 'success', duration = 4000) {
    // 📳 Haptic feedback based on toast type
    if (type === 'success') {
        triggerHaptic('success');
    } else if (type === 'error') {
        triggerHaptic('error');
    } else if (type === 'warning') {
        triggerHaptic('warning');
    }

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
            if (appData.vehiclesData)
                vehiclesData = appData.vehiclesData; // Tarih objesi yok
            if (appData.customersData)
                customersData = appData.customersData; // Tarih objesi yok
            if (appData.maintenanceData)
                maintenanceData = appData.maintenanceData; // Tarih objesi yok
            if (appData.rentalsData) {
                rentalsData = appData.rentalsData.map(r => (Object.assign(Object.assign({}, r), { startDate: new Date(r.startDate), endDate: r.endDate ? new Date(r.endDate) : null })));
            }
            if (appData.reservationsData) {
                reservationsData = appData.reservationsData.map(r => (Object.assign(Object.assign({}, r), { startDate: new Date(r.startDate), endDate: new Date(r.endDate) })));
            }
            // Aktiviteler, JSON'dan yüklenirken Date objesine geri çevrilmeli.
            if (appData.activitiesData && Array.isArray(appData.activitiesData)) {
                activitiesData = appData.activitiesData.map(activity => {
                    if (!activity)
                        return null;
                    try {
                        let parsedDate = new Date();
                        // Önce time, sonra date kontrolü
                        if (activity.time) {
                            parsedDate = new Date(activity.time);
                        }
                        else if (activity.date) {
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
                    }
                    catch (e) {
                        console.error('❌ Aktivite parse hatası:', activity, e);
                        return null;
                    }
                }).filter(Boolean); // Bozuk veya null kayıtları temizle
            }
            
            // ✅ YENİ: Dosyaları yükle ve Blob URL'leri yeniden oluştur
            if (appData.documentsData && Array.isArray(appData.documentsData)) {
                documentsData = appData.documentsData.map(doc => {
                    let newUrl = doc.url;
                    
                    // LocalStorage dosyaları için Blob URL yeniden oluştur
                    if (doc.storageType === 'localStorage' && doc.fileData && doc.fileData.startsWith('data:')) {
                        try {
                            // Base64'ten Blob oluştur
                            const byteString = atob(doc.fileData.split(',')[1]);
                            const mimeString = doc.fileData.split(',')[0].split(':')[1].split(';')[0];
                            const ab = new ArrayBuffer(byteString.length);
                            const ia = new Uint8Array(ab);
                            for (let i = 0; i < byteString.length; i++) {
                                ia[i] = byteString.charCodeAt(i);
                            }
                            const blob = new Blob([ab], { type: mimeString });
                            newUrl = URL.createObjectURL(blob);
                            console.log(`🔗 Blob URL yeniden oluşturuldu: ${doc.name}`);
                        } catch (error) {
                            console.error(`❌ Blob URL oluşturma hatası (${doc.name}):`, error);
                            // Hata durumunda fileData'yı kullan (Base64)
                            newUrl = doc.fileData;
                        }
                    }
                    
                    return {
                        ...doc,
                        url: newUrl,
                        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date()
                    };
                });
                
                console.log(`✅ ${documentsData.length} dosya yüklendi (Blob URL'ler yeniden oluşturuldu)`);
            }
            
            // State'e ait verileri yükle
            if (appData.theme)
                state.theme = appData.theme;
            if (appData.readNotifications)
                state.readNotifications = appData.readNotifications;
            // Ayarları birleştirerek yükle, böylece yeni eklenen ayarlar kaybolmaz
            if (appData.settings) {
                state.settings = Object.assign(Object.assign({}, state.settings), appData.settings);
                state.settings.companyInfo = Object.assign(Object.assign({}, state.settings.companyInfo), appData.settings.companyInfo);
            }
        }
        catch (e) {
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
function autoSyncWithFirebase() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseEnabled) || !((_b = state.settings) === null || _b === void 0 ? void 0 : _b.firebaseAutoSync)) {
            return;
        }
        
        // 🔐 ŞİFRE KONTROLÜ
        const savedPassword = ((_d = state.settings) === null || _d === void 0 ? void 0 : _d.firebaseMasterPassword) || '';
        const correctPassword = '1259';
        
        if (savedPassword !== correctPassword) {
            console.warn('⚠️ Firebase ana şifresi yanlış. Otomatik sync iptal edildi.');
            return;
        }
        
        try {
            // Check if Firebase functions exist
            if (typeof loadDataFromFirebase === 'function' && typeof initializeFirebase === 'function') {
                const config = (_c = state.settings) === null || _c === void 0 ? void 0 : _c.firebaseConfig;
                if ((config === null || config === void 0 ? void 0 : config.apiKey) && (config === null || config === void 0 ? void 0 : config.databaseURL)) {
                    console.log('🔄 Otomatik Firebase senkronizasyonu başlatılıyor...');
                    // Initialize Firebase
                    initializeFirebase(config);
                    // Load data from Firebase
                    const data = yield loadDataFromFirebase();
                    // Update local data if Firebase has data
                    if (data.vehiclesData)
                        vehiclesData = data.vehiclesData;
                    if (data.customersData)
                        customersData = data.customersData;
                    if (data.rentalsData)
                        rentalsData = data.rentalsData;
                    if (data.reservationsData)
                        reservationsData = data.reservationsData;
                    if (data.maintenanceData)
                        maintenanceData = data.maintenanceData;
                    if (data.activitiesData)
                        activitiesData = data.activitiesData;
                    if (data.documentsData)
                        documentsData = data.documentsData; // ✅ Dosyaları da yükle
                    if (data.settings) {
                        state.settings = Object.assign(Object.assign({}, state.settings), data.settings);
                    }
                    // Save to localStorage
                    saveDataToLocalStorage();
                    console.log('✅ Firebase otomatik senkronizasyonu tamamlandı');
                    showToast('Veriler Firebase\'den otomatik güncellendi! 🔄', 'success');
                    // Re-render app with updated data
                    renderApp();
                }
            }
        }
        catch (error) {
            console.error('❌ Otomatik Firebase senkronizasyon hatası:', error);
        }
    });
}
// Sayfa kapatılırken otomatik Firebase yedekleme
function autoBackupToFirebase() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseEnabled) || !((_b = state.settings) === null || _b === void 0 ? void 0 : _b.firebaseAutoSync)) {
            return;
        }
        try {
            // Check if Firebase functions exist
            if (typeof sendDataToFirebase === 'function' && typeof initializeFirebase === 'function') {
                const config = (_c = state.settings) === null || _c === void 0 ? void 0 : _c.firebaseConfig;
                if ((config === null || config === void 0 ? void 0 : config.apiKey) && (config === null || config === void 0 ? void 0 : config.databaseURL)) {
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
                        documentsData, // ✅ Dosyaları da yedekle
                        settings: state.settings,
                    };
                    yield sendDataToFirebase(dataToSend);
                    console.log('✅ Veriler Firebase\'e otomatik yedeklendi');
                }
            }
        }
        catch (error) {
            console.error('❌ Otomatik Firebase yedekleme hatası:', error);
        }
    });
}
// PWA Install Prompt Handler
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.pwaInstallPrompt = e;
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
    }
    else {
        console.log('✅ DOM zaten yüklü, hemen başlatılıyor...');
        initializeApp();
    }
}
function initializeApp() {
    var _a, _b;
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
            return;
        }
        renderApp();
        console.log('✅ Uygulama başarıyla başlatıldı!');
        // 🔥 OTOMATIK FIREBASE SYNC - Uygulama açılırken Firebase'den veri yükle
        if (((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseEnabled) && ((_b = state.settings) === null || _b === void 0 ? void 0 : _b.firebaseAutoSync)) {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _a2;
                console.log('🔄 Otomatik Firebase sync başlatılıyor...');
                
                // 🔐 ŞİFRE KONTROLÜ
                const savedPassword = ((_a2 = state.settings) === null || _a2 === void 0 ? void 0 : _a2.firebaseMasterPassword) || '';
                const correctPassword = '1259';
                
                if (savedPassword !== correctPassword) {
                    console.warn('⚠️ Firebase ana şifresi ayarlanmamış veya yanlış. Otomatik sync iptal edildi.');
                    showToast('⚠️ Firebase şifresi yanlış. Veriler yüklenmedi.', 'warning');
                    return;
                }
                
                try {
                    // Firebase'i başlat
                    if (typeof initializeFirebase === 'function') {
                        yield initializeFirebase((_a = state.settings) === null || _a === void 0 ? void 0 : _a.firebaseConfig);
                    }
                    // Veri çek
                    if (typeof fetchDataFromFirebase === 'function') {
                        const data = yield fetchDataFromFirebase();
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
                                const convertedActivities = data.activitiesData.map((activity) => {
                                    // Date objesini güvenli şekilde parse et
                                    let parsedDate = new Date();
                                    try {
                                        // Önce time, sonra date kontrolü yap
                                        if (activity.time) {
                                            parsedDate = activity.time instanceof Date ? activity.time : new Date(activity.time);
                                        }
                                        else if (activity.date) {
                                            parsedDate = activity.date instanceof Date ? activity.date : new Date(activity.date);
                                        }
                                        // Geçersiz tarih kontrolü
                                        if (isNaN(parsedDate.getTime())) {
                                            parsedDate = new Date();
                                        }
                                    }
                                    catch (e) {
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
                            // ✅ Dosyaları da yükle
                            if (data.documentsData && Array.isArray(data.documentsData)) {
                                documentsData.length = 0;
                                documentsData.push(...data.documentsData);
                            }
                            // Son yükleme saatini güncelle
                            const now = new Date();
                            const timeString = now.toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            });
                            
                            // 🎯 DIRECT STATE UPDATE - Firebase sync after render prevention
                            state.settings = Object.assign(Object.assign({}, state.settings), { 
                                lastSyncDate: data.lastUpdate || new Date().toISOString(), 
                                lastSyncTime: timeString 
                            });
                            
                            // ✅ Single render
                            saveDataToLocalStorage();
                            renderApp();
                            
                            showToast('✅ Firebase verisi yüklendi!', 'success');
                            console.log('✅ Firebase otomatik sync tamamlandı!', {
                                vehicles: vehiclesData.length,
                                customers: customersData.length,
                                time: timeString
                            });
                        }
                    }
                }
                catch (error) {
                    console.error('❌ Otomatik Firebase sync hatası:', error);
                }
            }), 1500); // 1.5 saniye bekle ki Firebase SDK yüklensin
        }

        // 🚀 PWA INSTALL EVENT LISTENERS (Sadece bir kere çalışacak)
        initializePWAEvents();
    }
    catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
    }
}

/**
 * ========================================
 * PWA INSTALL EVENT HANDLERS
 * ========================================
 */

function initializePWAEvents() {
    console.log('🚀 PWA Install event listener\'ları başlatılıyor...');

    // 1️⃣ Standalone mode kontrolü (zaten kuruluysa gösterme)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        console.log('✅ Uygulama zaten standalone modda çalışıyor');
        const installedDiv = document.getElementById('pwa-already-installed');
        const installCard = document.getElementById('pwa-install-card');
        const devMode = document.getElementById('pwa-dev-mode');
        if (installedDiv) installedDiv.style.display = 'block';
        if (installCard) installCard.style.display = 'none';
        if (devMode) devMode.style.display = 'none';
        return;
    }

    // 2️⃣ beforeinstallprompt event (PWA kurulabilir olduğunda tetiklenir)
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎯 beforeinstallprompt event tetiklendi!');

        // Tarayıcının otomatik install prompt'unu engelle
        e.preventDefault();

        // Prompt'u sakla
        deferredPrompt = e;

        // localStorage kontrolü (dismiss edilmiş mi?)
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissTime = localStorage.getItem('pwa-install-dismiss-time');

        if (dismissed === 'true' && dismissTime) {
            const daysPassed = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60 * 24);
            if (daysPassed < 7) {
                console.log('ℹ️ Install prompt gizli (kullanıcı %d gün önce dismiss etti)', Math.floor(daysPassed));
                return;
            } else {
                console.log('⏰ 7 gün geçti, install prompt tekrar gösteriliyor');
                localStorage.removeItem('pwa-install-dismissed');
                localStorage.removeItem('pwa-install-dismiss-time');
            }
        }

        // Dev mode mesajını gizle, install card'ı göster
        const devMode = document.getElementById('pwa-dev-mode');
        const installCard = document.getElementById('pwa-install-card');
        if (devMode) devMode.style.display = 'none';
        if (installCard) {
            installCard.style.display = 'block';
            console.log('✅ PWA install card gösterildi');
        }
    });

    // 3️⃣ appinstalled event (uygulama kurulduğunda tetiklenir)
    window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA başarıyla kuruldu!');
        showToast('Uygulama başarıyla kuruldu! Ana ekranınızdan açabilirsiniz. 🎉', 'success');

        // Install card ve dev mode'u gizle, installed mesajını göster
        const installCard = document.getElementById('pwa-install-card');
        const installedDiv = document.getElementById('pwa-already-installed');
        const devMode = document.getElementById('pwa-dev-mode');
        if (installCard) installCard.style.display = 'none';
        if (devMode) devMode.style.display = 'none';
        if (installedDiv) installedDiv.style.display = 'block';

        // localStorage'ı temizle
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.removeItem('pwa-install-dismiss-time');

        deferredPrompt = null;
    });

    console.log('✅ PWA event listener\'ları hazır');
}

// PWA Install Button Click Handler
async function handlePWAInstallClick() {
    if (!deferredPrompt) {
        showToast('Uygulama zaten kurulu veya tarayıcınız PWA kurulumunu desteklemiyor.', 'info');
        return;
    }

    try {
        // Loading state
        const btn = document.getElementById('pwa-install-button');
        const btnText = document.getElementById('pwa-install-text');
        const btnLoading = document.getElementById('pwa-install-loading');

        if (btn) btn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        console.log('📲 Install prompt gösteriliyor...');

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond
        const result = await deferredPrompt.userChoice;

        if (result.outcome === 'accepted') {
            console.log('✅ Kullanıcı uygulamayı yüklemeyi kabul etti');
            showToast('Uygulama yükleniyor... 🚀', 'success');

            // Hide install card
            const installCard = document.getElementById('pwa-install-card');
            if (installCard) installCard.style.display = 'none';

            // Clear localStorage
            localStorage.removeItem('pwa-install-dismissed');
            localStorage.removeItem('pwa-install-dismiss-time');

        } else {
            console.log('❌ Kullanıcı uygulamayı yüklemeyi reddetti');
            showToast('Yükleme iptal edildi', 'info');
        }

    } catch (error) {
        console.error('❌ Install prompt hatası:', error);
        showToast('Yükleme sırasında bir hata oluştu', 'error');
    } finally {
        // Reset button state
        const btn = document.getElementById('pwa-install-button');
        const btnText = document.getElementById('pwa-install-text');
        const btnLoading = document.getElementById('pwa-install-loading');

        if (btn) btn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';

        // Clear the deferredPrompt
        deferredPrompt = null;
    }
}

// PWA Dismiss Button Click Handler
function handlePWADismissClick() {
    // Hide install card
    const installCard = document.getElementById('pwa-install-card');
    if (installCard) installCard.style.display = 'none';

    // Save to localStorage (7 gün sonra tekrar göster)
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismiss-time', Date.now().toString());

    console.log('ℹ️ Kullanıcı install prompt\'u dismiss etti (7 gün sonra tekrar gösterilecek)');
    showToast('7 gün sonra tekrar hatırlatacağım', 'info');

    // Clear prompt
    deferredPrompt = null;
}

/**
 * ========================================
 * GLOBAL MODAL FONKSİYONLARI
 * ========================================
 */

// Tüm modalları kapat (parametre opsiyonel - eski kod uyumluluğu için)
function closeModal(modalId) {
    console.log('� GLOBAL closeModal() çağrıldı, modalId:', modalId);
    
    // 🎯 DIRECT STATE UPDATE - Bypass setState to prevent re-render loop
    state.selectedVehicleForAction = null;
    state.editingVehicleIndex = null;
    state.editingCustomerIndex = null;
    state.editingRentalId = null;
    state.editingReservationId = null;
    state.editingMaintenanceId = null;
    state.selectedDocument = null;
    state.documentSelectorCallback = null;
    
    if (modalId) {
        // Belirli modal'ı kapat
        switch (modalId) {
            case 'vehicle':
                state.isVehicleModalOpen = false;
                break;
            case 'rental':
                state.isRentalModalOpen = false;
                break;
            case 'customer':
                state.isCustomerModalOpen = false;
                break;
            case 'check-in':
                state.isCheckInModalOpen = false;
                break;
            case 'reservation':
                state.isReservationModalOpen = false;
                break;
            case 'reservation-edit':
                state.isReservationEditModalOpen = false;
                break;
            case 'rental-edit':
                state.isRentalEditModalOpen = false;
                break;
            case 'maintenance':
                state.isMaintenanceModalOpen = false;
                break;
            case 'maintenance-edit':
                state.isMaintenanceEditModalOpen = false;
                break;
            case 'document-upload':
                state.isDocumentUploadModalOpen = false;
                break;
            case 'document-preview':
                state.isDocumentPreviewModalOpen = false;
                break;
            case 'document-selector':
                state.isDocumentSelectorModalOpen = false;
                break;
        }
    } else {
        // Tüm modalları kapat
        state.isVehicleModalOpen = false;
        state.isRentalModalOpen = false;
        state.isCustomerModalOpen = false;
        state.isCheckInModalOpen = false;
        state.isReservationModalOpen = false;
        state.isMaintenanceModalOpen = false;
        state.isMaintenanceEditModalOpen = false;
        state.isRentalEditModalOpen = false;
        state.isReservationEditModalOpen = false;
        state.isDocumentUploadModalOpen = false;
        state.isDocumentPreviewModalOpen = false;
        state.isDocumentSelectorModalOpen = false;
    }
    
    // ✅ Kaydet ama RENDER YAPMA!
    // Document selector gibi callback içinde DOM manipülasyonu yapan modallar için
    // render çağrısı callback işlemi tamamlandıktan sonra yapılmalı
    saveDataToLocalStorage();
    
    // 🎯 Render sadece document-selector DIŞINDA
    if (modalId !== 'document-selector' && !state.isDocumentSelectorModalOpen) {
        renderApp();
    }
}

/**
 * ========================================
 * DOSYA YÖNETİMİ FONKSİYONLARI
 * ========================================
 */

// Kategori açma/kapama
function toggleDocumentCategory(category) {
    const content = document.getElementById(`category-${category}`);
    const header = content.previousElementSibling;
    const chevron = header.querySelector('.category-chevron');
    
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        chevron.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        chevron.style.transform = 'rotate(180deg)';
    }
}

// Dosya yükleme modalını aç
function openDocumentUploadModal() {
    console.log('📤 openDocumentUploadModal() çağrıldı');
    
    // 🎯 Direct state + single render
    state.isDocumentUploadModalOpen = true;
    saveDataToLocalStorage();
    renderApp();
}

// Dosya önizleme modalını aç
function previewDocument(documentId) {
    const document = documentsData.find(doc => doc.id === documentId);
    if (document) {
        console.log('👁️ previewDocument() çağrıldı, ID:', documentId);
        
        // 🎯 Direct state + single render
        state.isDocumentPreviewModalOpen = true;
        state.selectedDocument = documentId;
        saveDataToLocalStorage();
        renderApp();
    }
}

// Dosya indirme
function downloadDocument(documentId) {
    const doc = documentsData.find(d => d.id === documentId);
    if (!doc) {
        showToast('Dosya bulunamadı', 'error');
        return;
    }
    
    const downloadUrl = doc.storageType === 'firebase' ? doc.url : doc.fileData;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.name;
    link.click();
    
    showToast('Dosya indiriliyor...', 'success');
    logActivity('fa-solid fa-download', `Dosya indirildi: ${doc.name}`);
}

// Dosya seçici modal aç (araç/kiralama formlarından çağrılır)
function openDocumentSelectorModal(category, callback) {
    console.log('📂 openDocumentSelectorModal() çağrıldı, category:', category);
    
    // 🎯 Direct state + single render
    state.isDocumentSelectorModalOpen = true;
    state.documentSelectorCategory = category || '';
    state.documentSelectorCallback = callback;
    saveDataToLocalStorage();
    renderApp();
}

// Dosya seçici modal'dan dosya seç VE HEMEN YÜKLE
function selectDocumentFromModal() {
    const selectedRadio = document.querySelector('input[name="selected-document"]:checked');
    if (!selectedRadio) {
        showToast('Lütfen bir dosya seçin', 'error');
        return;
    }

    const documentId = parseInt(selectedRadio.value);
    const doc = documentsData.find(d => d.id === documentId);

    if (doc && state.documentSelectorCallback) {
        console.log('📄 Dosya seçildi ve yükleniyor:', doc.name, 'ID:', doc.id);

        // 🔥 HEMEN YÜKLE - Callback'i çağır
        state.documentSelectorCallback(doc);

        // Modal kapat ve başarı mesajı
        closeModal();
        showToast('Dosya başarıyla yüklendi!', 'success');
    } else {
        console.error('❌ Dosya bulunamadı veya callback yok');
        showToast('Dosya yüklenirken hata oluştu', 'error');
    }
}

// Dosya input change handler
// Yükleme tipi değiştirme
function switchUploadType(type) {
    const singleBtn = document.getElementById('btn-upload-single');
    const folderBtn = document.getElementById('btn-upload-folder');
    const singleUpload = document.getElementById('single-file-upload');
    const folderUpload = document.getElementById('folder-upload');
    
    if (type === 'single') {
        singleBtn?.classList.add('active');
        folderBtn?.classList.remove('active');
        if (singleUpload) singleUpload.style.display = 'block';
        if (folderUpload) folderUpload.style.display = 'none';
    } else {
        singleBtn?.classList.remove('active');
        folderBtn?.classList.add('active');
        if (singleUpload) singleUpload.style.display = 'none';
        if (folderUpload) folderUpload.style.display = 'block';
    }
}

// Klasör seçimi
function handleFolderSelect(event) {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;
    
    console.log(`📁 ${files.length} dosya seçildi`);
    
    // Önizleme göster
    const preview = document.getElementById('doc-file-preview');
    const iconEl = document.getElementById('doc-file-icon');
    const nameEl = document.getElementById('doc-file-name');
    const sizeEl = document.getElementById('doc-file-size');
    
    if (preview && iconEl && nameEl && sizeEl) {
        iconEl.className = 'fa-solid fa-folder';
        nameEl.textContent = `${files.length} dosya seçildi`;
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        sizeEl.textContent = `Toplam: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
        preview.style.display = 'block';
    }
}

// Klasör yükleme işlemi
async function handleFolderUpload(fileList, category, tags) {
    const files = Array.from(fileList);
    const totalFiles = files.length;
    let uploadedFiles = 0;
    let skippedFiles = 0;
    const tagList = Array.isArray(tags) ? tags : parseTagsInput(tags);
    
    try {
        // Progress bar göster
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('upload-progress-fill');
        const progressText = document.getElementById('upload-progress-text');
        const uploadBtn = document.getElementById('btn-upload-document');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (uploadBtn) uploadBtn.disabled = true;
        
        console.log(`📁 ${totalFiles} dosya yüklenecek...`);
        
        // Her dosyayı sırayla yükle
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Sadece desteklenen dosya tiplerini yükle
            const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
            const fileName = file.name.toLowerCase();
            const isValid = validExtensions.some(ext => fileName.endsWith(ext));
            
            if (!isValid) {
                console.warn(`⏭️ Desteklenmeyen dosya: ${file.name}`);
                skippedFiles++;
                continue;
            }
            
            // Dosya boyutu kontrolü (10MB)
            if (file.size > 10 * 1024 * 1024) {
                console.warn(`⏭️ Çok büyük dosya (>10MB): ${file.name}`);
                skippedFiles++;
                continue;
            }
            
            try {
                // Otomatik kategori belirleme (dosya adına göre)
                let autoCategory = category;
                const lowerName = fileName.toLowerCase();
                if (lowerName.includes('sigorta') || lowerName.includes('insurance')) {
                    autoCategory = 'Sigortalar';
                } else if (lowerName.includes('muayene') || lowerName.includes('inspection')) {
                    autoCategory = 'Muayeneler';
                } else if (lowerName.includes('ruhsat') || lowerName.includes('license')) {
                    autoCategory = 'Ruhsatlar';
                } else if (lowerName.includes('fatura') || lowerName.includes('invoice')) {
                    autoCategory = 'Faturalar';
                }
                
                // Dosya tipini belirle
                const fileType = file.type.includes('pdf') ? 'pdf' : 
                                file.type.includes('image') ? 'image' : 'other';
                
                let fileUrl = '';
                let storageType = 'firebase';
                let base64Data = null;
                const documentId = Date.now() + i;
                
                // Firebase Storage'a yükle
                try {
                    if (typeof uploadFileToStorage === 'function') {
                        // Progress callback
                        const progressCallback = (progress) => {
                            console.log(`📤 ${file.name}: ${progress}%`);
                        };
                        
                        // Firebase Storage'a yükle
                        fileUrl = await uploadFileToStorage(file, autoCategory, progressCallback, {
                            docId: documentId,
                            tags: tagList,
                            linkedVehicles: []
                        });
                        console.log(`[upload] Firebase Storage URL: ${fileUrl}`);
                        storageType = 'firebase';
                    } else {
                        throw new Error('uploadFileToStorage fonksiyonu bulunamadı');
                    }
                } catch (uploadError) {
                    console.warn(`⚠️ Firebase Storage yüklenemedi (${file.name}), Base64 kullanılıyor:`, uploadError);
                    
                    // Fallback: Base64 encoding
                    base64Data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    
                    // Blob URL oluştur
                    const blob = new Blob([file], { type: file.type });
                    fileUrl = URL.createObjectURL(blob);
                    storageType = 'localStorage';
                }
                
                // Document objesi oluştur
                const newDocument = {
                    id: documentId, // Unique ID
                    name: file.name,
                    category: autoCategory,
                    type: fileType,
                    storageType: storageType,
                    storagePath: storageType === 'firebase' ? extractStoragePathFromUrl(fileUrl) : null,
                    url: fileUrl,
                    fileData: base64Data, // Firebase'de null, localStorage'da Base64
                    size: file.size,
                    uploadDate: new Date(),
                    linkedVehicles: [],
                    tags: tagList
                };
                
                // Array'e ekle
                documentsData.push(newDocument);
                uploadedFiles++;
                
                console.log(`✅ ${i + 1}/${totalFiles}: ${file.name}`);
                
            } catch (fileError) {
                console.error(`❌ Dosya yükleme hatası (${file.name}):`, fileError);
                skippedFiles++;
            }
            
            // Progress güncelle
            const progress = Math.round(((i + 1) / totalFiles) * 100);
            if (progressFill) progressFill.style.width = progress + '%';
            if (progressText) progressText.textContent = `Yukleniyor... ${i + 1}/${totalFiles} (${progress}%)`;
            
            // Her 5 dosyada bir kısa bekleme (UI donmaması için)
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        // Tamamlandı
        saveDataToLocalStorage();
        closeModal();
        
        showToast(`${uploadedFiles} dosya başarıyla yüklendi! ${skippedFiles > 0 ? `(${skippedFiles} dosya atlandı)` : ''}`, 'success');
        logActivity('fa-solid fa-folder', `${uploadedFiles} dosya toplu yüklendi`);
        
    } catch (error) {
        console.error('!!! HATA: handleFolderUpload içinde:', error);
        showToast('Klasör yükleme hatası: ' + error.message, 'error');
        
        // Progress bar ve button'ı geri al
        const progressContainer = document.getElementById('upload-progress');
        const uploadBtn = document.getElementById('btn-upload-document');
        if (progressContainer) progressContainer.style.display = 'none';
        if (uploadBtn) uploadBtn.disabled = false;
    }
}

function handleDocumentFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Dosya boyutu 10MB\'dan büyük olamaz', 'error');
        event.target.value = '';
        return;
    }
    
    // Önizleme göster
    const preview = document.getElementById('doc-file-preview');
    const iconEl = document.getElementById('doc-file-icon');
    const nameEl = document.getElementById('doc-file-name');
    const sizeEl = document.getElementById('doc-file-size');
    
    if (preview && iconEl && nameEl && sizeEl) {
        const fileType = file.type;
        if (fileType.includes('pdf')) {
            iconEl.className = 'fa-solid fa-file-pdf';
        } else if (fileType.includes('image')) {
            iconEl.className = 'fa-solid fa-file-image';
        } else {
            iconEl.className = 'fa-solid fa-file';
        }
        
        nameEl.textContent = file.name;
        sizeEl.textContent = formatFileSize(file.size);
        preview.style.display = 'block';
    }
}

// Dosya boyutu formatlama
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function extractStoragePathFromUrl(url) {
    if (!url) return null;
    try {
        const decoded = decodeURIComponent(url);
        const match = decoded.match(/\/o\/(.*?)(?:\?|$)/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (error) {
        console.warn('Storage URL parse edilemedi:', error);
    }
    return null;
}

function parseTagsInput(rawTags) {
    if (!rawTags) return [];
    if (Array.isArray(rawTags)) {
        return rawTags
            .map(tag => String(tag).trim())
            .filter(tag => tag.length > 0);
    }
    return String(rawTags)
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

// Dosya sil
async function deleteDocument(documentId) {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    const docIndex = documentsData.findIndex(doc => doc.id === documentId);
    if (docIndex !== -1) {
        const doc = documentsData[docIndex];
        
        // Firebase Storage'dan sil (eğer Firebase'de ise)
        if (doc.storageType === 'firebaseStorage' && doc.url) {
            try {
                if (typeof deleteFileFromStorage === 'function') {
                    await deleteFileFromStorage(doc.url);
                    console.log('✅ Dosya Firebase Storage\'dan silindi');
                } else {
                    console.warn('⚠️ deleteFileFromStorage fonksiyonu bulunamadı');
                }
            } catch (err) {
                console.error('❌ Firebase Storage silme hatası:', err);
                // Devam et, en azından metadata'dan sil
            }
        }
        
        // Array'den sil
        documentsData.splice(docIndex, 1);
        
        // Sadece kaydet - renderApp() GEREKSİZ
        saveDataToLocalStorage();
        
        showToast('Dosya silindi', 'success');
        logActivity('fa-solid fa-trash', `Dosya silindi: ${doc.name}`);
    }
}

// Dosya yükleme form submit handler
async function handleDocumentUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const category = formData.get('category');
    const file = formData.get('file');
    const folder = form.querySelector('#doc-folder');
    const tags = parseTagsInput(formData.get('tags'));
    
    // Klasör mü yoksa tek dosya mı?
    const isFolder = folder && folder.files && folder.files.length > 0;
    
    console.log('📋 Form submit debug:', {
        category,
        hasFile: !!file,
        hasFolder: !!folder,
        folderFilesCount: folder?.files?.length || 0,
        isFolder
    });
    
    if (!category) {
        showToast('Lütfen kategori seçin', 'error');
        return;
    }
    
    if (!isFolder && !file) {
        showToast('Lütfen dosya veya klasör seçin', 'error');
        return;
    }
    
    // Klasör yükleme
    if (isFolder) {
        console.log(`📁 Klasör yükleme başlatılıyor: ${folder.files.length} dosya`);
        await handleFolderUpload(folder.files, category, tags);
        return;
    }
    
    try {
        // Progress bar göster
        const progressContainer = document.getElementById('upload-progress');
        const progressFill = document.getElementById('upload-progress-fill');
        const progressText = document.getElementById('upload-progress-text');
        const uploadBtn = document.getElementById('btn-upload-document');
        
        if (progressContainer) progressContainer.style.display = 'block';
        if (uploadBtn) uploadBtn.disabled = true;
        
        // Dosya tipini belirle
        const fileType = file.type.includes('pdf') ? 'pdf' :
                        file.type.includes('image') ? 'image' : 'other';

        // Unique ID oluştur
        const documentId = 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        let fileUrl = '';
        let storageType = 'firebase';
        let fileData = null;
        
        // 🚀 OPTIMIZE: Sadece Firebase Storage kullan (localStorage fallback kaldırıldı)
        try {
            if (typeof uploadFileToStorage === 'function') {
                fileUrl = await uploadFileToStorage(file, category, (progress) => {
                    // Progress callback
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = `Yukleniyor... ${progress}%`;
                });
                console.log('✅ Firebase Storage URL:', fileUrl);
                storageType = 'firebaseStorage'; // Doğru storageType
            } else {
                throw new Error('uploadFileToStorage fonksiyonu bulunamadı! Firebase ayarlarını kontrol edin.');
            }
        } catch (uploadError) {
            // ❌ Firebase başarısız - localStorage kullanma (quota hatası önlenir)
            console.error('❌ Firebase Storage yükleme başarısız:', uploadError);
            showToast('Dosya yüklenemedi! Firebase Storage yapılandırmasını kontrol edin.', 'error');

            // Progress bar ve button'ı geri al
            if (progressContainer) progressContainer.style.display = 'none';
            if (uploadBtn) uploadBtn.disabled = false;
            return; // Yüklemeyi iptal et
        }
        
        // Yeni document objesi oluştur (🚀 OPTIMIZE: fileData ekleme - sadece metadata)
        const newDocument = {
            id: documentId,
            name: file.name,
            category: category,
            type: fileType,
            storageType: storageType,
            storagePath: storageType === 'firebaseStorage' ? `documents/${category}/${file.name}` : null,
            url: fileUrl, // URL her zaman dolu
            // ❌ fileData ekleme - localStorage quota sorununa neden olur!
            size: file.size,
            uploadDate: new Date(),
            linkedVehicles: [],
            tags: tags
        };
        
        // Array'e ekle
        documentsData.push(newDocument);

        // 🚀 HEM localStorage HEM Firebase'e kaydet!
        saveDataToLocalStorage();

        // 🔥 Firebase'e otomatik gönder (eğer sync aktifse)
        if (typeof sendDataToFirebase === 'function' && state.settings?.firebaseSync?.enabled) {
            console.log('🔄 Otomatik Firebase sync başlatılıyor...');
            sendDataToFirebase({
                vehiclesData,
                customersData,
                rentalsData,
                reservationsData,
                maintenanceData,
                activitiesData,
                documentsData, // ✅ Yeni dosya dahil
                settings: state.settings
            }).then(() => {
                console.log('✅ Dosya metadata Firebase\'e kaydedildi!');
            }).catch(err => {
                console.error('❌ Firebase sync hatası:', err);
            });
        }

        closeModal();

        showToast('Dosya başarıyla yüklendi ve Firebase\'e kaydedildi!', 'success');
        logActivity('fa-solid fa-cloud-arrow-up', `Yeni dosya yüklendi: ${file.name}`);
        
    } catch (error) {
        console.error('!!! HATA: handleDocumentUpload içinde:', error);
        showToast('Dosya yükleme hatası: ' + error.message, 'error');
        
        // Progress bar ve button'ı geri al
        const progressContainer = document.getElementById('upload-progress');
        const uploadBtn = document.getElementById('btn-upload-document');
        if (progressContainer) progressContainer.style.display = 'none';
        if (uploadBtn) uploadBtn.disabled = false;
    }
}

// ============================================
// GLOBAL FONKSİYONLAR - INLINE ONCLICK İÇİN
// ============================================

// Kategori toggle (accordion)
window.toggleDocumentCategory = function(category) {
    const content = document.getElementById(`category-${category}`);
    const header = content?.previousElementSibling;
    
    if (content && header) {
        const isOpen = content.classList.contains('open');
        
        if (isOpen) {
            content.classList.remove('open');
        } else {
            content.classList.add('open');
        }
        
        const chevron = header.querySelector('.category-chevron');
        if (chevron) {
            chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }
};

// Dosya önizleme modal aç
window.previewDocument = function(documentId) {
    const document = documentsData.find(doc => doc.id === documentId);
    if (document) {
        console.log('👁️ window.previewDocument() çağrıldı, ID:', documentId);
        
        // 🎯 Direct state + single render - DUPLICATE REMOVED
        state.isDocumentPreviewModalOpen = true;
        state.selectedDocument = documentId;
        saveDataToLocalStorage();
        renderApp();
    }
};

// Dosya sil
window.deleteDocument = function(documentId) {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    const doc = documentsData.find(d => d.id === documentId);
    if (!doc) return;
    
    // Firebase'den sil
    if (doc.storageType === 'firebase' && typeof deleteDocumentFromStorage === 'function') {
        deleteDocumentFromStorage(doc.url)
            .then(() => {
                // Array'den çıkar
                const index = documentsData.findIndex(d => d.id === documentId);
                if (index > -1) {
                    documentsData.splice(index, 1);
                }
                
                // closeModal() zaten saveDataToLocalStorage() çağırır - renderApp() GEREKSİZ
                closeModal(); // Preview modal'ı kapat
                
                showToast('Dosya başarıyla silindi', 'success');
                logActivity('fa-solid fa-trash', `Dosya silindi: ${doc.name}`);
            })
            .catch(error => {
                console.error('Dosya silme hatası:', error);
                showToast('Dosya silinemedi: ' + error.message, 'error');
            });
    } else {
        // LocalStorage'dan sil
        const index = documentsData.findIndex(d => d.id === documentId);
        if (index > -1) {
            documentsData.splice(index, 1);
        }
        
        // closeModal() zaten saveDataToLocalStorage() çağırır - renderApp() GEREKSİZ
        closeModal(); // Preview modal'ı kapat
        
        showToast('Dosya başarıyla silindi', 'success');
        logActivity('fa-solid fa-trash', `Dosya silindi: ${doc.name}`);
    }
};

// Dosya seçici modal aç (inline onclick için)
window.openDocumentSelectorModal = function(category, callback) {
    console.log('📂 window.openDocumentSelectorModal() çağrıldı, category:', category);
    
    // 🎯 Direct state + single render
    state.isDocumentSelectorModalOpen = true;
    state.documentSelectorCategory = category || '';
    state.documentSelectorCallback = callback;
    saveDataToLocalStorage();
    renderApp();
};

// Dosya yükleme modal aç (inline onclick için)
window.openDocumentUploadModal = function() {
    console.log('📤 window.openDocumentUploadModal() çağrıldı');
    
    // 🎯 Direct state + single render
    state.isDocumentUploadModalOpen = true;
    saveDataToLocalStorage();
    renderApp();
};
