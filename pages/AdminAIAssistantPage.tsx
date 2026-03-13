import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

// Sample chat messages
const INITIAL_MESSAGES = [
    { id: 1, role: 'assistant' as const, content: 'Hello! I\'m your **KIX Admin AI Assistant**. I can help you with:\n\n📊 Store analytics and performance\n📦 Inventory management\n💰 Sales reports and forecasts\n👥 Customer insights\n⚙️ System configuration\n\nHow can I assist you today?', timestamp: '10:24 AM' },
];

const QUICK_PROMPTS = [
    { icon: 'analytics', label: 'Store Performance', query: 'Show me the performance overview of all stores', category: 'Analytics' },
    { icon: 'inventory', label: 'Low Stock Items', query: 'Which products need restocking?', category: 'Inventory' },
    { icon: 'trending_up', label: 'Sales Trends', query: 'What are the sales trends this month?', category: 'Sales' },
    { icon: 'person', label: 'Top Customers', query: 'Who are our top 5 customers?', category: 'Customers' },
    { icon: 'warning', label: 'Critical Alerts', query: 'Show me all critical alerts and issues', category: 'System' },
    { icon: 'local_shipping', label: 'Pending Orders', query: 'How many orders are pending shipment?', category: 'Orders' },
    { icon: 'payments', label: 'Revenue Report', query: 'Generate a revenue report for this week', category: 'Finance' },
    { icon: 'lightbulb', label: 'AI Insights', query: 'Give me AI-powered insights and recommendations', category: 'AI' },
];

const SAMPLE_RESPONSES: Record<string, string> = {
    'performance': '📊 **Store Performance Overview**\n\n**Top Performer:** NYC Flagship\n- Performance: 92%\n- Revenue: 7.112.500K VND\n- Sales: 1,247 transactions\n\n**Good Performance:**\n- London: 85% (3.920.000K VND)\n- LA Downtown: 78% (4.955.000K VND)\n\n**Needs Attention:**\n- Tokyo: 68% (3.557.500K VND)\n- Paris: 45% (Maintenance)\n\n💡 Recommendation: Focus on improving Tokyo operations.',
    'stock': '📦 **Low Stock Alert**\n\n**Critical (0 units):**\n- Tokyo: Onitsuka Tiger\n- NYC: Yeezy Boost 350\n\n**Low Stock (<10 units):**\n- NYC: Dunk Low Pro (12)\n- Paris: Stan Smith (7)\n- London: Old Skool (3)\n\n✅ Restock orders recommended for 5 SKUs',
    'sales': '📈 **Sales Trends Analysis**\n\n**This Month:**\n- Total Sales: 3,703 transactions\n- Growth: +18.2% vs last month\n- Best Day: Saturday (2.125.000K VND)\n\n**Top Products:**\n1. VaporMax Flyknit (342 sales)\n2. Air Jordan 1 High (289 sales)\n3. Dunk Low Retro (256 sales)\n\n🚀 Trend: Streetwear category up 25%',
    'customers': '👥 **Top 5 VIP Customers**\n\n1. **Marcus Johnson**\n   - 23 orders | 113.025.000 VND spent\n\n2. **Alex Thompson**\n   - 15 orders | 71.175.000 VND spent\n\n3. **Olivia Martinez**\n   - 12 orders | 46.900.000 VND spent\n\n4. **Sarah Chen**\n   - 8 orders | 31.125.000 VND spent\n\n5. **Emily Rodriguez**\n   - 3 orders | 9.725.000 VND spent\n\n💎 VIP loyalty program recommended',
    'alerts': '⚠️ **System Alerts**\n\n**Critical:**\n- Paris store in maintenance mode\n- 2 products completely sold out\n\n**Warnings:**\n- 18 low stock alerts\n- Database backup pending\n\n**Info:**\n- 524 new customers this month\n- System uptime: 99.9%\n\n✅ No security threats detected',
    'default': 'I understand you\'re asking about that. Here\'s what I can tell you:\n\n✅ All systems are operational\n📊 Data is up to date\n🔔 No critical issues detected\n\nWould you like me to:\n• Generate a detailed report?\n• Show specific metrics?\n• Provide recommendations?\n\nPlease let me know how I can help further!'
};

