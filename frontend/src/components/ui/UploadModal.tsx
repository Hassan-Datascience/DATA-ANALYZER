import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2, Table as TableIcon } from 'lucide-react';
import Modal from './Modal';
import { parseFile, ParsedData } from '../../utils/fileParser';
import { analyzeData } from '../../utils/dataAnalyzer';
import { useData } from '../../context/DataContext';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
    const { setUploadedData, setAnalysis } = useData();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [previewData, setPreviewData] = useState<ParsedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setIsComplete(false);
            setProgress(0);

            try {
                const parsed = await parseFile(selectedFile);
                setPreviewData(parsed);
            } catch (err: any) {
                setError(err.message || "Failed to parse file");
                setFile(null);
            }
        }
    };

    const handleUpload = () => {
        if (!file || !previewData) return;
        setIsUploading(true);
        setError(null);

        // Simulate upload/analysis progress
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 30;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);

                try {
                    // Finalize data and analysis
                    const analysisResults = analyzeData(previewData.rows, previewData.headers);
                    setUploadedData(previewData);
                    setAnalysis(analysisResults);

                    setIsUploading(false);
                    setIsComplete(true);
                } catch (err) {
                    setError("Analysis engine failed to process data structure.");
                    setIsUploading(false);
                }
            }
            setProgress(p);
        }, 300);
    };

    const reset = () => {
        setFile(null);
        setIsUploading(false);
        setProgress(0);
        setIsComplete(false);
        setPreviewData(null);
        setError(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { onClose(); reset(); }}
            title="Import Data Workspace"
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {!file ? (
                    <div className="border-2 border-dashed border-spring-green/20 rounded-xl p-12 flex flex-col items-center justify-center bg-spring-green/[0.02] group hover:border-spring-green/40 transition-all cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            accept=".csv,.json,.xlsx"
                        />
                        <Upload className="w-12 h-12 text-spring-green/40 mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-white font-bold mb-1 uppercase tracking-tighter">Drag and drop workspace</p>
                        <p className="text-[10px] text-spring-green/40 uppercase tracking-widest">Supports CSV, JSON, Excel (.xlsx)</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 glass-card rounded-lg flex items-center justify-between border border-spring-green/20">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-spring-green/10 rounded">
                                    <FileText className="w-6 h-6 text-spring-green" />
                                </div>
                                <div className="">
                                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[9px] text-spring-green/40 uppercase tracking-widest">
                                        {(file.size / 1024).toFixed(1)} KB // {previewData?.metadata.rowCount || 0} ROWS
                                    </p>
                                </div>
                            </div>
                            {!isUploading && !isComplete && (
                                <button onClick={() => setFile(null)} className="text-white/40 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            {isComplete && <CheckCircle2 className="w-6 h-6 text-spring-green shadow-neon" />}
                        </div>

                        {/* DATA PREVIEW */}
                        {previewData && !isUploading && !isComplete && (
                            <div className="bg-black/20 rounded border border-white/5 overflow-hidden">
                                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 bg-white/5">
                                    <TableIcon className="w-3 h-3 text-spring-green" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Data Preview (Sample)</span>
                                </div>
                                <div className="overflow-x-auto max-h-32">
                                    <table className="w-full text-[8px] font-mono text-white/60">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                {previewData.headers.slice(0, 4).map(h => (
                                                    <th key={h} className="p-2 text-left uppercase text-spring-green/40">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.rows.slice(0, 3).map((row, i) => (
                                                <tr key={i} className="border-b border-white/5">
                                                    {previewData.headers.slice(0, 4).map(h => (
                                                        <td key={h} className="p-2 truncate max-w-[80px]">{String(row[h])}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="space-y-4 py-4">
                                <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-spring-green">
                                    <span className="flex items-center gap-2 italic">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Analyzing_Data_Streams...
                                    </span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-spring-green shadow-neon transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {!isUploading && !isComplete && (
                            <button
                                onClick={handleUpload}
                                className="w-full py-4 bg-spring-green text-cyber-bg font-black uppercase tracking-[0.2em] text-xs rounded shadow-neon hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Execute_Ingestion
                            </button>
                        )}

                        {isComplete && (
                            <div className="space-y-4">
                                <div className="p-4 bg-spring-green/10 border border-spring-green/20 rounded text-center">
                                    <p className="text-[10px] font-black text-spring-green uppercase tracking-[0.3em] mb-1">Data stream ingested successfully</p>
                                    <p className="text-[8px] text-spring-green/40 uppercase tracking-widest italic">Intelligence engine has completed analysis</p>
                                </div>
                                <button
                                    onClick={() => { onClose(); reset(); }}
                                    className="w-full py-4 border border-spring-green/40 text-spring-green font-black uppercase tracking-[0.2em] text-xs rounded hover:bg-spring-green/10 transition-all font-mono"
                                >
                                    Access Analysis Hub
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UploadModal;
