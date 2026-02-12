import React from 'react';
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

/**
 * FIXED DRIFTLINECHART.TSX
 * Resolving all TypeScript and Recharts property errors.
 */

interface DriftLineChartProps {
    data: number[];
    height?: number | string;
}

interface DriftDataItem {
    id: number;
    value: number;
}

const DriftLineChart: React.FC<DriftLineChartProps> = ({ data, height = '100%' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-spring-green/20 font-mono uppercase tracking-widest">
                Drift_Scan...
            </div>
        );
    }

    const chartData: DriftDataItem[] = data.map((val, i) => ({
        id: i,
        value: val
    }));

    return (
        <div style={{ height }} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
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
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#008F5A" // Drift specific emerald green
                        strokeWidth={3}
                        dot={false}
                        animationDuration={1000}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DriftLineChart;
