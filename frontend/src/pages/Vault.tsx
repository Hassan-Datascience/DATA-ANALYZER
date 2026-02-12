import React from 'react';
import Sidebar from '../components/ui/Sidebar';

const Vault: React.FC = () => {
    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-1 h-3 bg-spring-green shadow-neon animate-pulse"></span>
                        <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">Terminal_Access // Security_Vault</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Cyber <span className="text-spring-green neon-text">Vault</span>
                    </h2>
                </header>

                <div className="glass-card p-12 rounded-xl text-center border border-spring-green/20">
                    <span className="material-symbols-outlined text-spring-green/20 text-6xl mb-4 animate-pulse">security</span>
                    <p className="text-spring-green/40 font-mono text-[10px] uppercase tracking-[0.4em]">Section_Under_Calibration...</p>
                </div>
            </main>
        </div>
    );
};

export default Vault;
