import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StoreSidebar from '../components/StoreSidebar';
import { fadeInLeft, fadeInRight, staggerContainer, staggerItem, pageTransition } from '../utils/animations';
import { storeApi } from '../services/storeApi';
import { Store } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DISTRICT_NAMES: Record<string, string> = {
    'hai-chau': 'Hải Châu',
    'son-tra': 'Sơn Trà',
    'ngu-hanh-son': 'Ngũ Hành Sơn',
    'thanh-khe': 'Thanh Khê',
    'lien-chieu': 'Liên Chiểu',
};

const KNOWN_DISTRICTS = Object.values(DISTRICT_NAMES);

const extractDistrict = (address: string): string => {
    const found = KNOWN_DISTRICTS.find(d => address.includes(d));
    return found ? `${found}, Đà Nẵng` : 'Đà Nẵng';
};

type StoreStatusType = 'open' | 'closing-soon' | 'closed';
interface StoreStatus { label: string; type: StoreStatusType; }

const getStoreStatus = (hours?: string): StoreStatus => {
    if (!hours) return { label: 'Không rõ', type: 'closed' };
    const match = hours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return { label: 'Không rõ', type: 'closed' };
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const open = parseInt(match[1]) * 60 + parseInt(match[2]);
    const close = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (cur < open || cur >= close) return { label: 'Đã đóng cửa', type: 'closed' };
    if (close - cur <= 60) return { label: 'Sắp đóng cửa', type: 'closing-soon' };
    return { label: 'Đang mở cửa', type: 'open' };
};

const isOpenLate = (hours?: string): boolean => {
    if (!hours) return false;
    const match = hours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return false;
    const closeHour = parseInt(match[3]);
    return closeHour >= 22 || closeHour < 6;
};

const isOpenWeekend = (_hours?: string): boolean => {
    // Stores in Da Nang typically open every day including weekends
    // If hours exist, assume the store operates on weekends
    return !!_hours;
};

const STATUS_STYLE: Record<StoreStatusType, { dot: string; text: string; bg: string }> = {
    'open':          { dot: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/30' },
    'closing-soon':  { dot: 'bg-amber-400',  text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/30' },
    'closed':        { dot: 'bg-red-500',    text: 'text-red-500   dark:text-red-400',    bg: 'bg-red-50   dark:bg-red-900/30'   },
};

const StatusBadge: React.FC<{ hours?: string; inverted?: boolean }> = ({ hours, inverted }) => {
    const { label, type } = getStoreStatus(hours);
    const s = STATUS_STYLE[type];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inverted ? 'bg-white/20 backdrop-blur-sm ' + s.text : s.bg + ' ' + s.text}`}>
            <span className={`size-2 rounded-full flex-shrink-0 ${s.dot} ${type === 'open' ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    );
};

// ─── Leaflet config ──────────────────────────────────────────────────────────

const DA_NANG_CENTER: [number, number] = [16.0544, 108.2022];

const storeIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const featuredIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
    html: '<div style="width:18px;height:18px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: '',
});

// Helper component to recenter the map with smooth fly animation
const RecenterMap: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom ?? map.getZoom(), { duration: 1.2 });
    }, [center, zoom, map]);
    return null;
};

