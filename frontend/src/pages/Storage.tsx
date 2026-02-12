import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import {
    Database,
    PieChart as LucidePieChart,
    HardDrive,
    FileJson,
    FileText,
    FileSpreadsheet,
    Activity,
    Layers
} from 'lucide-react';
import DonutChart from '../components/charts/DonutChart';
import { useSystemHealth } from '../services/api';

const Storage: React.FC = () => {
    const { data: health } = useSystemHealth();

    const storageUsage = [
        { label: 'Structured Data', size: '2.4 TB', color: 'bg-spring-green', progress: 65, icon: Database },
        { label: 'Unstructured Logs', size: '1.2 TB', color: 'bg-blue-500', progress: 30, icon: FileJson },
        { label: 'System Archives', size: '450 GB', color: 'bg-purple-500', progress: 12, icon: Layers },
        { label: 'Temp Cache', size: '84 MB', color: 'bg-yellow-500', progress: 2, icon: Activity },
    ];

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <HardDrive className="w-4 h-4 text-spring-green" />
                        <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">Data_Repository // Storage</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Storage <span className="text-spring-green neon-text">Analysis</span>
                    </h2>
                </header>

                <div className="grid grid-cols-12 gap-8 mb-12">
                    {/* USAGE OVERVIEW */}
                    <div className="col-span-12 lg:col-span-5">
                        <section className="glass-card p-12 rounded-xl relative overflow-hidden group min-h-[450px] flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-spring-green/5 blur-[60px]"></div>
                            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-12 font-mono">Global Capacity</h3>
                            <div className="h-64 w-full">
                                <DonutChart value={health?.buffer_level || 62} label="LOAD_FACTOR" />
                            </div>
                            <div className="mt-8 text-center">
                                <p className="text-4xl font-black text-white">4.2 TB</p>
                                <p className="text-[10px] uppercase text-spring-green tracking-widest font-mono">Total Occupied Space</p>
                            </div>
                        </section>
                    </div>

                    {/* FILE BREAKDOWN */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {storageUsage.map((item, i) => (
                                <div key={i} className="glass-card p-6 rounded-xl border border-white/5 hover:border-spring-green/20 transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-3 rounded-lg bg-white/5 text-white/60`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase text-white/40 tracking-widest font-mono">{item.label}</p>
                                            <p className="text-lg font-black text-white">{item.size}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-mono tracking-widest uppercase">
                                            <span className="text-white/40">Utilization</span>
                                            <span className="text-spring-green">{item.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} shadow-lg transition-all duration-1000`}
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-8 rounded-xl border border-white/5 mt-auto">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-6 font-mono">Asset Type Ingestion</h3>
                            <div className="flex justify-between gap-4">
                                {[
                                    { name: 'CSV', count: 42, icon: FileSpreadsheet, color: 'text-spring-green' },
                                    { name: 'JSON', count: 128, icon: FileJson, color: 'text-blue-400' },
                                    { name: 'XLSX', count: 12, icon: FileSpreadsheet, color: 'text-green-600' },
                                    { name: 'DOCS', count: 85, icon: FileText, color: 'text-purple-400' },
                                ].map((type, i) => (
                                    <div key={i} className="flex-1 p-4 bg-white/[0.02] border border-white/5 rounded text-center hover:bg-white/[0.04] transition-colors">
                                        <type.icon className={`w-5 h-5 mx-auto mb-2 ${type.color}`} />
                                        <p className="text-[10px] font-black text-white">{type.count}</p>
                                        <p className="text-[8px] text-white/20 uppercase tracking-widest">{type.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Storage;
