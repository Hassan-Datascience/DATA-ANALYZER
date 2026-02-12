import React from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    TrendingUp,
    Zap,
    BarChart3,
    ShieldCheck,
    Target,
    ArrowRight
} from 'lucide-react';

// 1. QUALITY SCORE CARD
export const QualityScoreCard: React.FC<{ score: number, dimensions: Record<string, number> }> = ({ score, dimensions }) => {
    const status = score >= 85 ? 'HEALTHY' : score >= 60 ? 'WARNING' : 'CRITICAL';
    const statusColor = score >= 85 ? 'text-spring-green' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
    const bgColor = score >= 85 ? 'bg-spring-green/10' : score >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10';
    const borderColor = score >= 85 ? 'border-spring-green/20' : score >= 60 ? 'border-yellow-500/20' : 'border-red-500/20';

    return (
        <div className={`glass-card p-6 rounded-xl border ${borderColor} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} blur-[40px] -z-10`}></div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 font-mono">Data Quality Index</h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black ${statusColor} neon-text`}>{Math.round(score)}</span>
                        <span className="text-white/20 font-black text-xl">/100</span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${bgColor} ${statusColor} border ${borderColor}`}>
                    {status}
                </div>
            </div>

            <div className="space-y-3">
                {Object.entries(dimensions).map(([dim, val]) => (
                    <div key={dim} className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase font-bold tracking-widest text-white/40">
                            <span>{dim}</span>
                            <span className={val >= 90 ? 'text-spring-green' : 'text-white'}>{val}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${val >= 90 ? 'bg-spring-green' : 'bg-white/40'} transition-all duration-1000`}
                                style={{ width: `${val}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 2. ISSUES PANEL
export interface QualityIssue {
    severity: 'critical' | 'warning' | 'info';
    title: string;
    count: number;
    affectedColumns: string[];
}

export const IssuesPanel: React.FC<{ issues: QualityIssue[] }> = ({ issues }) => {
    const critical = issues.filter(i => i.severity === 'critical');
    const warning = issues.filter(i => i.severity === 'warning');
    const info = issues.filter(i => i.severity === 'info');

    return (
        <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">Statistical Observations</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CRITICAL */}
                <div className="glass-card p-4 rounded-xl border border-red-500/10">
                    <div className="flex items-center gap-2 mb-4 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Critical ({critical.length})</span>
                    </div>
                    <div className="space-y-2">
                        {critical.map((issue, i) => (
                            <div key={i} className="p-2 bg-red-500/5 rounded text-[9px] font-mono text-white/60">
                                • {issue.count} {issue.title}
                                <div className="text-[8px] text-red-500/40 mt-1">[{issue.affectedColumns.join(', ')}]</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WARNING */}
                <div className="glass-card p-4 rounded-xl border border-yellow-500/10">
                    <div className="flex items-center gap-2 mb-4 text-yellow-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Warning ({warning.length})</span>
                    </div>
                    <div className="space-y-2">
                        {warning.map((issue, i) => (
                            <div key={i} className="p-2 bg-yellow-500/5 rounded text-[9px] font-mono text-white/60">
                                • {issue.count} {issue.title}
                                <div className="text-[8px] text-yellow-500/40 mt-1">[{issue.affectedColumns.join(', ')}]</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INFO */}
                <div className="glass-card p-4 rounded-xl border border-spring-green/10">
                    <div className="flex items-center gap-2 mb-4 text-spring-green">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Optimized ({info.length})</span>
                    </div>
                    <div className="space-y-2">
                        {info.map((issue, i) => (
                            <div key={i} className="p-2 bg-spring-green/5 rounded text-[9px] font-mono text-white/60">
                                • {issue.title}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. RECOMMENDATIONS PANEL
export interface Recommendation {
    id: string;
    title: string;
    action: string;
    impact: string;
    effort: 'Low' | 'Medium' | 'High';
}

export const RecommendationsPanel: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
                <div key={rec.id} className="glass-card p-5 rounded-xl border border-white/5 hover:border-spring-green/20 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-spring-green/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Zap className="w-4 h-4 text-spring-green" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-spring-green/40">{rec.effort} Effort</span>
                    </div>
                    <h4 className="text-xs font-black text-white uppercase mb-2 group-hover:text-spring-green transition-colors">{rec.title}</h4>
                    <p className="text-[10px] font-mono text-white/40 mb-4">{rec.action}</p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-spring-green/60 uppercase tracking-tighter">
                        <TrendingUp className="w-3 h-3" />
                        Impact: {rec.impact}
                    </div>
                </div>
            ))}
        </div>
    );
};

// 4. ANOMALY BREAKDOWN
export const AnomalyBreakdown: React.FC<{ methods: any[] }> = ({ methods }) => {
    return (
        <div className="glass-card p-6 rounded-xl border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 font-mono">Detection Methodology Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {methods.map((m, i) => (
                    <div key={i} className="text-center">
                        <div className="text-xs font-black text-white mb-1 uppercase tracking-tighter">{m.name}</div>
                        <div className="text-[8px] font-mono text-white/30 mb-2 uppercase">{m.description}</div>
                        <div className="text-xl font-black text-spring-green neon-text">{m.count}</div>
                        <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Points</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
