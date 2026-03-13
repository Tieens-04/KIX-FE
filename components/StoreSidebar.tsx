import React from 'react';
import { Store } from '../types';

interface StoreSidebarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
    selectedFeatures: string[];
    setSelectedFeatures: (features: string[]) => void;
    stores: Store[];
    openNow: boolean;
    setOpenNow: (v: boolean) => void;
    openCount: number;
    onReset: () => void;
    lateNight?: boolean;
    setLateNight?: (v: boolean) => void;
    weekend?: boolean;
    setWeekend?: (v: boolean) => void;
    onNearMe?: () => void;
    gpsLoading?: boolean;
    userLocation?: { lat: number; lng: number } | null;
    isMobile?: boolean;
}

const DISTRICTS = [
    { id: 'all',          name: 'Tất cả',       slug: null },
    { id: 'hai-chau',     name: 'Hải Châu',     slug: 'Hải Châu' },
    { id: 'son-tra',      name: 'Sơn Trà',      slug: 'Sơn Trà' },
    { id: 'ngu-hanh-son', name: 'Ngũ Hành Sơn', slug: 'Ngũ Hành Sơn' },
    { id: 'thanh-khe',    name: 'Thanh Khê',    slug: 'Thanh Khê' },
    { id: 'lien-chieu',   name: 'Liên Chiểu',   slug: 'Liên Chiểu' },
];

const STORE_FEATURES = [
    { id: 'custom-lab', name: 'Customization Lab', icon: 'brush' },
    { id: 'dj-booth',   name: 'DJ Booth',          icon: 'music_note' },
    { id: 'raffle',     name: 'Limited Raffles',   icon: 'confirmation_number' },
    { id: 'cafe',       name: 'Sneaker Café',      icon: 'local_cafe' },
    { id: 'vip',        name: 'VIP Lounge',        icon: 'diamond' },
];

const StoreSidebar: React.FC<StoreSidebarProps> = ({
    searchQuery,
    setSearchQuery,
    selectedDistrict,
    setSelectedDistrict,
    selectedFeatures,
    setSelectedFeatures,
    stores,
    openNow,
    setOpenNow,
    openCount,
    onReset,
    lateNight = false,
    setLateNight,
    weekend = false,
    setWeekend,
    onNearMe,
    gpsLoading = false,
    userLocation,
    isMobile = false,
}) => {
    const toggleFeature = (featureId: string) => {
        if (selectedFeatures.includes(featureId)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== featureId));
        } else {
            setSelectedFeatures([...selectedFeatures, featureId]);
        }
    };

    const getDistrictCount = (slug: string | null) => {
        if (!slug) return stores.length;
        return stores.filter(s => s.address.toLowerCase().includes(slug.toLowerCase())).length;
    };

    const content = (
        <div className="space-y-8">

            {/* Search Stores */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Tìm Kiếm</h4>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên, địa chỉ..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-charcoal border-none rounded-xl text-sm font-medium placeholder:text-charcoal/30 dark:placeholder:text-white/30 focus:ring-2 focus:ring-primary outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Districts Filter */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Quận / Huyện</h4>
                <div className="space-y-2">
                    {DISTRICTS.map((district) => (
                        <button
                            key={district.id}
                            onClick={() => setSelectedDistrict(district.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                selectedDistrict === district.id
                                    ? 'bg-primary/10 border border-primary/30 text-primary'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest">{district.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                selectedDistrict === district.id
                                    ? 'bg-primary text-charcoal'
                                    : 'bg-gray-100 dark:bg-charcoal'
                            }`}>
                                {getDistrictCount(district.slug)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Store Features */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Tiện Ích Cửa Hàng</h4>
                <div className="space-y-2">
                    {STORE_FEATURES.map((feature) => (
                        <label
                            key={feature.id}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature.id)}
                                onChange={() => toggleFeature(feature.id)}
                                className="w-5 h-5 rounded border-2 border-gray-200 dark:border-border-dark text-primary focus:ring-primary"
                            />
                            <span className="material-symbols-outlined text-lg text-primary">{feature.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                                {feature.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Operating Hours / Live Status */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Giờ Hoạt Động</h4>
                <div className="space-y-2">
                    {/* Đang mở cửa — toggleable */}
                    <button
                        onClick={() => setOpenNow(!openNow)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            openNow
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-400/40'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-lg ${openNow ? 'text-green-500' : 'opacity-60'}`}>
                            schedule
                        </span>
                        <span className={`text-xs font-black uppercase tracking-widest flex-1 text-left ${
                            openNow ? 'text-green-600 dark:text-green-400' : ''
                        }`}>
                            Đang mở cửa
                        </span>
                        {/* Live dot + count */}
                        <span className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${openNow ? 'bg-green-500 animate-pulse' : 'bg-green-500/40'}`} />
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                openNow ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-charcoal'
                            }`}>
                                {openCount}
                            </span>
                        </span>
                    </button>

                    {/* Mở đến khuya — toggleable */}
                    <button
                        onClick={() => setLateNight?.(!lateNight)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            lateNight
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-400/40'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-lg ${lateNight ? 'text-indigo-500' : 'opacity-40'}`}>nights_stay</span>
                        <span className={`text-xs font-black uppercase tracking-widest flex-1 text-left ${
                            lateNight ? 'text-indigo-600 dark:text-indigo-400' : ''
                        }`}>
                            Mở đến khuya
                        </span>
                    </button>

                    {/* Mở cuối tuần — toggleable */}
                    <button
                        onClick={() => setWeekend?.(!weekend)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            weekend
                                ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-400/40'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-lg ${weekend ? 'text-orange-500' : 'opacity-40'}`}>weekend</span>
                        <span className={`text-xs font-black uppercase tracking-widest flex-1 text-left ${
                            weekend ? 'text-orange-600 dark:text-orange-400' : ''
                        }`}>
                            Mở cuối tuần
                        </span>
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <button
                    onClick={onNearMe}
                    disabled={gpsLoading}
                    className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 ${
                        userLocation
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-charcoal dark:bg-primary text-white dark:text-charcoal hover:bg-primary hover:text-charcoal dark:hover:bg-white'
                    } ${gpsLoading ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    <span className={`material-symbols-outlined text-sm ${gpsLoading ? 'animate-spin' : ''}`}>
                        {gpsLoading ? 'progress_activity' : 'my_location'}
                    </span>
                    {gpsLoading ? 'Đang xác định...' : userLocation ? 'Sắp xếp gần nhất' : 'Gần tôi nhất'}
                </button>
                <button
                    onClick={onReset}
                    className="w-full py-3 border-2 border-charcoal dark:border-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Đặt lại bộ lọc
                </button>
            </div>

        </div>
    );

    // In mobile mode, render just the content (wrapper is handled by parent)
    if (isMobile) {
        return <>{content}</>;
    }

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark overflow-y-auto hidden lg:flex flex-col p-6">
            {content}
        </aside>
    );
};

export default StoreSidebar;
