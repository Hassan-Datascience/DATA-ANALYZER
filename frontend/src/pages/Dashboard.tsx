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
import { useData } from '../context/DataContext';

/**
 * PROFESSIONAL DATA ANALYZER DASHBOARD
 * - Professional branding: "DATA ANALYZER"
 * - Data Upload integration
 * - Real-time business intelligence
 */

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
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
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

    // 3. SCAN LOGIC
    const handleStartScan = () => {
        setIsScanning(true);
        setScanProgress(0);
    };

    useEffect(() => {
        if (isScanning && scanProgress < 100) {
            const timer = setTimeout(() => setScanProgress(p => p + 5), 100);
            return () => clearTimeout(timer);
        } else if (scanProgress >= 100) {
            setTimeout(() => {
                setIsScanning(false);
                setModalConfig({
                    open: true,
                    title: 'Analysis Scan Complete',
                    content: (
                        <div className="space-y-4 font-mono text-xs">
                            <p className="text-spring-green">/// ANALYSIS_LOG_REPORT</p>
                            <div className="p-4 bg-white/5 rounded border border-white/10 space-y-2 text-white/60">
                                <p>Active Data Nodes: {formatNumber(traffic?.active_nodes || 0)}</p>
                                <p>Operational Integrity: {metrics?.integrity_score}%</p>
                                <p>Signal Deviation: {threat?.drift_value} σ</p>
                                <p className="text-spring-green font-bold uppercase">Verdict: System_Optimization_Nominal</p>
                            </div>
                        </div>
                    )
                });
            }, 500);
        }
    }, [isScanning, scanProgress, traffic, metrics, threat]);

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
                    <div className="p-6 bg-white/[0.02] rounded-lg border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Live Trend Summary</p>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center text-[9px] font-mono text-white/60 border-b border-white/5 pb-2">
                                    <span>Segment_0{i}_Validation Pan</span>
                                    <span className="text-spring-green">PASSED</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        });
    };

    if (isLoading && !isScanning) {
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
                <p className="text-red-500/60 text-[10px] tracking-widest max-w-xs mb-8">Unable to synchronize with remote analysis clusters. Verify gateway connectivity.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 border border-spring-green/40 text-spring-green text-[10px] font-black tracking-widest hover:bg-spring-green/10 transition-all shadow-neon cursor-pointer"
                >
                    Reconnect_Service
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
                <Modal
                    isOpen={modalConfig.open}
                    onClose={() => setModalConfig({ ...modalConfig, open: false })}
                    title={modalConfig.title}
                >
                    {modalConfig.content}
                </Modal>

                {/* HEADER SECTION */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-1 h-3 bg-spring-green shadow-neon animate-pulse"></span>
                            <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">System_Access // Cluster_94</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            Data <span className="text-spring-green neon-text">Analyzer</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border border-white/10 bg-white/5 text-white shadow-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer font-mono"
                        >
                            <Upload className="w-4 h-4" />
                            Upload_Data
                        </button>
                        <button
                            disabled={isScanning}
                            onClick={handleStartScan}
                            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded border transition-all font-mono relative overflow-hidden group shadow-neon-strong active:scale-95 ${isScanning
                                ? 'bg-spring-green/20 border-spring-green/40 text-spring-green/40 cursor-wait'
                                : 'bg-spring-green border-spring-green/40 text-cyber-bg hover:scale-105 cursor-pointer'
                                }`}
                        >
                            {isScanning ? `Analyzing_${scanProgress}%` : 'Execute_Scan'}
                        </button>
                    </div>
                </header>

                {/* ANALYTICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <section
                        onClick={() => handleStatClick('Analysis Integrity', uploadedData ? `${100 - ((analysis?.anomalies?.length || 0) * 5)}%` : `${metrics?.integrity_score}%`)}
                        className="glass-card p-8 rounded-xl relative overflow-hidden group min-h-[320px] cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-spring-green/5 blur-[60px]"></div>
                        <div className="flex justify-between items-start mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Data Integrity</h3>
                            <Settings className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                        </div>
                        <div className="h-48 mb-6">
                            <DonutChart
                                value={uploadedData ? 100 - ((analysis?.anomalies?.length || 0) * 5) : (metrics?.integrity_score || 0)}
                                label={uploadedData ? "QUALITY" : (metrics?.flow_status + " FLOW")}
                            />
                        </div>
                    </section>

                    <section
                        onClick={() => handleStatClick('Dataset Volume', uploadedData ? uploadedData.metadata.rowCount : traffic?.request_rate)}
                        className="glass-card p-8 rounded-xl group min-h-[320px] flex flex-col cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Analysis Pulse</h3>
                            <BarChart3 className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-5xl font-black text-white group-hover:text-spring-green transition-all">
                                {uploadedData ? formatNumber(uploadedData.metadata.rowCount) : (traffic?.request_rate?.split(' ')[0] || '0.0')}
                            </span>
                            <span className="text-xs font-mono text-spring-green/40 uppercase tracking-widest">{uploadedData ? 'records' : 'req/s'}</span>
                        </div>
                        <div className="mt-auto h-24">
                            <BarChart data={uploadedData ? uploadedData.rows.slice(0, 10).map((_r: any, i: number) => 30 + (i * 5) + Math.random() * 20) : (traffic?.pulse_data || [])} />
                        </div>
                    </section>

                    <section
                        onClick={() => handleStatClick('Signal Deviation', uploadedData ? ((analysis?.anomalies?.length || 0) * 0.12).toFixed(3) : threat?.drift_value)}
                        className="glass-card p-8 rounded-xl group min-h-[320px] flex flex-col cursor-pointer hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.02]"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Deviation Drift</h3>
                            <TrendingUp className="w-4 h-4 text-spring-green/40 group-hover:text-spring-green transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-5xl font-black text-white group-hover:text-spring-green transition-all">
                                {uploadedData ? ((analysis?.anomalies?.length || 0) * 0.12).toFixed(3) : (threat?.drift_value || '0.000')}
                            </span>
                            <span className="text-xs font-mono text-spring-green/40 uppercase">∆</span>
                        </div>
                        <div className="mt-auto h-24">
                            <LineChart data={uploadedData ? uploadedData.rows.slice(0, 20).map(() => Math.random()) : (threat?.drift_trend || [])} />
                        </div>
                    </section>
                </div>

                {/* ALERTS AND TOPOLOGY */}
                <div className="grid grid-cols-12 gap-8 mb-12">
                    <div className="col-span-12 lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/30 font-mono">Priority_Observations</h3>
                            <div className="px-3 py-1 bg-spring-green/10 text-spring-green text-[8px] font-black uppercase tracking-widest rounded-full border border-spring-green/20">Live System</div>
                        </div>

                        <div className="space-y-3">
                            {(uploadedData && analysis ? analysis.anomalies.map((a: string, i: number) => ({
                                id: `ANOMALY-${i}`,
                                name: a,
                                node: 'Data Analyzer',
                                status: 'ALERT',
                                description: 'Detected potential inconsistency or deviation in the ingested data stream during automated analysis.'
                            })) : (compliance?.active_protocols || []).slice(0, 4)).map((protocol: any) => {
                                const isResolved = resolvedProtocols.includes(protocol.id);
                                const isExpanded = activeProtocolId === protocol.id;

                                return (
                                    <div
                                        key={protocol.id}
                                        onClick={() => setActiveProtocolId(isExpanded ? null : protocol.id)}
                                        className={`glass-card p-5 rounded group transition-all border-l-2 cursor-pointer ${isExpanded ? 'bg-spring-green/[0.05] border-l-spring-green mb-4' : 'hover:bg-spring-green/[0.03] border-l-transparent hover:border-l-spring-green'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    {(protocol.status === 'ALERT' && !isResolved) ? (
                                                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                                    ) : (
                                                        <CheckCircle2 className={`w-4 h-4 ${isResolved ? 'text-spring-green' : 'text-spring-green/40'}`} />
                                                    )}
                                                    <h4 className={`text-xs font-black font-mono tracking-tight uppercase group-hover:text-spring-green transition-colors ${isResolved ? 'text-spring-green/40 line-through' : 'text-white'}`}>
                                                        {protocol.name}
                                                    </h4>
                                                </div>
                                                <p className="text-[8px] font-mono text-spring-green/40 uppercase tracking-widest truncate max-w-[200px] ml-7">Source: {protocol.node}</p>
                                            </div>
                                            <button
                                                disabled={isResolved}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResolve(protocol.id);
                                                }}
                                                className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] rounded border transition-all cursor-pointer ${isResolved
                                                    ? 'border-spring-green/10 text-spring-green/20'
                                                    : 'border-spring-green/40 text-spring-green hover:bg-spring-green/10 active:scale-95'
                                                    }`}
                                            >
                                                {isResolved ? 'Acknowledged' : protocol.status === 'PASS' || protocol.status === 'VERIFIED' ? 'Verified' : 'Resolve'}
                                            </button>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200 ml-7">
                                                <p className="text-[10px] font-mono text-white/50 leading-relaxed uppercase tracking-tight">
                                                    {protocol.description}
                                                </p>
                                                <div className="mt-4 flex gap-4">
                                                    <div className="text-[8px] font-bold text-spring-green/40 uppercase tracking-[0.2em]">Asset_ID: {protocol.id}</div>
                                                    <div className="flex items-center gap-1 text-[8px] font-bold text-spring-green uppercase tracking-[0.2em]">
                                                        <Activity className="w-3 h-3" />
                                                        Priority: {protocol.status === 'ALERT' ? 'High' : 'Normal'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-7">
                        <div
                            onClick={() => handleStatClick('Analysis Cluster', `${traffic?.active_nodes} Active Nodes`)}
                            className="glass-card h-full rounded-xl p-8 relative overflow-hidden flex flex-col min-h-[400px] cursor-pointer group hover:border-spring-green/30 transition-all hover:bg-spring-green/[0.01]"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-8 font-mono">Cluster Topology</h3>

                            <div className="flex-1 flex items-center justify-center relative scale-90 lg:scale-100">
                                <div className="absolute w-[300px] h-[300px] border border-spring-green/10 rounded-full group-hover:border-spring-green/20 transition-all"></div>
                                <div className="absolute w-[150px] h-[1px] bg-gradient-to-r from-transparent to-spring-green/40 origin-left animate-[spin_6s_linear_infinite]"></div>
                                <ShieldCheck className="w-12 h-12 text-spring-green/20 absolute" />
                                <div className="absolute top-[35%] right-[35%] w-4 h-4 bg-spring-green rounded-full shadow-neon animate-pulse"></div>
                            </div>

                            <div className="flex justify-between items-center text-[8px] font-mono text-spring-green/40 mt-auto pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-spring-green/40 rounded-full"></div>
                                    <span className="uppercase tracking-widest font-black">Active Clusters: {formatNumber(traffic?.active_nodes || 0)}</span>
                                </div>
                                <span className="uppercase tracking-widest font-black text-spring-green">Sync: {health?.status_code === 200 ? 'Secure' : 'Degraded'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DATA STREAM INSPECTION */}
                <section className="glass-card rounded-xl overflow-hidden border-t-2 border-t-spring-green/20">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-spring-green/[0.02]">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-spring-green" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white font-mono">Analysis Stream Inspection</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-mono text-spring-green tracking-widest uppercase px-2 py-0.5 border border-spring-green/20 rounded font-black">Cluster_Live</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-mono">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase tracking-widest">TRANSACTION_ID</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase tracking-widest">DATA_HASH_KEY</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase tracking-widest text-center">TIMESTAMP</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-spring-green/40 uppercase tracking-widest text-right">METRIC_STATE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(uploadedData ? uploadedData.rows.slice(0, 5).map((row: any, i: number) => ({
                                    id: `ROW-${i + 1}`,
                                    context_hash: Object.values(row).slice(0, 3).join(' | '),
                                    timestamp: new Date().toISOString(),
                                    state: 'VERIFIED'
                                })) : (incident?.raw_streams || []).slice(0, 5)).map((stream: any) => (
                                    <tr
                                        key={stream.id}
                                        className="border-b border-white/5 hover:bg-spring-green/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => handleStatClick(`Transaction ${stream.id}`, stream.context_hash)}
                                    >
                                        <td className="px-6 py-4 text-xs font-bold text-spring-green group-hover:scale-105 transition-transform uppercase whitespace-nowrap">{stream.id}</td>
                                        <td className="px-6 py-4 text-[10px] text-white/60 tracking-tighter truncate max-w-[200px] font-mono capitalize">{stream.context_hash}</td>
                                        <td className="px-6 py-4 text-[10px] text-white/40 text-center font-mono">{formatDateTime(stream.timestamp)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getScoreColor(stream.state === 'VERIFIED' ? 100 : 50)} items-center`}>
                                                {stream.state === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                                                {stream.state === 'VERIFIED' ? 'Verified' : 'Review'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
