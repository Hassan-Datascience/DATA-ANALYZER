import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

interface PulseBarChartProps {
    data: number[];
}

const PulseBarChart: React.FC<PulseBarChartProps> = ({ data }) => {
    const chartData = data.map((val, i) => ({ id: i, value: val }));

    return (
        <div className="w-full h-24 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="#00FF66"
                                fillOpacity={0.2 + (index / chartData.length) * 0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PulseBarChart;
