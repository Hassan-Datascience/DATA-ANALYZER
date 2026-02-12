import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cyber-bg/80 backdrop-blur-md">
            <div
                className="glass-card w-full max-w-2xl rounded-xl border border-spring-green/30 shadow-[0_0_40px_rgba(0,255,102,0.1)] overflow-hidden animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-spring-green/[0.02]">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white font-mono">
                        <span className="text-spring-green mr-2">//</span> {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-spring-green hover:border-spring-green/40 hover:bg-spring-green/10 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                <div className="p-6 border-t border-white/5 flex justify-end bg-black/20">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-spring-green text-cyber-bg rounded shadow-neon hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        Close_Terminal
                    </button>
                </div>
            </div>
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};

export default Modal;
