import React from 'react'

/**
 * FIXED STATCARD.TSX
 * Resolving all 9+ errors relating to Tailwind merging and child element typing.
 */

interface StatCardProps {
    title: string
    value: string | number
    suffix?: string
    trend?: React.ReactNode
    icon?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    suffix,
    trend,
    icon,
    children,
    className = ""
}) => {
    return (
        <div className={`glass-card p-6 rounded-xl relative overflow-hidden group ${className}`}>
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-spring-green/40 font-mono">
                    {title}
                </h3>
                {icon && (
                    <div className="w-9 h-9 glass-card rounded-lg flex items-center justify-center text-spring-green border-spring-green/20">
                        {icon}
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white tracking-tighter transition-all group-hover:text-spring-green group-hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
                    {value}
                </span>
                {suffix && <span className="text-sm font-mono text-spring-green/40">{suffix}</span>}
            </div>
            {trend && <div className="mt-1">{trend}</div>}
            {children && (
                <div className="mt-6">
                    {children}
                </div>
            )}
        </div>
    )
}

export default StatCard
