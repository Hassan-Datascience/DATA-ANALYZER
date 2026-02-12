import React from 'react';
import {
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter,
    Legend
} from 'recharts';
import { DataAnalysis } from '../utils/dataAnalyzer';

interface AutoChartsProps {
    data: any[];
    analysis: DataAnalysis;
}

const COLORS = ['#00FF66', '#3b82f6', '#a855f7', '#eab308', '#ef4444', '#10b981'];

export const AutoCharts: React.FC<AutoChartsProps> = ({ data, analysis }) => {
    if (!analysis || !analysis.columns) return null;

    const renderChart = (type: string) => {
        const numericCols = analysis.columns.filter(c => c.type === 'numeric');
        const categoricalCols = analysis.columns.filter(c => c.type === 'categorical');
        const timeSeriesCol = analysis.columns.find(c => c.isTimeSeries);

        // Limit data for visualization if too large
        const chartData = data.slice(0, 50);

        switch (type) {
            case 'LineChart':
                if (!timeSeriesCol || numericCols.length === 0) return null;
                return (
                    <div className="h-64 w-full glass-card p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-spring-green/40 mb-4 font-mono tracking-widest">Trend Analysis: {numericCols[0].name} over {timeSeriesCol.name}</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey={timeSeriesCol.name} stroke="rgba(255,255,255,0.3)" fontSize={9} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a2010', border: '1px solid rgba(0,255,102,0.2)', fontSize: '10px' }}
                                    itemStyle={{ color: '#00FF66' }}
                                />
                                <Line type="monotone" dataKey={numericCols[0].name} stroke="#00FF66" strokeWidth={2} dot={false} shadow-neon="" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'BarChart':
                if (categoricalCols.length === 0 || numericCols.length === 0) return null;
                return (
                    <div className="h-64 w-full glass-card p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-spring-green/40 mb-4 font-mono tracking-widest">Distribution: {numericCols[0].name} by {categoricalCols[0].name}</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey={categoricalCols[0].name} stroke="rgba(255,255,255,0.3)" fontSize={9} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a2010', border: '1px solid rgba(0,255,102,0.2)', fontSize: '10px' }}
                                />
                                <Bar dataKey={numericCols[0].name} fill="#00FF66" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'PieChart':
                if (categoricalCols.length === 0) return null;
                // Aggregate data for pie
                const counts = data.reduce((acc, row) => {
                    const val = row[categoricalCols[0].name];
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, {} as any);
                const pieData = Object.keys(counts).map(key => ({ name: key, value: counts[key] })).slice(0, 6);

                return (
                    <div className="h-64 w-full glass-card p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-spring-green/40 mb-4 font-mono tracking-widest">{categoricalCols[0].name} Composition</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0a2010', border: '1px solid rgba(0,255,102,0.2)', fontSize: '10px' }} />
                                <Legend wrapperStyle={{ fontSize: '9px', opacity: 0.6 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.suggestedCharts.filter(t => t !== 'Table').map(type => (
                <div key={type} className="w-full">
                    {renderChart(type)}
                </div>
            ))}
        </div>
    );
};

export default AutoCharts;
