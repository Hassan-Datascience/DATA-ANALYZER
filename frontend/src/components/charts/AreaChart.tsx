import React from 'react';
import { AreaChart as RechartsAreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

/**
 * FIXED AREACHART.TSX
 * Resolving all TypeScript and Recharts property errors.
 */

interface AreaChartProps {
    data: number[];
    height?: number | string;
}

interface AreaDataItem {
    id: number;
    value: number;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, height = '100%' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-spring-green/20 font-mono uppercase tracking-widest">
                Telemetry_Load...
            </div>
        );
    }

    const chartData: AreaDataItem[] = data.map((val, i) => ({
        id: i,
        value: val
    }));

    return (
        <div style={{ height }} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis hide dataKey="id" />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(5, 8, 5, 0.9)',
                            border: '1px solid rgba(0, 255, 102, 0.2)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            padding: '8px'
                        }}
                        itemStyle={{ color: '#00FF66' }}
                        labelStyle={{ display: 'none' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#00FF66"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={2000}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChart;
