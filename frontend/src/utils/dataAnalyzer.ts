export interface ColumnAnalysis {
    name: string;
    type: 'numeric' | 'date' | 'categorical' | 'text';
    stats: {
        min?: number;
        max?: number;
        avg?: number;
        sum?: number;
        uniqueValues?: number;
        missingValues: number;
    };
    isTimeSeries: boolean;
}

export interface DataAnalysis {
    columns: ColumnAnalysis[];
    totalRows: number;
    anomalies: string[];
    suggestedCharts: string[];
}

/**
 * DATA ANALYZER UTILITY
 * Performs deep analysis on structured data streams.
 */
export const analyzeData = (rows: any[], headers: string[]): DataAnalysis => {
    const totalRows = rows.length;
    const columns: ColumnAnalysis[] = [];
    const anomalies: string[] = [];

    headers.forEach(header => {
        const values = rows.map(r => r[header]).filter(v => v !== undefined && v !== null);
        const missingValues = totalRows - values.length;

        // 1. TYPE DETECTION
        let type: ColumnAnalysis['type'] = 'text';
        const numericValues = values.filter(v => typeof v === 'number' || (!isNaN(parseFloat(v)) && isFinite(v)));
        const dateValues = values.filter(v => !isNaN(Date.parse(v)) && typeof v === 'string' && v.length > 5);

        if (numericValues.length > values.length * 0.8) {
            type = 'numeric';
        } else if (dateValues.length > values.length * 0.8) {
            type = 'date';
        } else if (new Set(values).size < values.length * 0.2) {
            type = 'categorical';
        }

        // 2. STATS CALCULATION
        const stats: ColumnAnalysis['stats'] = { missingValues };
        if (type === 'numeric' && values.length > 0) {
            const numbers = values.map(v => typeof v === 'number' ? v : parseFloat(v)).filter(n => !isNaN(n));
            if (numbers.length > 0) {
                stats.min = numbers.reduce((a, b) => Math.min(a, b), numbers[0]);
                stats.max = numbers.reduce((a, b) => Math.max(a, b), numbers[0]);
                stats.sum = numbers.reduce((a, b) => a + b, 0);
                stats.avg = stats.sum / numbers.length;
            }
        }
        stats.uniqueValues = new Set(values).size;

        // 3. ANOMALY DETECTION (Basic)
        if (missingValues > totalRows * 0.1) {
            anomalies.push(`High missing values density in [${header}]`);
        }

        columns.push({
            name: header,
            type,
            stats,
            isTimeSeries: type === 'date' || (type === 'numeric' && header.toLowerCase().includes('year'))
        });
    });

    // 4. CHART SUGGESTIONS
    const suggestedCharts: string[] = ['Table'];
    const hasTimeSeries = columns.some(c => c.isTimeSeries);
    const numericCols = columns.filter(c => c.type === 'numeric');
    const categoricalCols = columns.filter(c => c.type === 'categorical');

    if (hasTimeSeries && numericCols.length > 0) suggestedCharts.push('LineChart');
    if (categoricalCols.length > 0 && numericCols.length > 0) suggestedCharts.push('BarChart');
    if (categoricalCols.length > 0) suggestedCharts.push('PieChart');
    if (numericCols.length >= 2) suggestedCharts.push('ScatterPlot');

    return {
        columns,
        totalRows,
        anomalies,
        suggestedCharts
    };
};
