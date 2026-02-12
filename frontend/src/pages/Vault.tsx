import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import {
    SecurityScoreCard,
    ThreatIntelPanel,
    ComplianceMatrix,
    IncidentResponseFeed
} from '../components/VaultComponents';
import {
    useSecurityMetrics,
    useThreatIntelligence,
    useIncidentResponse
} from '../services/api';

const Vault: React.FC = () => {
    const { data: metrics } = useSecurityMetrics();
    const { data: threat } = useThreatIntelligence();
    const { data: incident } = useIncidentResponse();

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <SecurityScoreCard
                        score={metrics?.integrity_score || 0}
                        status={metrics?.flow_status || 'DEGRADED'}
                    />
                    <ThreatIntelPanel threats={threat?.threat_list || []} />
                </div>

                <div className="space-y-8">
                    <ComplianceMatrix />
                    <IncidentResponseFeed events={incident?.raw_streams || []} />
                </div>
            </main>
        </div>
    );
};

export default Vault;
