import React from 'react';
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts';

/**
 * FIXED BARCHART.TSX
 * Resolving all TypeScript and Recharts property errors.
 */

interface BarChartProps {
    data: number[];
    height?: number | string;
}

interface ChartDataItem {
    name: string;
    value: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = '100.00%' }) => {
    // 1. Data Validation & Empty State
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-spring-green/20 font-mono uppercase tracking-widest">
                Pulse_Search...
            </div>
        );
    }

    // 2. Data Transformation with explicit types
    const chartData: ChartDataItem[] = data.map((val, i) => ({
        name: `P${i}`,
        value: val
    }));

    return (
        <div style={{ height }} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    {/* Added explicit dataKey to XAxis to prevent key errors */}
                    <XAxis hide dataKey="name" />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: 'rgba(0, 255, 102, 0.05)' }}
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
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {chartData.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="#00FF66"
                                fillOpacity={0.1 + (index / chartData.length) * 0.9}
                            />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
