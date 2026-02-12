import React from 'react';
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

/**
 * FIXED LINECHART.TSX
 * Resolving all TypeScript and Recharts property errors.
 */

interface LineChartProps {
    data: number[];
    height?: number | string;
}

interface LineDataItem {
    id: number;
    value: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, height = '100%' }) => {
    // 1. Data Validation
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[8px] text-spring-green/20 font-mono uppercase tracking-widest">
                Awaiting_Signal...
            </div>
        );
    }

    // 2. Data Transformation
    const chartData: LineDataItem[] = data.map((val, i) => ({
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
                            color: '#00FF66',
                            padding: '8px'
                        }}
                        itemStyle={{ color: '#00FF66' }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: 'rgba(0, 255, 102, 0.2)', strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#00FF66"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1500}
                        isAnimationActive={true}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
