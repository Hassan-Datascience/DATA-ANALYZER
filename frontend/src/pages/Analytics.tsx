import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import {
    TrendingUp,
    BarChart3,
    PieChart as LucidePieChart,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    FileText,
    Database,
    AlertTriangle,
    Download,
    Zap,
    Target
} from 'lucide-react';
import ConnectionStatus from '../components/ui/ConnectionStatus';
import { useSecurityMetrics, useNetworkTraffic, useThreatIntelligence } from '../services/api';
import AreaChart from '../components/charts/AreaChart';
import { formatNumber } from '../utils/formatters';
import { useData } from '../context/DataContext';
import AutoCharts from '../components/AutoCharts';
import {
    QualityScoreCard,
    IssuesPanel,
    RecommendationsPanel,
    AnomalyBreakdown
} from '../components/InsightComponents';

// MOCK RECOMMENDATIONS (to be backend-driven later)
const MOCK_RECOMMENDATIONS = [
    { id: '1', title: 'Critical Duplicates', action: 'Remove 150 non-unique records from the primary index.', impact: 'Improves score +15%', effort: 'Low' as const },
    { id: '2', title: 'Statistical Outliers', action: 'Filter values in [amount] exceeding 3x Standard Deviation.', impact: 'Stabilizes variance', effort: 'Medium' as const },
    { id: '3', title: 'Missing Inferences', action: 'Apply mean-imputation to null values in [age] column.', impact: 'Restores completeness', effort: 'Low' as const },
    { id: '4', title: 'Type Mismatch', action: 'Coerce string entries in [date] to ISO-8601 format.', impact: 'Enables time-series', effort: 'High' as const },
];

const MOCK_DIMENSIONS = {
    'Completeness': 95,
    'Consistency': 72,
    'Validity': 88,
    'Uniqueness': 85,
    'Integrity': 92
};