const openDirections = (store: Store, userLocation: { lat: number; lng: number } | null) => {
    const dest = store.lat && store.lng
        ? `${store.lat},${store.lng}`
        : encodeURIComponent(store.address);
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`
        : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, '_blank');
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const StoresPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [storeSearch, setStoreSearch] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [openNow, setOpenNow] = useState(false);
    const [lateNight, setLateNight] = useState(false);
    const [weekend, setWeekend] = useState(false);

    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // GPS / Map state
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DA_NANG_CENTER);
    const [mapZoom, setMapZoom] = useState(13);

    // Selected store (for map focus)
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    // Mobile sidebar
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Notification modal
    const [notifyModalOpen, setNotifyModalOpen] = useState(false);
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notifySubmitted, setNotifySubmitted] = useState(false);

    // Sort by distance
    const [sortByDistance, setSortByDistance] = useState(false);

    const mapSectionRef = useRef<HTMLElement>(null);

    // ─── GPS ──────────────────────────────────────────────────────────────────
    const requestGPS = useCallback(() => {
        if (!navigator.geolocation) {
            setGpsError('Trình duyệt không hỗ trợ GPS.');
            return;
        }
        setGpsLoading(true);
        setGpsError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setGpsLoading(false);
                setMapCenter([loc.lat, loc.lng]);
                setMapZoom(14);
                setSortByDistance(true);
            },
            (err) => {
                setGpsError(
                    err.code === 1
                        ? 'Bạn đã từ chối quyền truy cập vị trí.'
                        : 'Không thể lấy vị trí hiện tại.'
                );
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Focus map on a store when clicking a card
    const focusStore = useCallback((store: Store) => {
        if (store.lat && store.lng) {
            setMapCenter([store.lat, store.lng]);
            setMapZoom(16);
            setSelectedStoreId(store.id);
            mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // "Gần tôi nhất" sidebar button handler
    const handleNearMe = useCallback(() => {
        if (userLocation) {
            setSortByDistance(true);
            setMapCenter([userLocation.lat, userLocation.lng]);
            setMapZoom(14);
        } else {
            requestGPS();
        }
    }, [userLocation, requestGPS]);

    // Tick mỗi phút để status badge tự cập nhật
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(n => n + 1), 60_000);
        return () => clearInterval(id);
    }, []);

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    // Apply theme
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Fetch stores from API
    useEffect(() => {
        setLoading(true);
        setError(null);
        storeApi.getAll({ limit: 100 })
            .then(res => {
                if (res.success) {
                    setStores(res.data ?? []);
                } else {
                    setError(res.message || 'Không thể tải dữ liệu cửa hàng.');
                }
            })
            .catch(() => setError('Không thể kết nối đến máy chủ.'))
            .finally(() => setLoading(false));
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const handleAISearch = (e?: React.FormEvent) => { e?.preventDefault(); };
    const handleReset = () => {
        setStoreSearch('');
        setSelectedDistrict('all');
        setSelectedFeatures([]);
        setOpenNow(false);
        setLateNight(false);
        setWeekend(false);
        setSortByDistance(false);
        setSelectedStoreId(null);
        setMapCenter(DA_NANG_CENTER);
        setMapZoom(13);
    };

    // ─── Filter logic ──────────────────────────────────────────────────────────
    const filteredStores = stores.filter((store) => {
        if (storeSearch.trim()) {
            const q = storeSearch.toLowerCase();
            if (!store.name.toLowerCase().includes(q) && !store.address.toLowerCase().includes(q)) return false;
        }
        if (selectedDistrict !== 'all') {
            const districtName = DISTRICT_NAMES[selectedDistrict];
            if (!store.address.toLowerCase().includes(districtName.toLowerCase())) return false;
        }
        if (selectedFeatures.length > 0) {
            if (!selectedFeatures.some(f => (store.features ?? []).includes(f))) return false;
        }
        if (openNow) {
            if (getStoreStatus(store.hours).type === 'closed') return false;
        }
        if (lateNight) {
            if (!isOpenLate(store.hours)) return false;
        }
        if (weekend) {
            if (!isOpenWeekend(store.hours)) return false;
        }
        return true;
    });

    const openCount = stores.filter(s => getStoreStatus(s.hours).type !== 'closed').length;

    // Tính khoảng cách từ user đến store (km) bằng Haversine
    const getDistance = (storeLat?: number, storeLng?: number): number | null => {
        if (!userLocation || !storeLat || !storeLng) return null;
        const R = 6371;
        const dLat = ((storeLat - userLocation.lat) * Math.PI) / 180;
        const dLng = ((storeLng - userLocation.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((userLocation.lat * Math.PI) / 180) *
            Math.cos((storeLat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Sort stores by distance when GPS active and sortByDistance enabled
    const sortedStores = sortByDistance && userLocation
        ? [...filteredStores].sort((a, b) => (getDistance(a.lat, a.lng) ?? Infinity) - (getDistance(b.lat, b.lng) ?? Infinity))
        : filteredStores;

    const nearestStore = userLocation
        ? [...stores].filter(s => s.lat && s.lng).sort((a, b) => (getDistance(a.lat, a.lng) ?? Infinity) - (getDistance(b.lat, b.lng) ?? Infinity))[0] ?? stores[0] ?? null
        : stores.find(s => s.featured) ?? stores[0] ?? null;
    const nearestDistance = nearestStore ? getDistance(nearestStore.lat, nearestStore.lng) : null;

    // Notification submit handler
    const handleNotifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifyEmail.trim()) return;
        setNotifySubmitted(true);
        setTimeout(() => {
            setNotifyModalOpen(false);
            setNotifyEmail('');
            setTimeout(() => setNotifySubmitted(false), 300);
        }, 2000);
    };

    return (
        <motion.div
            className="min-h-screen bg-background-light dark:bg-background-dark"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
        >
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleAISearch={handleAISearch}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                isHomePage={false}
            />

            <div className="flex pt-16">
                {/* Desktop sidebar */}
                <StoreSidebar
                    searchQuery={storeSearch}
                    setSearchQuery={setStoreSearch}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedFeatures={selectedFeatures}
                    setSelectedFeatures={setSelectedFeatures}
                    stores={stores}
                    openNow={openNow}
                    setOpenNow={setOpenNow}
                    openCount={openCount}
                    onReset={handleReset}
                    lateNight={lateNight}
                    setLateNight={setLateNight}
                    weekend={weekend}
                    setWeekend={setWeekend}
                    onNearMe={handleNearMe}
                    gpsLoading={gpsLoading}
                    userLocation={userLocation}
                />

                {/* Mobile sidebar overlay */}
                <AnimatePresence>
                    {mobileSidebarOpen && (
                        <>
                            <motion.div
                                className="fixed inset-0 bg-black/50 z-[2000] lg:hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileSidebarOpen(false)}
                            />
                            <motion.aside
                                className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark overflow-y-auto z-[2001] p-6 lg:hidden"
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-lg uppercase tracking-widest">Bộ Lọc</h3>
                                    <button
                                        onClick={() => setMobileSidebarOpen(false)}
                                        className="size-10 rounded-full bg-gray-100 dark:bg-charcoal flex items-center justify-center hover:bg-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <StoreSidebar
                                    searchQuery={storeSearch}
                                    setSearchQuery={setStoreSearch}
                                    selectedDistrict={selectedDistrict}
                                    setSelectedDistrict={(d) => { setSelectedDistrict(d); }}
                                    selectedFeatures={selectedFeatures}
                                    setSelectedFeatures={setSelectedFeatures}
                                    stores={stores}
                                    openNow={openNow}
                                    setOpenNow={setOpenNow}
                                    openCount={openCount}
                                    onReset={handleReset}
                                    lateNight={lateNight}
                                    setLateNight={setLateNight}
                                    weekend={weekend}
                                    setWeekend={setWeekend}
                                    onNearMe={handleNearMe}
                                    gpsLoading={gpsLoading}
                                    userLocation={userLocation}
                                    isMobile
                                />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                <main className="flex-1 lg:ml-72">
                    {/* Map Section — Leaflet + OpenStreetMap */}
                    <section ref={mapSectionRef} className="relative w-full h-[50vh] bg-background-alt dark:bg-charcoal overflow-hidden border-b border-border-light dark:border-border-dark scroll-mt-16">
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            scrollWheelZoom={true}
                            style={{ width: '100%', height: '100%' }}
                            zoomControl={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url={isDarkMode
                                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                }
                            />
                            <RecenterMap center={mapCenter} zoom={mapZoom} />

                            {/* Store markers */}
                            {filteredStores.filter(s => s.lat && s.lng).map(store => (
                                <Marker
                                    key={store.id}
                                    position={[store.lat!, store.lng!]}
                                    icon={selectedStoreId === store.id ? selectedIcon : store.featured ? featuredIcon : storeIcon}
                                >
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <h4 className="font-black text-sm uppercase mb-1">{store.name}</h4>
                                            <p className="text-xs text-gray-600 mb-1">{store.address}</p>
                                            {store.hours && <p className="text-xs text-gray-500 mb-1">{store.hours}</p>}
                                            {store.phone && (
                                                <p className="text-xs text-gray-500 mb-2">
                                                    <span className="font-bold">SĐT:</span> {store.phone}
                                                </p>
                                            )}
                                            {userLocation && store.lat && store.lng && (
                                                <p className="text-xs text-blue-600 font-bold mb-2">
                                                    {(() => {
                                                        const d = getDistance(store.lat, store.lng);
                                                        if (d == null) return null;
                                                        return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
                                                    })()}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openDirections(store, userLocation)}
                                                    className="flex-1 py-1.5 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition-colors"
                                                >
                                                    Chỉ Đường
                                                </button>
                                                {store.phone && (
                                                    <a
                                                        href={`tel:${store.phone}`}
                                                        className="py-1.5 px-3 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors flex items-center"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">call</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* User location marker */}
                            {userLocation && (
                                <Marker
                                    position={[userLocation.lat, userLocation.lng]}
                                    icon={userIcon}
                                >
                                    <Popup>
                                        <span className="font-bold text-sm">Vị trí của bạn</span>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {/* GPS button overlay */}
                        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
                            <motion.button
                                className={`flex items-center gap-2 px-4 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                                    userLocation
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white dark:bg-charcoal text-charcoal dark:text-white hover:bg-primary hover:text-charcoal'
                                } ${gpsLoading ? 'opacity-70 pointer-events-none' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={requestGPS}
                            >
                                <span className={`material-symbols-outlined text-lg ${gpsLoading ? 'animate-spin' : ''}`}>
                                    {gpsLoading ? 'progress_activity' : userLocation ? 'my_location' : 'location_searching'}
                                </span>
                                {gpsLoading ? 'Đang xác định...' : userLocation ? 'Đã xác định vị trí' : 'Vị trí của tôi'}
                            </motion.button>
                            {gpsError && (
                                <p className="text-xs font-bold text-red-500 bg-white/90 dark:bg-charcoal/90 px-3 py-1.5 rounded-lg shadow">
                                    {gpsError}
                                </p>
                            )}
                        </div>

                        {/* Title overlay */}
                        <motion.div
                            className="absolute top-6 left-6 z-[1000]"
                            variants={fadeInLeft}
                            initial="initial"
                            animate="animate"
                        >
                            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none drop-shadow-lg">
                                Khám Phá <br />
                                <span className="text-primary bg-charcoal px-4">Đà Nẵng</span>
                            </h1>
                        </motion.div>

                        {nearestStore && (
                            <motion.div
                                className="absolute bottom-4 right-4 z-[1000] hidden md:block"
                                variants={fadeInRight}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: 0.3 }}
                            >
                                <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-2xl max-w-xs">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Cửa Hàng Gần Nhất</p>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-lg uppercase">{nearestStore.name}</h3>
                                        <StatusBadge hours={nearestStore.hours} />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{nearestStore.address}</p>
                                    {nearestDistance != null && (
                                        <p className="text-xs font-bold text-blue-500 mb-3">
                                            <span className="material-symbols-outlined text-xs align-middle mr-1">straighten</span>
                                            {nearestDistance < 1
                                                ? `${Math.round(nearestDistance * 1000)} m`
                                                : `${nearestDistance.toFixed(1)} km`}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <motion.button
                                            className="flex-1 bg-primary text-charcoal py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => openDirections(nearestStore, userLocation)}
                                        >
                                            Chỉ Đường
                                        </motion.button>
                                        {nearestStore.phone && (
                                            <motion.a
                                                href={`tel:${nearestStore.phone}`}
                                                className="bg-charcoal dark:bg-white text-white dark:text-charcoal py-2.5 px-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-charcoal transition-all flex items-center gap-1"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span className="material-symbols-outlined text-sm">call</span>
                                            </motion.a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </section>

                    {/* Stores Grid Section */}
                    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Cửa Hàng Tại Đà Nẵng</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    {loading ? 'Đang tải...' : `${filteredStores.length} cửa hàng${sortByDistance && userLocation ? ' · Sắp xếp theo khoảng cách' : ''} · Không gian dành cho cộng đồng sneakerhead.`}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                {/* Mobile filter button */}
                                <button
                                    onClick={() => setMobileSidebarOpen(true)}
                                    className="size-12 rounded-full border-2 border-charcoal dark:border-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all lg:hidden"
                                >
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                                {/* Sort by distance toggle */}
                                {userLocation && (
                                    <button
                                        onClick={() => setSortByDistance(!sortByDistance)}
                                        className={`size-12 rounded-full border-2 flex items-center justify-center transition-all ${
                                            sortByDistance
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'border-charcoal dark:border-white hover:bg-primary hover:border-primary'
                                        }`}
                                        title={sortByDistance ? 'Tắt sắp xếp theo khoảng cách' : 'Sắp xếp theo khoảng cách'}
                                    >
                                        <span className="material-symbols-outlined">sort</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-charcoal dark:bg-primary text-white dark:text-charcoal rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all"
                                >
                                    Xem Tất Cả
                                </button>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <span className="material-symbols-outlined text-6xl text-red-400">wifi_off</span>
                                <p className="font-black text-xl uppercase">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-primary text-charcoal rounded-full font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
                                >
                                    Thử Lại
                                </button>
                            </div>
                        )}

                        {/* Loading Skeletons */}
                        {loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`${i % 3 === 1 ? 'xl:mt-12' : ''}`}>
                                        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark p-4 animate-pulse">
                                            <div className="aspect-[4/3] rounded-[2rem] bg-gray-200 dark:bg-charcoal mb-6" />
                                            <div className="px-4 pb-4 space-y-3">
                                                <div className="h-7 bg-gray-200 dark:bg-charcoal rounded-xl w-3/4" />
                                                <div className="h-4 bg-gray-100 dark:bg-charcoal/60 rounded-xl w-1/2" />
                                                <div className="h-4 bg-gray-100 dark:bg-charcoal/60 rounded-xl w-2/3 mt-4" />
                                                <div className="h-4 bg-gray-100 dark:bg-charcoal/60 rounded-xl w-full" />
                                                <div className="h-14 bg-gray-200 dark:bg-charcoal rounded-2xl mt-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredStores.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <span className="material-symbols-outlined text-6xl opacity-30">store_off</span>
                                <p className="font-black text-xl uppercase opacity-50">Không tìm thấy cửa hàng</p>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-primary text-charcoal rounded-full font-black text-xs uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}

                        {/* Stores Grid */}
                        {!loading && !error && sortedStores.length > 0 && (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                {sortedStores.map((store, index) => {
                                    const dist = getDistance(store.lat, store.lng);
                                    return (
                                    <motion.div
                                        key={store.id}
                                        className={`group cursor-pointer ${index % 3 === 1 ? 'xl:mt-12' : ''} ${selectedStoreId === store.id ? 'ring-4 ring-primary rounded-[2.5rem]' : ''}`}
                                        variants={staggerItem}
                                        initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? 1 : -1 }}
                                        animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? 1 : -1 }}
                                        whileHover={{ rotate: 0, y: -10 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        onClick={() => focusStore(store)}
                                    >
                                        {store.featured ? (
                                            /* Featured Store Card */
                                            <div className="bg-charcoal dark:bg-primary rounded-[2.5rem] p-4 shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-0">
                                                <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 relative">
                                                    {store.image ? (
                                                        <img
                                                            alt={store.name}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                            src={store.image}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-700 dark:bg-charcoal flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-6xl opacity-30 text-white">store</span>
                                                        </div>
                                                    )}
                                                    {/* Status badge — top right */}
                                                    <div className="absolute top-4 right-4">
                                                        <StatusBadge hours={store.hours} inverted />
                                                    </div>
                                                    {store.badge && (
                                                        <div className="absolute bottom-4 left-4">
                                                            <span className="bg-white/20 backdrop-blur-md text-white dark:text-charcoal px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                                {store.badge}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-4 pb-4 text-white dark:text-charcoal">
                                                    <div className="mb-6">
                                                        <h3 className="text-3xl font-black uppercase italic leading-tight text-primary dark:text-charcoal">{store.name}</h3>
                                                        <p className="text-sm font-bold opacity-50 uppercase tracking-widest">{extractDistrict(store.address)}</p>
                                                    </div>
                                                    <div className="space-y-3 mb-8">
                                                        {store.hours && (
                                                            <div className="flex items-center gap-3 text-sm font-medium opacity-70">
                                                                <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">schedule</span>
                                                                <span>{store.hours}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 text-sm font-medium opacity-70">
                                                            <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">pin_drop</span>
                                                            <span>{store.address}</span>
                                                        </div>
                                                        {store.phone && (
                                                            <div className="flex items-center gap-3 text-sm font-medium opacity-70">
                                                                <span className="material-symbols-outlined text-primary dark:text-charcoal text-lg">call</span>
                                                                <span>{store.phone}</span>
                                                            </div>
                                                        )}
                                                        {dist != null && (
                                                            <div className="flex items-center gap-3 text-sm font-bold text-blue-400">
                                                                <span className="material-symbols-outlined text-blue-400 text-lg">straighten</span>
                                                                <span>{dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDirections(store, userLocation); }}
                                                            className="flex-1 py-4 bg-white dark:bg-charcoal text-charcoal dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-primary dark:hover:bg-primary hover:text-charcoal transition-all flex items-center justify-center gap-2"
                                                        >
                                                            Chỉ Đường
                                                            <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                                        </button>
                                                        {store.phone && (
                                                            <a
                                                                href={`tel:${store.phone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="py-4 px-5 bg-white/20 backdrop-blur-sm rounded-2xl font-black text-xs shadow-lg hover:bg-white hover:text-charcoal transition-all flex items-center justify-center"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">call</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Regular Store Card */
                                            <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark p-4 shadow-sm hover:shadow-2xl transition-all duration-500 hover:rotate-0">
                                                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                                    {store.image ? (
                                                        <img
                                                            alt={store.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            src={store.image}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 dark:bg-charcoal flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-6xl opacity-20">store</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {/* Status badge — top right */}
                                                    <div className="absolute top-4 right-4">
                                                        <StatusBadge hours={store.hours} inverted />
                                                    </div>
                                                    {store.badge && (
                                                        <div className="absolute top-4 left-4 bg-primary text-charcoal px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            {store.badge}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-4 pb-4">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <h3 className="text-2xl font-black uppercase italic leading-tight">{store.name}</h3>
                                                            <p className="text-sm font-bold opacity-40 uppercase tracking-widest">{extractDistrict(store.address)}</p>
                                                        </div>
                                                        <div className="size-12 bg-background-alt dark:bg-charcoal rounded-2xl flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-primary">bolt</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 mb-8">
                                                        {store.hours && (
                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                                                                <span>{store.hours}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            <span className="material-symbols-outlined text-primary text-lg">pin_drop</span>
                                                            <span>{store.address}</span>
                                                        </div>
                                                        {store.phone && (
                                                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                <span className="material-symbols-outlined text-primary text-lg">call</span>
                                                                <span>{store.phone}</span>
                                                            </div>
                                                        )}
                                                        {dist != null && (
                                                            <div className="flex items-center gap-3 text-sm font-bold text-blue-500">
                                                                <span className="material-symbols-outlined text-blue-500 text-lg">straighten</span>
                                                                <span>{dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openDirections(store, userLocation); }}
                                                            className="flex-1 py-4 bg-primary text-charcoal rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-charcoal hover:text-white transition-all flex items-center justify-center gap-2"
                                                        >
                                                            Chỉ Đường
                                                            <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                                        </button>
                                                        {store.phone && (
                                                            <a
                                                                href={`tel:${store.phone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="py-4 px-5 bg-charcoal dark:bg-white/10 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-primary hover:text-charcoal transition-all flex items-center justify-center"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">call</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}

                        {/* Experience Center Section */}
                        <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7 bg-primary rounded-[4rem] p-12 relative overflow-hidden group">
                                <div className="absolute -right-20 -bottom-20 size-80 bg-white/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <span className="inline-block px-4 py-1 bg-charcoal text-white text-[10px] font-black uppercase tracking-widest mb-6 rounded-sm">
                                        Trung Tâm Trải Nghiệm
                                    </span>
                                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8 text-charcoal">
                                        KHÔNG CHỈ LÀ <br />CỬA HÀNG.
                                    </h2>
                                    <p className="text-xl font-bold text-charcoal/70 mb-10 max-w-md">
                                        Các cửa hàng của chúng tôi có DJ booth, phòng customization và các đợt raffle giới hạn. Tham gia cùng cộng đồng.
                                    </p>
                                    <div className="flex gap-4 flex-wrap">
                                        <button
                                            onClick={() => {
                                                setSelectedFeatures(['custom-lab', 'dj-booth', 'raffle']);
                                                mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                            className="px-8 py-4 bg-charcoal text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                                        >
                                            Lịch Sự Kiện
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedFeatures(['vip']);
                                                mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }}
                                            className="px-8 py-4 bg-white/30 backdrop-blur-sm text-charcoal border-2 border-charcoal/20 rounded-full font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                                        >
                                            VIP Access
                                        </button>
                                    </div>
                                </div>
                                <img
                                    alt="Sneaker Graphic"
                                    className="absolute right-0 bottom-0 w-2/3 object-contain pointer-events-none opacity-20 group-hover:rotate-12 transition-transform duration-1000"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20"
                                />
                            </div>

                            <div className="lg:col-span-5 space-y-8">
                                <div className="bg-background-alt dark:bg-card-dark p-10 rounded-[3rem] border-4 border-primary/20 rotate-1 hover:rotate-0 transition-transform">
                                    <h4 className="font-black text-2xl uppercase mb-4">Hội An Heritage Store</h4>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                                        Cửa hàng mới nhất của chúng tôi, kết hợp văn hóa phố cổ với streetwear hiện đại.
                                    </p>
                                    <div className="flex -space-x-4">
                                        <div className="size-12 rounded-full border-4 border-white dark:border-charcoal bg-gray-200 dark:bg-charcoal overflow-hidden">
                                            <img alt="User" className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzL-N7MSKs0QB-0Los94sXBHV0EJohFfa12fdalxqMrgLFY294cmrTOM47D0zXC0GSMq6tRG76LwwrcuJI19Q2AxaDJvb_a38TzvWdibM6ULrXVBl-8L0vOq5bbBVpdKqMh0HNa81tTEtHvj6a5q-SE7SzzfEQvYZvVGJdGmAmqsMJdQQEHWKltpj6J-_V7TX4x0sEsLmvAhqqrb8-KxPNjMRBVJDLE0BBcVJjsY2LZkc9i9pFJ6ZMAfibXTQiys5rOa_Q8bOtps0"
                                            />
                                        </div>
                                        <div className="size-12 rounded-full border-4 border-white dark:border-charcoal bg-primary flex items-center justify-center font-black text-xs text-charcoal">
                                            +2k
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-charcoal dark:bg-primary text-white dark:text-charcoal p-8 rounded-[2.5rem] -rotate-1 hover:rotate-0 transition-transform">
                                    <p className="text-primary dark:text-charcoal font-black uppercase tracking-widest text-xs mb-2">Sắp Khai Trương</p>
                                    <h4 className="text-2xl font-black uppercase mb-4 italic leading-tight">Bà Nà Hills Experience</h4>
                                    <p className="text-sm font-medium opacity-60 mb-6">
                                        Trải nghiệm mua sắm độc đáo tại độ cao 1.500m với view tuyệt đẹp.
                                    </p>
                                    <button
                                        onClick={() => setNotifyModalOpen(true)}
                                        className="text-primary dark:text-charcoal font-black uppercase tracking-widest text-xs underline underline-offset-8 hover:opacity-70 transition-opacity"
                                    >
                                        Đăng Ký Nhận Thông Báo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Footer />
                </main>
            </div>

            {/* Notification Modal */}
            <AnimatePresence>
                {notifyModalOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setNotifyModalOpen(false); setNotifyEmail(''); setNotifySubmitted(false); }}
                        />
                        <motion.div
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3001] w-[90vw] max-w-md"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-2xl border border-border-light dark:border-border-dark">
                                {notifySubmitted ? (
                                    <div className="text-center py-6">
                                        <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                                        <h3 className="text-2xl font-black uppercase mb-2">Đã Đăng Ký!</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Chúng tôi sẽ thông báo cho bạn khi cửa hàng Bà Nà Hills khai trương.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Sắp Khai Trương</p>
                                                <h3 className="text-xl font-black uppercase">Bà Nà Hills Experience</h3>
                                            </div>
                                            <button
                                                onClick={() => { setNotifyModalOpen(false); setNotifyEmail(''); }}
                                                className="size-10 rounded-full bg-gray-100 dark:bg-charcoal flex items-center justify-center hover:bg-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            Nhập email của bạn để nhận thông báo khi cửa hàng khai trương cùng các ưu đãi đặc biệt dành riêng cho bạn.
                                        </p>
                                        <form onSubmit={handleNotifySubmit} className="space-y-4">
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">mail</span>
                                                <input
                                                    type="email"
                                                    required
                                                    value={notifyEmail}
                                                    onChange={(e) => setNotifyEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-charcoal rounded-xl text-sm font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-primary text-charcoal rounded-xl font-black uppercase tracking-widest text-xs hover:bg-charcoal hover:text-white transition-all"
                                            >
                                                Đăng Ký Nhận Thông Báo
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StoresPage;
