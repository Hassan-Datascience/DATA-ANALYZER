import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Network,
    TrendingUp,
    Database,
    Shield,
    Settings,
    Activity
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Analysis Hub', path: '/dashboard' },
        { icon: Network, label: 'Node Cluster', path: '/nodes' },
        { icon: TrendingUp, label: 'Trend Analytics', path: '/analytics' },
        { icon: Database, label: 'Data Storage', path: '/storage' },
        { icon: Shield, label: 'Security Vault', path: '/vault' },
        { icon: Settings, label: 'System Config', path: '/config' },
    ];

    return (
        <aside className="w-20 lg:w-64 bg-[rgba(10,32,16,0.6)] backdrop-blur-[40px] border-r border-spring-green/10 flex flex-col z-20 transition-all duration-300">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-12 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-spring-green rounded-sm flex items-center justify-center shadow-neon group-hover:rotate-90 transition-transform">
                        <Activity className="w-5 h-5 text-cyber-bg" />
                    </div>
                    <h1 className="hidden lg:block text-sm font-black tracking-tighter text-white uppercase font-mono tracking-widest">Data.Analyzer</h1>
                </div>

                <nav className="space-y-4">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded transition-all group cursor-pointer border ${active
                                    ? 'text-spring-green bg-spring-green/10 border-spring-green/20 shadow-[0_0_15px_rgba(0,255,102,0.1)]'
                                    : 'text-white/40 border-transparent hover:text-spring-green hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-spring-green' : 'text-white/40 group-hover:text-spring-green'}`} />
                                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-emerald-dark border border-spring-green/20 flex items-center justify-center text-xs text-spring-green font-mono">AD</div>
                    <div className="hidden lg:block overflow-hidden">
                        <p className="text-[10px] font-bold text-white truncate font-mono uppercase tracking-tighter">Analyst_Dalton</p>
                        <p className="text-[9px] text-spring-green/40 uppercase tracking-[0.2em] font-mono">Access: LVL-4</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
