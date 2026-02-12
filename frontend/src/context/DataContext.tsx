import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParsedData } from '../utils/fileParser';

export interface AnalysisResult {
    columns: Array<{
        name: string;
        type: string;
        stats: Record<string, any>;
        isTimeSeries: boolean;
    }>;
    totalRows: number;
    anomalies: string[];
    suggestedCharts: string[];
    reliability_score: number;
    anomaly_rate?: number;  // Percentage of rows with anomalies
}

interface DataContextType {
    uploadedData: ParsedData | null;
    analysis: AnalysisResult | null;
    setUploadedData: (data: ParsedData | null) => void;
    setAnalysis: (analysis: AnalysisResult | null) => void;
    clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploadedData, setUploadedData] = useState<ParsedData | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const clearData = React.useCallback(() => {
        setUploadedData(null);
        setAnalysis(null);
    }, []);

    const contextValue = React.useMemo(() => ({
        uploadedData,
        analysis,
        setUploadedData,
        setAnalysis,
        clearData
    }), [uploadedData, analysis, clearData]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