const Analytics: React.FC = () => {
    const { uploadedData, analysis } = useData();
    const { data: metrics } = useSecurityMetrics();
    const { data: traffic } = useNetworkTraffic();
    const { data: threat } = useThreatIntelligence();

    const stats = (uploadedData && analysis) ? [
        { label: 'Data Reliability', value: (analysis.reliability_score?.toFixed(1) || '0.0') + '%', trend: analysis.reliability_score >= 85 ? 'Optimal' : 'Review', up: analysis.reliability_score >= 85 },
        { label: 'Dataset Volume', value: formatNumber(uploadedData.metadata.rowCount), trend: 'Processed', up: true },
        { label: 'Variable Count', value: uploadedData.metadata.columnCount, trend: 'Indexed', up: true },
        { label: 'Identified Issues', value: analysis?.anomalies?.length || 0, trend: (analysis?.anomalies?.length || 0) > 10 ? 'Critical' : 'Nominal', up: (analysis?.anomalies?.length || 0) <= 10 },
    ] : [
        { label: 'Overall Efficiency', value: metrics?.integrity_score + '%', trend: '+2.4%', up: true },
        { label: 'Signal Intensity', value: traffic?.request_rate.split(' ')[0] || '0', trend: '-0.8%', up: false },
        { label: 'Network Latency', value: metrics?.latency_ms + 'ms', trend: '+12ms', up: false },
        { label: 'Data Deviation', value: threat?.drift_value || '0.000', trend: 'Optimal', up: true },
    ];

    const handleExport = () => {
        if (!uploadedData || !analysis) return;
        const blob = new Blob([JSON.stringify({ data: uploadedData, analysis }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis_${uploadedData.metadata.filename.split('.')[0]}.json`;
        a.click();
    };

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden font-sans text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                <div className="bg-cyber-grid absolute inset-0 -z-10 opacity-30" style={{ backgroundSize: '40px 40px' }}></div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-4 h-4 text-spring-green" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-spring-green uppercase font-mono">
                                {uploadedData ? `Analysis Report: ${uploadedData.metadata.filename}` : 'Business_Intelligence // Insights'}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                            Trend <span className="text-spring-green neon-text">Analytics</span>
                        </h2>
                    </div>

                    {uploadedData && analysis && (
                        <div className="flex items-center gap-4">
                            <ConnectionStatus />
                            <button
                                onClick={handleExport}
                                className="px-6 py-3 bg-spring-green text-cyber-bg text-[10px] font-black uppercase tracking-widest rounded shadow-neon hover:scale-[1.05] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Export_Report
                            </button>
                        </div>
                    )}
                    {!uploadedData && <ConnectionStatus />}
                </header>

                {/* DATASET METADATA (If uploaded) */}
                {uploadedData && (
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-xl border-l-2 border-l-spring-green flex items-center gap-6">
                            <div className="p-4 bg-spring-green/10 rounded-lg">
                                <Database className="w-8 h-8 text-spring-green shadow-neon" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-tight mb-1">Dataset Infrastructure</h4>
                                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    {uploadedData.metadata.type} // {uploadedData.metadata.size.toLocaleString()} bytes
                                </p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-xl border-l-2 border-l-purple-500 flex items-center gap-6">
                            <div className="p-4 bg-purple-500/10 rounded-lg">
                                <LucidePieChart className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase text-white tracking-tight mb-1">Logic Suggestions</h4>
                                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                    {analysis?.suggestedCharts?.join(' | ') || 'Pending_Analysis...'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-6 rounded-xl border border-white/5 hover:border-spring-green/20 transition-all">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-4">{stat.label}</p>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-black text-white">{stat.value}</span>
                                <div className={`flex items-center text-[10px] font-bold ${stat.up ? 'text-spring-green' : 'text-red-500'}`}>
                                    {stat.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stat.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DYNAMIC ANALYSIS SECTION */}
                <div className="space-y-12">
                    {uploadedData && analysis ? (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                <QualityScoreCard
                                    score={analysis?.reliability_score || 0}
                                    dimensions={analysis?.dimensions || MOCK_DIMENSIONS}
                                />
                                <div className="glass-card p-8 rounded-xl border border-white/5 flex flex-col justify-center text-center">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">Expert Recommendations</h3>
                                    <p className="text-xs font-mono text-white/60 mb-8 italic">Machine learning model suggests these optimizations to harden your data infrastructure.</p>
                                    <div className="flex justify-center gap-4">
                                        <div className="flex items-center gap-2 text-[10px] text-spring-green font-black uppercase tracking-widest">
                                            <Zap className="w-4 h-4" />
                                            AI Guided
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-purple-500 font-black uppercase tracking-widest">
                                            <Target className="w-4 h-4" />
                                            Precision Fixes
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <IssuesPanel issues={(() => {
                                    const statObs = (analysis as any)?.statistical_observations;
                                    if (!statObs) {
                                        return [
                                            { severity: 'critical' as const, title: 'No Critical Issues Detected', count: 0, affectedColumns: [] },
                                            { severity: 'warning' as const, title: 'No Warnings', count: 0, affectedColumns: [] },
                                            { severity: 'info' as const, title: 'Standard Compliance', count: 0, affectedColumns: [] },
                                        ];
                                    }

                                    const issues: Array<{ severity: 'critical' | 'warning' | 'info', title: string, count: number, affectedColumns: string[] }> = [];

                                    // Critical issues (red)
                                    (statObs.critical || []).forEach((issue: string) => {
                                        issues.push({
                                            severity: 'critical' as const,
                                            title: issue,
                                            count: parseInt(issue.match(/\d+/)?.[0] || '0'),
                                            affectedColumns: []
                                        });
                                    });

                                    // Warning issues (yellow)
                                    (statObs.warning || []).forEach((issue: string) => {
                                        issues.push({
                                            severity: 'warning' as const,
                                            title: issue,
                                            count: parseInt(issue.match(/\d+/)?.[0] || '0'),
                                            affectedColumns: []
                                        });
                                    });

                                    // Optimized findings (green)
                                    (statObs.optimized || []).forEach((issue: string) => {
                                        issues.push({
                                            severity: 'info' as const,
                                            title: issue,
                                            count: 0,
                                            affectedColumns: []
                                        });
                                    });

                                    return issues;
                                })()} />
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">Optimisation Backlog</h3>
                                <RecommendationsPanel recommendations={(() => {
                                    const backendRecs = (analysis as any)?.recommendations;
                                    if (!backendRecs || backendRecs.length === 0) {
                                        return MOCK_RECOMMENDATIONS;
                                    }

                                    // Transform backend recommendations to match expected format
                                    return backendRecs.map((rec: any, idx: number) => ({
                                        id: String(idx + 1),
                                        title: rec.title || 'Unknown',
                                        action: rec.description || '',
                                        impact: rec.impact || 'Unknown impact',
                                        effort: rec.effort?.includes('LOW') ? 'Low' as const :
                                            rec.effort?.includes('MEDIUM') ? 'Medium' as const :
                                                rec.effort?.includes('HIGH') ? 'High' as const : 'Medium' as const
                                    }));
                                })()} />
                            </section>

                            <section>
                                <AnomalyBreakdown methods={(() => {
                                    const breakdown = (analysis as any)?.detection_breakdown;
                                    if (!breakdown) {
                                        return [
                                            { name: 'IsolationForest', description: 'Tree-based partitioning', count: 0 },
                                            { name: 'Z-Score', description: 'Standard deviation threshold', count: 0 },
                                            { name: 'Modified Z-Score', description: 'Median absolute deviation', count: 0 },
                                            { name: 'IQR Method', description: 'Interquartile range filter', count: 0 },
                                        ];
                                    }

                                    return Object.keys(breakdown).map(key => ({
                                        name: key,
                                        description: breakdown[key].method || '',
                                        count: breakdown[key].count || 0
                                    }));
                                })()} />
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-6 font-mono">Automated Visualization Suite</h3>
                                <AutoCharts data={uploadedData.rows} analysis={analysis} />
                            </section>

                            {(analysis?.anomalies?.length || 0) > 0 && (
                                <section className="glass-card p-8 rounded-xl border border-red-500/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 font-mono">Telemetry Anomaly Report</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(analysis?.anomalies || []).map((anomaly: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 rounded border border-red-500/10">
                                                <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shadow-[0_0_5px_red]"></div>
                                                <p className="text-[10px] font-mono text-white/50 uppercase leading-relaxed">{anomaly}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="glass-card rounded-xl overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Variable Architecture</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-mono">
                                        <thead className="bg-white/[0.01]">
                                            <tr className="border-b border-white/5">
                                                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Header</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Type</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Distinct</th>
                                                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Summary</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(analysis?.columns || []).map((col: any, i: number) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01]">
                                                    <td className="px-6 py-4 text-[10px] font-bold text-spring-green uppercase">{col.name}</td>
                                                    <td className="px-6 py-4 font-mono">
                                                        <span className="text-[8px] px-2 py-0.5 rounded border border-white/10 text-white/60 uppercase">{col.type}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] text-white/40">{col.stats?.uniqueValues || 0}</td>
                                                    <td className="px-6 py-4 text-[9px] text-white/40">
                                                        {col.type === 'numeric' ? `AVG: ${col.stats?.avg?.toFixed(2) || '0.00'} | SUM: ${formatNumber(col.stats?.sum || 0)}` : `MISSING: ${col.stats?.missingValues || 0}`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-8">
                            {/* TREND ANALYSIS */}
                            <div className="col-span-12 lg:col-span-8">
                                <div className="glass-card p-8 rounded-xl min-h-[400px] flex flex-col">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Efficiency Analysis</h3>
                                        <TrendingUp className="w-4 h-4 text-spring-green/40" />
                                    </div>
                                    <div className="flex-1 min-h-[300px]">
                                        <AreaChart data={threat?.drift_trend || []} />
                                    </div>
                                </div>
                            </div>

                            {/* STATISTICAL SUMMARY */}
                            <div className="col-span-12 lg:col-span-4">
                                <div className="glass-card p-8 rounded-xl h-full flex flex-col">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 mb-8 font-mono">Performance Summary</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Ingestion Rate', progress: 85, color: 'bg-spring-green' },
                                            { label: 'Processing Load', progress: 42, color: 'bg-blue-500' },
                                            { label: 'Memory Allocation', progress: 68, color: 'bg-purple-500' },
                                            { label: 'Storage Buffer', progress: 12, color: 'bg-yellow-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                                                    <span className="text-white/60">{item.label}</span>
                                                    <span className="text-white">{item.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.color} shadow-lg transition-all duration-1000`}
                                                        style={{ width: `${item.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Analytics;
