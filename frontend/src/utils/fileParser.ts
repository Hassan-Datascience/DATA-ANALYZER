import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedData {
    headers: string[];
    rows: any[];
    metadata: {
        filename: string;
        size: number;
        type: string;
        rowCount: number;
        columnCount: number;
    };
}

/**
 * FILE PARSER UTILITY
 * Handles CSV, JSON, and Excel ingestion for the Data Analyzer.
 */
export const parseFile = async (file: File): Promise<ParsedData> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    return new Promise((resolve, reject) => {
        const metadata = {
            filename: file.name,
            size: file.size,
            type: file.type || 'unknown',
            rowCount: 0,
            columnCount: 0
        };

        if (extension === 'csv') {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as any[];
                    const headers = results.meta.fields || [];
                    resolve({
                        headers,
                        rows,
                        metadata: {
                            ...metadata,
                            rowCount: rows.length,
                            columnCount: headers.length
                        }
                    });
                },
                error: (err) => reject(new Error(`CSV Parsing Error: ${err.message}`))
            });
        }
        else if (extension === 'json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    const rows = Array.isArray(json) ? json : [json];
                    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
                    resolve({
                        headers,
                        rows,
                        metadata: {
                            ...metadata,
                            rowCount: rows.length,
                            columnCount: headers.length
                        }
                    });
                } catch (err) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsText(file);
        }
        else if (extension === 'xlsx' || extension === 'xls') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    const headers = json.length > 0 ? Object.keys(json[0] as object) : [];
                    resolve({
                        headers,
                        rows: json,
                        metadata: {
                            ...metadata,
                            rowCount: json.length,
                            columnCount: headers.length
                        }
                    });
                } catch (err) {
                    reject(new Error('Excel Parsing Error'));
                }
            };
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsArrayBuffer(file);
        }
        else {
            reject(new Error(`Unsupported file type: .${extension}`));
        }
    });
};
