import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface IntegrityDonutProps {
    score: number;
    label: string;
}

const IntegrityDonut: React.FC<IntegrityDonutProps> = ({ score, label }) => {
    const data = [{ name: 'Integrity', value: score, fill: '#00FF66' }];

    return (
        <div className="relative w-full h-full flex items-center justify-center">
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
                        background={{ fill: 'rgba(0, 255, 102, 0.1)' }}
                        dataKey="value"
                        cornerRadius={5}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black neon-text">{score.toFixed(1)}</span>
                <span className="text-[10px] font-bold tracking-widest text-spring-green/40 uppercase mt-2">
                    {label}
                </span>
            </div>
        </div>
    );
};

export default IntegrityDonut;
