import React, { useState } from 'react';

interface StoreSidebarProps {
    selectedDistrict: string;
    setSelectedDistrict: (district: string) => void;
    selectedFeatures: string[];
    setSelectedFeatures: (features: string[]) => void;
}

const DISTRICTS = [
    { id: 'all', name: 'Tất cả', count: 6 },
    { id: 'hai-chau', name: 'Hải Châu', count: 2 },
    { id: 'son-tra', name: 'Sơn Trà', count: 1 },
    { id: 'ngu-hanh-son', name: 'Ngũ Hành Sơn', count: 1 },
    { id: 'thanh-khe', name: 'Thanh Khê', count: 1 },
    { id: 'lien-chieu', name: 'Liên Chiểu', count: 1 },
];

const STORE_FEATURES = [
    { id: 'custom-lab', name: 'Customization Lab', icon: 'brush' },
    { id: 'dj-booth', name: 'DJ Booth', icon: 'music_note' },
    { id: 'raffle', name: 'Limited Raffles', icon: 'confirmation_number' },
    { id: 'cafe', name: 'Sneaker Café', icon: 'local_cafe' },
    { id: 'vip', name: 'VIP Lounge', icon: 'diamond' },
];

const StoreSidebar: React.FC<StoreSidebarProps> = ({
    selectedDistrict,
    setSelectedDistrict,
    selectedFeatures,
    setSelectedFeatures,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFeature = (featureId: string) => {
        if (selectedFeatures.includes(featureId)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== featureId));
        } else {
            setSelectedFeatures([...selectedFeatures, featureId]);
        }
    };

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-card-dark border-r border-border-light dark:border-border-dark overflow-y-auto hidden lg:flex flex-col p-6">
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
                            placeholder="Tìm cửa hàng..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-charcoal border-none rounded-xl text-sm font-medium placeholder:text-charcoal/30 dark:placeholder:text-white/30 focus:ring-2 focus:ring-primary"
                        />
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
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedDistrict === district.id
                                        ? 'bg-primary/10 border border-primary/30 text-primary'
                                        : 'hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">{district.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${selectedDistrict === district.id
                                        ? 'bg-primary text-charcoal'
                                        : 'bg-gray-100 dark:bg-charcoal'
                                    }`}>
                                    {district.count}
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

                {/* Operating Hours */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-charcoal/40 dark:text-white/40">Giờ Hoạt Động</h4>
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Đang mở cửa</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <span className="material-symbols-outlined text-lg opacity-40">nights_stay</span>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Mở đến khuya</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <span className="material-symbols-outlined text-lg opacity-40">weekend</span>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Mở cuối tuần</span>
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <button className="w-full py-4 bg-charcoal dark:bg-primary text-white dark:text-charcoal text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-charcoal dark:hover:bg-white transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">my_location</span>
                        Gần tôi nhất
                    </button>
                    <button className="w-full py-3 border-2 border-charcoal dark:border-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-charcoal hover:text-white dark:hover:bg-white dark:hover:text-charcoal transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Đặt lại bộ lọc
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default StoreSidebar;
