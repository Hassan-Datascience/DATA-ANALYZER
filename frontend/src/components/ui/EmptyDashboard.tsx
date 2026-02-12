import React from 'react';
import { Database, Upload, Shield, Activity, Cpu } from 'lucide-react';

interface EmptyDashboardProps {
    onUploadClick: () => void;
}

const EmptyDashboard: React.FC<EmptyDashboardProps> = ({ onUploadClick }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-700">
            {/* CENTRAL SYSTEM STATUS */}
            <div className="flex flex-col items-center">
                <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-spring-green/10 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-2 border border-spring-green/20 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Database className="w-10 h-10 text-spring-green/40" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">System_Idle // No_Data_Active</h3>
                <p className="text-[10px] text-spring-green/40 uppercase tracking-widest font-mono text-center max-w-xs leading-relaxed">
                    The intelligence engine is awaiting data stream ingestion. Upload a workspace to synchronize analysis clusters.
                </p>
            </div>

            {/* ACTION CENTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <button
                    onClick={onUploadClick}
                    className="p-8 glass-card rounded-xl border border-spring-green/20 hover:border-spring-green/60 hover:bg-spring-green/[0.05] transition-all group text-left"
                >
                    <Upload className="w-8 h-8 text-spring-green mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-white uppercase mb-1">Execute_Ingestion</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">Import CSV, JSON, or Excel workspace</p>
                </button>

                <div className="p-8 glass-card rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                    <Activity className="w-8 h-8 text-white/20 mb-4" />
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Analysis_Deep_Scan</p>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Requires active data stream</p>
                </div>

                <div className="p-8 glass-card rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                    <Shield className="w-8 h-8 text-white/20 mb-4" />
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Vulnerability_Report</p>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Requires audit completion</p>
                </div>
            </div>

            {/* LOWER TELEMETRY MOCK (REDUCED OPACITY FOR NO DATA) */}
            <div className="w-full max-w-4xl pt-12 border-t border-white/5 grid grid-cols-4 gap-4">
                {[
                    { label: 'CPU_GATEWAY', value: '0.4%', icon: Cpu },
                    { label: 'CLUSTER_SYNC', value: 'ENABLED', icon: Activity },
                    { label: 'ENCRYPTION', value: 'SHA-256', icon: Shield },
                    { label: 'NODES', value: '94_ACTIVE', icon: Database },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <item.icon className="w-3 h-3 text-spring-green" />
                        <div className="font-mono">
                            <p className="text-[8px] text-white/40 uppercase font-black">{item.label}</p>
                            <p className="text-[9px] text-spring-green">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmptyDashboard;
