import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample chat messages
const SAMPLE_MESSAGES = [
    { id: 1, role: 'assistant', content: 'Hello! I\'m your KIX Admin AI Assistant. How can I help you manage your stores today?', timestamp: '10:24 AM' },
    { id: 2, role: 'user', content: 'What\'s the performance of our NYC store?', timestamp: '10:25 AM' },
    { id: 3, role: 'assistant', content: 'The **NYC Flagship store** is performing excellently! Here are the key metrics:\n\n📊 **Performance:** 92%\n💰 **Revenue:** 7.112.500K VND (this month)\n🛍️ **Sales:** 1,247 transactions\n👔 **Manager:** John Smith\n\nIt\'s your top-performing location. Would you like detailed analytics?', timestamp: '10:25 AM' },
    { id: 4, role: 'user', content: 'How about inventory alerts?', timestamp: '10:26 AM' },
    { id: 5, role: 'assistant', content: 'I found **18 low stock alerts** across your network:\n\n⚠️ **NYC** - Dunk Low Pro (12 units)\n⚠️ **Tokyo** - Onitsuka Tiger (0 units - sold out)\n⚠️ **Paris** - Stan Smith (7 units)\n\nWould you like me to prepare a restock order?', timestamp: '10:26 AM' },
];

const QUICK_ACTIONS = [
    { icon: 'analytics', label: 'Store Analytics', query: 'Show me analytics for all stores' },
    { icon: 'inventory', label: 'Inventory Status', query: 'What\'s the inventory status?' },
    { icon: 'trending_up', label: 'Sales Report', query: 'Generate sales report for this week' },
    { icon: 'warning', label: 'Alerts', query: 'Show me all alerts and issues' },
];

const AdminAIChatbox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(SAMPLE_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut: Ctrl/Cmd + K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            // ESC to close
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: messages.length + 1,
            role: 'user' as const,
            content: inputValue,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                role: 'assistant' as const,
                content: `I understand you're asking about "${inputValue}". Let me help you with that!\n\nBased on your query, here's what I found:\n\n✅ All systems are operational\n📊 Data is up to date\n🔔 No critical alerts\n\nIs there anything specific you'd like me to analyze?`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuickAction = (query: string) => {
        setInputValue(query);
        setTimeout(() => handleSend(), 100);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 size-14 bg-primary text-charcoal rounded-full shadow-2xl flex items-center justify-center z-40 border-2 border-charcoal"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <span className="material-symbols-outlined text-2xl font-black">
                    {isOpen ? 'close' : 'smart_toy'}
                </span>
                {!isOpen && (
                    <motion.div
                        className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full border-2 border-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                )}
            </motion.button>

            {/* Chatbox Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-28 right-8 w-[450px] h-[650px] bg-white rounded-3xl shadow-2xl border-4 border-charcoal z-40 flex flex-col overflow-hidden"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        {/* Header */}
                        <div className="bg-charcoal text-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-charcoal font-black">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="font-black uppercase italic text-sm">KIX AI Assistant</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold opacity-50 uppercase">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-white/10 rounded-lg">
                                    <kbd className="text-[9px] font-black">⌘K</kbd>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="size-8 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 bg-background-alt border-b border-border-light">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-2">
                                {QUICK_ACTIONS.map((action) => (
                                    <motion.button
                                        key={action.label}
                                        onClick={() => handleQuickAction(action.query)}
                                        className="flex items-center gap-2 p-2 bg-white border border-border-light rounded-xl hover:bg-primary hover:border-charcoal transition-all text-left"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-sm text-primary">{action.icon}</span>
                                        <span className="text-[10px] font-black uppercase">{action.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background-alt/30">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                        <div
                                            className={`p-3 rounded-2xl ${message.role === 'user'
                                                    ? 'bg-primary text-charcoal rounded-tr-none'
                                                    : 'bg-white border border-border-light rounded-tl-none'
                                                }`}
                                        >
                                            <p className="text-sm font-bold whitespace-pre-line">{message.content}</p>
                                        </div>
                                        <p className={`text-[9px] font-bold opacity-40 uppercase mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {message.timestamp}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div
                                    className="flex justify-start"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="bg-white border border-border-light px-4 py-3 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="size-2 bg-primary rounded-full"
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t-2 border-charcoal">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything about your stores..."
                                    className="flex-1 px-4 py-3 bg-background-alt border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary"
                                />
                                <motion.button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="size-12 bg-primary text-charcoal rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                                    whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
                                    whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
                                >
                                    <span className="material-symbols-outlined font-black">send</span>
                                </motion.button>
                            </div>
                            <p className="text-[9px] font-bold opacity-30 uppercase text-center mt-2">
                                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘K</kbd> to toggle • <kbd className="px-1 py-0.5 bg-gray-100 rounded">ESC</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminAIChatbox;
