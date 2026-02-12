import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

/**
 * FIXED DONUTCHART.TSX
 * Resolving all TypeScript and Recharts property errors.
 */

interface DonutChartProps {
    value?: number;
    label?: string;
    height?: number | string;
}

interface DonutDataItem {
    name: string;
    value: number;
    fill: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ value = 0, label, height = '100%' }) => {
    // Explicit data formatting for RadialBarChart
    const data: DonutDataItem[] = [
        {
            name: 'Progress',
            value: value,
            fill: '#00FF66'
        }
    ];

    return (
        <div className="relative w-full h-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="80%"
                    outerRadius="100%"
                    barSize={10}
                    data={data}
                    startAngle={90}
                    endAngle={450}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background={{ fill: 'rgba(0, 255, 102, 0.05)' }}
                        dataKey="value"
                        cornerRadius={5}
                        animationDuration={1500}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                    {value.toFixed(1)}
                </span>
                {label && (
                    <span className="text-[10px] font-bold tracking-[0.2em] text-spring-green/40 uppercase mt-2">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
};

export default DonutChart;
