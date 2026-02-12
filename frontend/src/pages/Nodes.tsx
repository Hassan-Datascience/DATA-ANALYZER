import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import {
    Network,
    Server,
    Wifi,
    Cpu,
    ShieldCheck,
    CheckCircle2,
    Clock,
    Activity
} from 'lucide-react';
import { useNetworkTraffic } from '../services/api';
import { formatNumber } from '../utils/formatters';

const Nodes: React.FC = () => {
    const { data: traffic } = useNetworkTraffic();

    const nodes = [
        { id: 'GLOBAL-01', name: 'Primary Database Lake', provider: 'Azure Vault', status: 'Online', health: 98, load: 42, latency: '12ms' },
        { id: 'EDGE-04', name: 'Edge Processing Node', provider: 'AWS Cluster', status: 'Online', health: 95, load: 68, latency: '24ms' },
        { id: 'AUTH-V2', name: 'Identity Management', provider: 'Internal DC', status: 'Online', health: 100, load: 12, latency: '8ms' },
        { id: 'STORE-8', name: 'File Storage Cluster', provider: 'GCP Cloud', status: 'Standby', health: 88, load: 5, latency: '110ms' },
        { id: 'SEC-PROXY', name: 'Security Gateway', provider: 'Cloudflare', status: 'Online', health: 99, load: 15, latency: '15ms' },
        { id: 'LOGS-SYNC', name: 'Audit Log Collector', provider: 'Azure West', status: 'Maintenance', health: 65, load: 0, latency: 'N/A' },
    ];

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <Network className="w-4 h-4 text-spring-green" />
                        <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">Infrastructure // Topology</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Node <span className="text-spring-green neon-text">Cluster</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                    {nodes.map((node, i) => (
                        <div key={i} className="glass-card p-6 rounded-xl border border-white/5 hover:border-spring-green/20 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${node.status === 'Online' ? 'bg-spring-green/10 text-spring-green' : 'bg-white/5 text-white/40'}`}>
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase text-white group-hover:text-spring-green transition-colors">{node.name}</h3>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest">{node.id} // {node.provider}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${node.status === 'Online' ? 'border-spring-green/20 bg-spring-green/10 text-spring-green' :
                                        node.status === 'Standby' ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500' :
                                            'border-white/10 bg-white/5 text-white/40'
                                    }`}>
                                    <div className={`w-1 h-1 rounded-full ${node.status === 'Online' ? 'bg-spring-green shadow-neon' : 'bg-current'}`}></div>
                                    {node.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-[8px] uppercase text-white/40 tracking-widest mb-1">Health</p>
                                    <p className="text-xs font-black text-white">{node.health}%</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <p className="text-[8px] uppercase text-white/40 tracking-widest mb-1">Load</p>
                                    <p className="text-xs font-black text-white">{node.load}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] uppercase text-white/40 tracking-widest mb-1">Ping</p>
                                    <p className="text-xs font-black text-white">{node.latency}</p>
                                </div>
                            </div>

                            <button className="w-full py-2 rounded border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] group-hover:border-spring-green/40 group-hover:text-spring-green transition-all hover:bg-spring-green/10 cursor-pointer">
                                Manage_Node
                            </button>
                        </div>
                    ))}
                </div>

                <div className="glass-card p-8 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-spring-green" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Global Node Performance</h3>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-mono text-white/40">
                            <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> Average Saturation: 34%</span>
                            <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> CPU Load: Normal</span>
                        </div>
                    </div>
                    <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded">
                        <p className="text-[10px] uppercase text-white/20 tracking-[0.3em] font-mono">Live Cluster Topology Visualizer Loading...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Nodes;