const AdminAIAssistantPage: React.FC = () => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getAIResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('performance') || lowerQuery.includes('store')) return SAMPLE_RESPONSES.performance;
        if (lowerQuery.includes('stock') || lowerQuery.includes('inventory')) return SAMPLE_RESPONSES.stock;
        if (lowerQuery.includes('sales') || lowerQuery.includes('trend')) return SAMPLE_RESPONSES.sales;
        if (lowerQuery.includes('customer')) return SAMPLE_RESPONSES.customers;
        if (lowerQuery.includes('alert') || lowerQuery.includes('issue')) return SAMPLE_RESPONSES.alerts;
        return SAMPLE_RESPONSES.default;
    };

    const handleSend = (customQuery?: string) => {
        const query = customQuery || inputValue;
        if (!query.trim()) return;

        const newUserMessage = {
            id: messages.length + 1,
            role: 'user' as const,
            content: query,
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
                content: getAIResponse(query),
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <AdminLayout activeNav="AI Assistant">
                {/* Header */}
                <header className="flex flex-wrap justify-between items-center gap-6 mb-12">
                    <div>
                        <p className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">AI-Powered Intelligence</p>
                        <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">
                            AI <span className="text-primary">Assistant</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 bg-charcoal text-white px-6 py-3 rounded-full">
                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-black uppercase tracking-widest">AI Online</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                    {/* Side Panel - Quick Prompts */}
                    <motion.aside className="lg:col-span-4 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="bg-white p-6 rounded-[2rem] border border-border-light">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">bolt</span>
                                <h3 className="text-lg font-black uppercase italic">Quick Prompts</h3>
                            </div>
                            <p className="text-xs font-bold opacity-50 mb-4">Click to ask common questions</p>
                            <div className="space-y-2">
                                {QUICK_PROMPTS.map((prompt) => (
                                    <motion.button
                                        key={prompt.label}
                                        onClick={() => handleSend(prompt.query)}
                                        className="w-full flex items-start gap-3 p-3 bg-background-alt hover:bg-primary hover:text-charcoal rounded-xl transition-all text-left group"
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="material-symbols-outlined text-primary group-hover:text-charcoal text-lg mt-0.5">{prompt.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase">{prompt.label}</p>
                                            <p className="text-[10px] opacity-50 uppercase tracking-tight">{prompt.category}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-charcoal text-white p-6 rounded-[2rem]">
                            <h3 className="text-sm font-black uppercase italic mb-4">AI Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs opacity-50 uppercase tracking-widest">Queries Today</span>
                                    <span className="text-lg font-black text-primary">127</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs opacity-50 uppercase tracking-widest">Avg Response</span>
                                    <span className="text-lg font-black">1.2s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs opacity-50 uppercase tracking-widest">Accuracy</span>
                                    <span className="text-lg font-black text-primary">98.5%</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Main Chat Area */}
                    <motion.section className="lg:col-span-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="bg-white rounded-[2.5rem] border-4 border-charcoal overflow-hidden flex flex-col" style={{ height: '700px', boxShadow: '12px 12px 0px #25f425' }}>
                            {/* Chat Header */}
                            <div className="bg-charcoal text-white p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 bg-primary rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-charcoal text-2xl font-black">smart_toy</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase italic">KIX AI Assistant</h3>
                                        <p className="text-xs opacity-50 uppercase tracking-tight">Powered by Advanced ML</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={() => setMessages(INITIAL_MESSAGES)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear Chat
                                </motion.button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background-alt/30">
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                            <div className={`p-4 rounded-2xl ${message.role === 'user' ? 'bg-primary text-charcoal rounded-tr-none' : 'bg-white border-2 border-charcoal rounded-tl-none'}`}>
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
                                    <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="bg-white border-2 border-charcoal px-6 py-4 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-2">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="size-3 bg-primary rounded-full"
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
                            <div className="p-6 bg-white border-t-4 border-charcoal">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask me anything about your stores, inventory, sales..."
                                        className="flex-1 px-6 py-4 bg-background-alt border-2 border-charcoal rounded-xl font-bold text-sm focus:ring-4 focus:ring-primary focus:border-primary"
                                    />
                                    <motion.button
                                        onClick={() => handleSend()}
                                        disabled={!inputValue.trim()}
                                        className="size-14 bg-primary text-charcoal rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed border-2 border-charcoal"
                                        whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
                                        whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
                                    >
                                        <span className="material-symbols-outlined font-black text-xl">send</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </AdminLayout>
        </motion.div>
    );
};

export default AdminAIAssistantPage;
