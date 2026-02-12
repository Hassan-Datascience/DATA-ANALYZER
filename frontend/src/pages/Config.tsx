import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import {
    Settings,
    Sliders,
    Bell,
    User,
    Globe,
    Save,
    RefreshCcw,
    Zap,
    Monitor
} from 'lucide-react';

const Config: React.FC = () => {
    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-4 h-4 text-spring-green" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">System // Configuration</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            System <span className="text-spring-green neon-text">Config</span>
                        </h2>
                    </div>
                    <button className="px-6 py-2 bg-spring-green text-cyber-bg text-[10px] font-black uppercase tracking-widest rounded shadow-neon hover:scale-[1.05] transition-all flex items-center gap-2 cursor-pointer">
                        <Save className="w-4 h-4" />
                        Save_Changes
                    </button>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* SETTINGS PANELS */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* GENERAL CONFIG */}
                        <section className="glass-card p-8 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <Monitor className="w-5 h-5 text-spring-green" />
                                <h3 className="text-xs font-black uppercase tracking-widest">General Interface</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: 'Platform Theme', value: 'Cyber-Emerald (Dark)', action: 'Change' },
                                    { label: 'Auto-Refresh Interval', value: '5,000ms', action: 'Modify' },
                                    { label: 'Language / Locale', value: 'English (US)', action: 'Switch' },
                                    { label: 'Analysis Timezone', value: 'UTC / GMT +0', action: 'Set' },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">{item.label}</p>
                                            <p className="text-sm font-bold text-white capitalize">{item.value}</p>
                                        </div>
                                        <button className="px-3 py-1 border border-white/10 text-[8px] font-black uppercase text-white/40 hover:text-spring-green hover:border-spring-green/40 transition-all rounded cursor-pointer">
                                            {item.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* DATA THRESHOLDS */}
                        <section className="glass-card p-8 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <Zap className="w-5 h-5 text-spring-green" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Alert Thresholds</h3>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { label: 'Deviation Criticality', val: 75, min: 0, max: 100 },
                                    { label: 'Latency Pulse Warning', val: 250, min: 50, max: 1000 },
                                    { label: 'Storage Buffer Overflow', val: 90, min: 50, max: 99 },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                            <span className="text-white/40">{item.label}</span>
                                            <span className="text-spring-green font-mono">{item.val}{item.max === 100 ? '%' : 'ms'}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full relative">
                                            <div
                                                className="h-full bg-spring-green shadow-neon"
                                                style={{ width: `${(item.val / item.max) * 100}%` }}
                                            ></div>
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-spring-green rounded-full shadow-lg"
                                                style={{ left: `${(item.val / item.max) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* SIDEBAR SETTINGS */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <section className="glass-card p-8 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <User className="w-5 h-5 text-spring-green" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Principal Identity</h3>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-spring-green/10 border-2 border-spring-green/20 flex items-center justify-center mb-4">
                                    <span className="text-2xl font-black text-spring-green">AD</span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-1">Analyst_Dalton</h4>
                                <p className="text-[10px] text-spring-green/60 uppercase tracking-widest font-mono mb-6">Permission: LVL-4 ACCESS</p>
                                <button className="w-full py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded cursor-pointer">
                                    Logout_Session
                                </button>
                            </div>
                        </section>

                        <section className="glass-card p-8 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3 mb-8">
                                <Globe className="w-5 h-5 text-spring-green" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Regional Sync</h3>
                            </div>
                            <div className="p-4 bg-spring-green/5 border border-spring-green/20 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <RefreshCcw className="w-4 h-4 text-spring-green animate-spin" />
                                    <span className="text-[10px] font-black text-spring-green uppercase tracking-widest">Cluster_Master Syncing</span>
                                </div>
                                <p className="text-[9px] text-white/40 leading-relaxed uppercase">Enterprise wide settings are synchronized across all nodes in the Cluster_94 infrastructure.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Config;
