import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-card-dark border-t-8 border-primary pt-24 pb-12 px-6 md:px-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-16 mb-24">
                    <div className="col-span-2">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-charcoal shadow-lg rotate-3 hover:rotate-0 transition-transform">
                                <span className="material-symbols-outlined text-3xl font-black">bolt</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">KIX</h2>
                        </div>
                        <p className="text-charcoal/60 dark:text-white/60 text-lg font-medium max-w-sm mb-10 leading-relaxed">The next generation of e-commerce UI design. Empowering streetwear brands with AI-driven experiences and vibrant aesthetics.</p>
                        <div className="flex gap-4">
                            {['alternate_email', 'share', 'public'].map(icon => (
                                <div key={icon} className="size-12 rounded-xl border-2 border-charcoal dark:border-white/30 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-charcoal transition-all cursor-pointer group">
                                    <span className="material-symbols-outlined font-black group-hover:scale-110">{icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary bg-charcoal inline-block px-3 py-1">Shop</h4>
                        <ul className="space-y-4 text-sm font-black uppercase italic tracking-tighter">
                            {['New Arrivals', 'Best Sellers', 'Exclusives', 'Sale'].map(item => (
                                <li key={item}><a className="hover:text-primary transition-colors" href="#">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary bg-charcoal inline-block px-3 py-1">Company</h4>
                        <ul className="space-y-4 text-sm font-black uppercase italic tracking-tighter">
                            {['Our Story', 'Careers', 'Sustainability', 'Legal'].map(item => (
                                <li key={item}><a className="hover:text-primary transition-colors" href="#">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-primary bg-charcoal inline-block px-3 py-1">Support</h4>
                        <ul className="space-y-4 text-sm font-black uppercase italic tracking-tighter">
                            {['Help Center', 'Shipping', 'Returns', 'Contact Us'].map(item => (
                                <li key={item}><a className="hover:text-primary transition-colors" href="#">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t-2 border-charcoal/10 dark:border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">© 2024 Streetwear Lab. Crafted for the culture.</p>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Cookies</a>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-background-alt dark:bg-charcoal rounded-full">
                        <span className="material-symbols-outlined text-sm text-primary">globe</span>
                        <span className="text-[10px] font-black uppercase">English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
