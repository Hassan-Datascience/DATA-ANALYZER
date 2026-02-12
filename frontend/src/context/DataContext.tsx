import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParsedData } from '../utils/fileParser';

interface DataContextType {
    uploadedData: ParsedData | null;
    analysis: any | null;
    setUploadedData: (data: ParsedData | null) => void;
    setAnalysis: (analysis: any | null) => void;
    clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploadedData, setUploadedData] = useState<ParsedData | null>(null);
    const [analysis, setAnalysis] = useState<any | null>(null);

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
