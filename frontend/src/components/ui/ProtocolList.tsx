import React from 'react'
import { Protocol } from '../../types/api.types'
import { getScoreColor } from '../../utils/formatters'

/**
 * FIXED PROTOCOLLIST.TSX
 * Resolving all 9+ errors relating to type mismatches and missing properties.
 */

interface ProtocolListProps {
    protocols?: Protocol[]
}

const ProtocolList: React.FC<ProtocolListProps> = ({ protocols = [] }) => {
    if (!protocols || protocols.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-spring-green/20 rounded">
                <span className="text-[10px] font-mono text-spring-green/40 uppercase tracking-widest">
                    No_Active_Protocols_Detected
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-spring-green/30 font-mono">
                    Active_Protocols
                </h3>
                <button type="button" className="text-[10px] text-spring-green font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Access_All
                </button>
            </div>
            <div className="space-y-3">
                {protocols.map((protocol) => (
                    <div
                        key={protocol.id}
                        className="glass-card p-4 rounded flex items-center justify-between hover:bg-spring-green/5 transition-all group border-l-2 border-l-transparent hover:border-l-spring-green"
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white text-xs font-black font-mono truncate max-w-[180px] group-hover:text-spring-green transition-colors uppercase tracking-tight">
                                {protocol.name}
                            </span>
                            <span className="text-spring-green/30 text-[9px] mt-1 font-mono uppercase tracking-widest truncate">
                                Node {protocol.node} // {protocol.id}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-current opacity-70 ${getScoreColor(protocol.status === 'PASS' || protocol.status === 'VERIFIED' ? 100 : 50)}`}>
                                {protocol.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProtocolList
