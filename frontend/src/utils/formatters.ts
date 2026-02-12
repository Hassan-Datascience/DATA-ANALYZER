/**
 * CYBER-EMERALD FORMATTING UTILITIES
 * Consistent formatting and styling across the dashboard.
 */

/**
 * Formats large numbers into readable strings (K, M)
 * @example 1000 -> 1K, 1000000 -> 1M
 */
export const formatNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`; // Design shows uppercase K
    return value.toString();
};

/**
 * Formats a decimal/number as a percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Returns a Tailwind color class based on the integrity/health score
 */
export const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-spring-green'; // Optimal
    if (score >= 70) return 'text-yellow-400';   // Degraded
    return 'text-red-500';                       // Critical
};

/**
 * Returns CSS classes for a severity badge based on level
 */
export const getSeverityBadge = (severity: string): string => {
    const base = "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border";
    switch (severity.toUpperCase()) {
        case 'CRITICAL':
            return `${base} bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.4)]`;
        case 'HIGH':
            return `${base} bg-orange-500/10 text-orange-500 border-orange-500/30`;
        case 'MEDIUM':
            return `${base} bg-yellow-500/10 text-yellow-500 border-yellow-500/30`;
        case 'LOW':
            return `${base} bg-blue-500/10 text-blue-500 border-blue-500/30`;
        case 'PASS':
        case 'VERIFIED':
            return `${base} bg-spring-green/10 text-spring-green border-spring-green/30 shadow-[0_0_8px_rgba(0,255,102,0.4)]`;
        default:
            return `${base} bg-white/5 text-white/40 border-white/10`;
    }
};

/**
 * Formats timestamps into dashboard style
 * @example ISO String -> "2024-05-21 14:02:11"
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const pad = (num: number) => num.toString().padStart(2, '0');

    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

/**
 * Time relative format for status logs
 * @example "T-08m"
 */
export const formatRelativeTime = (minutes: number): string => {
    if (minutes < 60) return `T-${padZero(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    return `T-${padZero(hours)}h`;
};

const padZero = (n: number) => n < 10 ? `0${n}` : n;
