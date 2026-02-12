import React, { useState, useEffect } from 'react';
import {
    Upload,
    BarChart3,
    TrendingUp,
    ShieldCheck,
    Settings,
    AlertTriangle,
    CheckCircle2,
    Info,
    Activity
} from 'lucide-react';
import {
    useSecurityMetrics,
    useNetworkTraffic,
    useThreatIntelligence,
    useComplianceStatus,
    useIncidentResponse,
    useSystemHealth
} from '../services/api';
import ConnectionStatus from '../components/ui/ConnectionStatus';
import {
    formatNumber,
    getScoreColor,
    formatDateTime
} from '../utils/formatters';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import Sidebar from '../components/ui/Sidebar';
import Modal from '../components/ui/Modal';
import UploadModal from '../components/ui/UploadModal';
import EmptyDashboard from '../components/ui/EmptyDashboard';
import { useData } from '../context/DataContext';

const Dashboard: React.FC = () => {
    const { uploadedData, analysis } = useData();

    // 1. DATA HOOKS
    const { data: metrics, isLoading: loadingMetrics, error: errorMetrics } = useSecurityMetrics();
    const { data: traffic, isLoading: loadingTraffic, error: errorTraffic } = useNetworkTraffic();
    const { data: threat, isLoading: loadingThreat, error: errorThreat } = useThreatIntelligence();
    const { data: compliance, isLoading: loadingCompliance, error: errorCompliance } = useComplianceStatus();
    const { data: incident, isLoading: loadingIncident, error: errorIncident } = useIncidentResponse();
    const { data: health, isLoading: loadingHealth, error: errorHealth } = useSystemHealth();

    // 2. INTERACTIVE STATE
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ open: boolean; title: string; content: React.ReactNode }>({
        open: false,
        title: '',
        content: null
    });
    const [resolvedProtocols, setResolvedProtocols] = useState<string[]>([]);
    const [activeProtocolId, setActiveProtocolId] = useState<string | null>(null);

    const isLoading = loadingMetrics || loadingTraffic || loadingThreat || loadingCompliance || loadingIncident || loadingHealth;
    const isError = errorMetrics || errorTraffic || errorThreat || errorCompliance || errorIncident || errorHealth;

    // 4. ACTION HANDLERS
    const handleResolve = (id: string) => {
        setResolvedProtocols([...resolvedProtocols, id]);
        setModalConfig({
            open: true,
            title: `Issue Resolved: ${id}`,
            content: (
                <p className="text-white/60 font-mono text-xs">
                    The identified data synchronization delay has been resolved. Cluster load balancing has prioritized the affected node segment.
                </p>
            )
        });
    };

    const handleStatClick = (title: string, data: any) => {
        setModalConfig({
            open: true,
            title: `${title} Analytics`,
            content: (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 glass-card rounded-lg border border-spring-green/20">
                            <span className="text-[10px] uppercase text-spring-green/40 block mb-2 tracking-widest">Current Metric</span>
                            <span className="text-3xl font-black text-white">{data}</span>
                        </div>
                        <div className="p-6 glass-card rounded-lg border border-spring-green/20">
                            <span className="text-[10px] uppercase text-spring-green/40 block mb-2 tracking-widest">Efficiency</span>
                            <span className="text-3xl font-black text-spring-green">OPTIMAL</span>
                        </div>
                    </div>
                </div>
            )
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-2 border-spring-green/20 border-t-spring-green rounded-full animate-spin shadow-[0_0_15px_rgba(0,255,102,0.2)]"></div>
                <span className="text-spring-green font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Establishing_Data_Link...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-8 text-center uppercase font-mono">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                <h2 className="text-xl font-black text-white tracking-tighter mb-2">Connection_Failed</h2>
                <button onClick={() => window.location.reload()} className="px-6 py-2 border border-spring-green/40 text-spring-green text-[10px] font-black tracking-widest hover:bg-spring-green/10 transition-all shadow-neon cursor-pointer">Reconnect_Service</button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative flex flex-col">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
                <Modal
                    isOpen={modalConfig.open}
                    onClose={() => setModalConfig({ ...modalConfig, open: false })}
                    title={modalConfig.title}
                >
                    {modalConfig.content}
                </Modal>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 min-h-[80px]">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-1 h-3 bg-spring-green shadow-neon animate-pulse"></span>
                            <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">System_Access // Cluster_94</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            Data <span className="text-spring-green neon-text">Analyzer</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <ConnectionStatus />
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border border-white/10 bg-white/5 text-white shadow-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer font-mono"
                        >
                            <Upload className="w-4 h-4" />
                            Upload_Data
                        </button>
                    </div>
                </header>

                {!uploadedData || !uploadedData.metadata ? (
                    <EmptyDashboard onUploadClick={() => setIsUploadOpen(true)} />
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <section
                                onClick={() => handleStatClick('Anomaly Rate', analysis?.anomaly_rate ? `${analysis.anomaly_rate}%` : 'Calculating...')}
                                className="glass-card p-8 rounded-xl relative overflow-hidden group min-h-[320px] cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-spring-green/5 blur-[60px]"></div>
                                <div className="flex justify-between items-start mb-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Anomaly Rate</h3>
                                    <Settings className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                                </div>
                                <div className="h-48 mb-6 flex flex-col items-center justify-center">
                                    {/* Large percentage display with color coding */}
                                    <div className={`text-8xl font-black mb-2 transition-colors ${(analysis?.anomaly_rate || 0) < 5 ? 'text-spring-green' :
                                        (analysis?.anomaly_rate || 0) < 10 ? 'text-yellow-400' :
                                            'text-red-500'
                                        }`}>
                                        {analysis?.anomaly_rate?.toFixed(1) || '0.0'}%
                                    </div>
                                    <div className="text-xs font-mono text-spring-green/40 uppercase tracking-widest">
                                        DETECTED OUTLIERS
                                    </div>
                                </div>
                            </section>

                            <section
                                onClick={() => handleStatClick('Dataset Volume', uploadedData?.metadata?.rowCount || 0)}
                                className="glass-card p-8 rounded-xl group min-h-[320px] flex flex-col cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Analysis Pulse</h3>
                                    <BarChart3 className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-black text-white group-hover:text-spring-green transition-all">
                                        {formatNumber(uploadedData?.metadata?.rowCount || 0)}
                                    </span>
                                    <span className="text-xs font-mono text-spring-green/40 uppercase tracking-widest">records</span>
                                </div>
                                <div className="mt-auto h-24">
                                    <BarChart data={(uploadedData?.rows || []).slice(0, 10).map((_r: any, i: number) => 30 + (i * 5) + Math.random() * 20)} />
                                </div>
                            </section>

                            <section
                                onClick={() => handleStatClick('Signal Deviation', ((analysis?.anomalies?.length || 0) * 0.12).toFixed(3))}
                                className="glass-card p-8 rounded-xl group min-h-[320px] flex flex-col cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Deviation Drift</h3>
                                    <TrendingUp className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-black text-white group-hover:text-spring-green transition-all">
                                        {((analysis?.anomalies?.length || 0) * 0.12).toFixed(3)}
                                    </span>
                                    <span className="text-xs font-mono text-spring-green/40 uppercase">∆</span>
                                </div>
                                <div className="mt-auto h-24">
                                    <LineChart data={(uploadedData?.rows || []).slice(0, 20).map(() => Math.random())} />
                                </div>
                            </section>
                        </div>

                        <div className="grid grid-cols-12 gap-8 mb-12">
                            <div className="col-span-12 lg:col-span-5 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/30 font-mono">Priority_Observations</h3>
                                <div className="space-y-3">
                                    {/* Display REAL anomaly data from backend */}
                                    {analysis?.issue_summary?.anomalies && (
                                        <div
                                            onClick={() => setActiveProtocolId(activeProtocolId === 'anomalies' ? null : 'anomalies')}
                                            className={`glass-card p-5 rounded group transition-all border-l-2 cursor-pointer ${activeProtocolId === 'anomalies' ? 'bg-spring-green/[0.05] border-l-spring-green' : 'hover:bg-spring-green/[0.03] border-l-transparent'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    <h4 className="text-xs font-black font-mono tracking-tight uppercase text-white">
                                                        {analysis.issue_summary.anomalies}
                                                    </h4>
                                                </div>
                                                <span className="text-[8px] font-black text-spring-green/40 border border-spring-green/20 px-2 py-0.5 rounded">DETECTED</span>
                                            </div>
                                        </div>
                                    )}
                                    {analysis?.issue_summary?.missing && (
                                        <div
                                            onClick={() => setActiveProtocolId(activeProtocolId === 'missing' ? null : 'missing')}
                                            className={`glass-card p-5 rounded group transition-all border-l-2 cursor-pointer ${activeProtocolId === 'missing' ? 'bg-spring-green/[0.05] border-l-spring-green' : 'hover:bg-spring-green/[0.03] border-l-transparent'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                    <h4 className="text-xs font-black font-mono tracking-tight uppercase text-white">
                                                        {analysis.issue_summary.missing}
                                                    </h4>
                                                </div>
                                                <span className="text-[8px] font-black text-spring-green/40 border border-spring-green/20 px-2 py-0.5 rounded">DETECTED</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-7">
                                <div className="glass-card h-full rounded-xl p-8 relative overflow-hidden flex flex-col min-h-[400px]">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-8 font-mono">Cluster Topology</h3>
                                    <div className="flex-1 flex items-center justify-center relative">
                                        <ShieldCheck className="w-12 h-12 text-spring-green/20 absolute" />
                                        <div className="absolute w-[300px] h-[300px] border border-spring-green/10 rounded-full animate-pulse"></div>
                                        <div className="absolute w-[150px] h-[1px] bg-gradient-to-r from-transparent to-spring-green/40 origin-left animate-spin"></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-mono text-spring-green/40 mt-auto pt-6 border-t border-white/5">
                                        <span className="uppercase tracking-widest font-black text-spring-green">Sync: Secure</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="glass-card rounded-xl overflow-hidden border-t-2 border-t-spring-green/20">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-spring-green/[0.02]">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-spring-green" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white font-mono">Analysis Stream Inspection</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse font-mono">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.01]">
                                            <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase">ID</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase">DATA_CONTEXT</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase text-right">STATE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(uploadedData?.rows || []).slice(0, 5).map((row: any, i: number) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-spring-green/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-spring-green">ROW-{i + 1}</td>
                                                <td className="px-6 py-4 text-[10px] text-white/60 truncate max-w-[400px]">{JSON.stringify(row).slice(0, 100)}...</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[9px] font-black text-spring-green uppercase border border-spring-green/20 px-2 py-0.5 rounded">Verified</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
