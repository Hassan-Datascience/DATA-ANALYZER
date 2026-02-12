import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ConnectionStatus: React.FC = () => {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);

    const checkConnection = async () => {
        setChecking(true);
        try {
            await axios.get('/api/health', { timeout: 3000 });
            setConnected(true);
        } catch (error) {
            setConnected(false);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-lg backdrop-blur-xl">
            {connected === null || checking ? (
                <RefreshCw className="w-3 h-3 text-white/20 animate-spin" />
            ) : connected ? (
                <Wifi className="w-3 h-3 text-spring-green shadow-neon" />
            ) : (
                <WifiOff className="w-3 h-3 text-red-500 animate-pulse" />
            )}

            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Network Status</span>
                <span className={`text-[9px] font-bold uppercase transition-colors ${connected === null || checking ? 'text-white/20' :
                    connected ? 'text-spring-green' : 'text-red-500'
                    }`}>
                    {connected === null || checking ? 'Synchronizing...' :
                        connected ? 'Gateway_Active' : 'Connection_Failed'}
                </span>
            </div>

            {!connected && !checking && connected !== null && (
                <button
                    onClick={checkConnection}
                    className="ml-2 p-1.5 hover:bg-white/5 rounded transition-colors"
                    title="Retry Connection"
                >
                    <RefreshCw className="w-3 h-3 text-white/60" />
                </button>
            )}
        </div>
    );
};

export default ConnectionStatus;
