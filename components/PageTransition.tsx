import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

// Page transition overlay component
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Listen for navigation events
        const handleNavigation = () => {
            setIsTransitioning(true);
            setTimeout(() => setIsTransitioning(false), 400);
        };

        // Trigger on initial load
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);

        window.addEventListener('pageTransition', handleNavigation);
        return () => window.removeEventListener('pageTransition', handleNavigation);
    }, []);

    return (
        <>
            {/* Transition Overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <>
                        {/* Primary green swoosh */}
                        <motion.div
                            className="fixed inset-0 z-[9999] bg-primary origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0, originX: 1 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.76, 0, 0.24, 1]
                            }}
                        />
                        {/* Dark background swoosh */}
                        <motion.div
                            className="fixed inset-0 z-[9998] bg-charcoal origin-left"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0, originX: 1 }}
                            transition={{
                                duration: 0.25,
                                ease: [0.76, 0, 0.24, 1],
                                delay: 0.05
                            }}
                        />
                        {/* Logo in center during transition */}
                        <motion.div
                            className="fixed inset-0 z-[10000] flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.15, delay: 0.1 }}
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="size-14 bg-charcoal rounded-2xl flex items-center justify-center shadow-2xl"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <span className="material-symbols-outlined text-primary text-3xl font-black">bolt</span>
                                </motion.div>
                                <motion.h1
                                    className="text-3xl font-black text-charcoal uppercase italic tracking-tighter"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.15 }}
                                >
                                    KIX
                                </motion.h1>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Page Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
            >
                {children}
            </motion.div>
        </>
    );
};

// Custom navigation function that triggers transition
export const navigateWithTransition = (href: string) => {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pageTransition'));

    // Wait for animation then navigate
    setTimeout(() => {
        // Use pushState for SPA-style navigation
        window.history.pushState({}, '', href);
        // Dispatch event to notify App component
        window.dispatchEvent(new CustomEvent('navigationComplete'));
    }, 250);
};

export default PageTransition;
