import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Zap, Activity, Lock, Eye, Globe } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const SecurityScoreCard: React.FC<{ score: number, status: string }> = ({ score, status }) => (
    <div className="glass-card p-8 rounded-xl relative overflow-hidden group border border-spring-green/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-spring-green/5 blur-[60px]"></div>
        <div className="flex justify-between items-start mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/40 font-mono">Defense_Protocol_Index</h3>
            <Shield className="w-4 h-4 text-spring-green shadow-neon" />
        </div>
        <div className="flex items-baseline gap-3 mb-4">
            <span className="text-6xl font-black text-white group-hover:scale-105 transition-transform duration-500">{score}%</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${status === 'OPTIMAL' ? 'bg-spring-green/10 border-spring-green/40 text-spring-green' : 'bg-red-500/10 border-red-500/40 text-red-500'
                }`}>
                {status}
            </span>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between text-[9px] uppercase tracking-widest font-mono text-white/40">
                <span>Encryption_Entropy</span>
                <span className="text-white">High_Resilience</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-spring-green shadow-neon" style={{ width: `${score}%` }}></div>
            </div>
        </div>
    </div>
);

export const ThreatIntelPanel: React.FC<{ threats: any[] }> = ({ threats }) => (
    <div className="glass-card p-8 rounded-xl border border-white/5">
        <div className="flex items-center gap-3 mb-8">
            <Globe className="w-4 h-4 text-purple-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 font-mono">Active_Threat_Feeds</h3>
        </div>
        <div className="space-y-4">
            {threats.map((threat, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded flex items-center justify-between group hover:bg-red-500/5 transition-all">
                    <div className="flex items-center gap-4">
                        <ShieldAlert className={`w-4 h-4 ${threat.severity === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                        <div>
                            <p className="text-[10px] font-black uppercase text-white tracking-widest">{threat.vector}</p>
                            <p className="text-[8px] font-mono text-white/40 uppercase">{threat.origin} // {threat.timestamp}</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-white/60 bg-white/5 px-2 py-1 rounded">BLOCKED</span>
                </div>
            ))}
        </div>
    </div>
);

export const ComplianceMatrix: React.FC = () => (
    <div className="glass-card p-8 rounded-xl border border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8 font-mono">Compliance_Gaps_Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'GDPR', status: 'compliant', icon: ShieldCheck },
                { label: 'ISO-27001', status: 'compliant', icon: ShieldCheck },
                { label: 'SOC2', status: 'warning', icon: Activity },
                { label: 'HIPAA', status: 'compliant', icon: ShieldCheck },
            ].map((item, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded text-center group hover:border-spring-green/20">
                    <item.icon className={`w-6 h-6 mx-auto mb-3 ${item.status === 'compliant' ? 'text-spring-green' : 'text-orange-500'}`} />
                    <p className="text-[10px] font-black text-white uppercase">{item.label}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">{item.status}</p>
                </div>
            ))}
        </div>
    </div>
);

export const IncidentResponseFeed: React.FC<{ events: any[] }> = ({ events }) => (
    <div className="glass-card p-8 rounded-xl border border-white/5">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-spring-green" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white font-mono">Security_Audit_Log</h3>
            </div>
            <span className="px-2 py-1 bg-spring-green/10 text-spring-green text-[8px] font-black uppercase rounded animate-pulse tracking-widest">Live Monitoring</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="p-4 text-[9px] font-black text-white/20 uppercase">Event_ID</th>
                        <th className="p-4 text-[9px] font-black text-white/20 uppercase">Signature</th>
                        <th className="p-4 text-[9px] font-black text-white/20 uppercase">Node_Source</th>
                        <th className="p-4 text-[9px] font-black text-white/20 uppercase text-right">State</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <td className="p-4 text-[10px] font-bold text-spring-green">#{event.id}</td>
                            <td className="p-4 text-[9px] text-white/60 truncate max-w-[150px] uppercase">{event.vector}</td>
                            <td className="p-4 text-[9px] text-white/40 uppercase">{event.node}</td>
                            <td className="p-4 text-right">
                                <span className="text-[8px] font-black px-2 py-0.5 border border-spring-green/20 text-spring-green uppercase rounded">Captured</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
